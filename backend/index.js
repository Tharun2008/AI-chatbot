import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { createRequire } from "module";
import twilio from "twilio";

const require = createRequire(import.meta.url);
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default ?? pdfParseLib;

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const upload = multer({ storage: multer.memoryStorage() });

// ── Helpers ──

async function getEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.embedding.values;
}

async function generateAIReply(systemPrompt, context, question, history = []) {
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [
        {
          text: `${systemPrompt}\n\nContext:\n${context}\n\nCustomer question: ${question}`,
        },
      ],
    },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.candidates[0].content.parts[0].text;
}

async function getCompanyId(clerkUserId) {
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();
  if (error || !data) throw new Error("Company not found for user");
  return data.id;
}

async function sendWhatsAppMessage(to, body) {
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: toFormatted,
    body,
  });
}

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ status: "SwiftlyAI backend running" });
});

// ── Twilio WhatsApp webhook ──
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const customerPhone = req.body?.From?.replace("whatsapp:", "");
    const customerText = req.body?.Body;

    if (!customerPhone || !customerText) return;

    console.log(`Message from ${customerPhone}: ${customerText}`);

    // Look up company
    const { data: company } = await supabase
      .from("companies")
      .select("id, system_prompt")
      .eq("clerk_user_id", process.env.DEFAULT_CLERK_USER_ID)
      .single();

    const companyId = company?.id ?? null;
    const systemPrompt = company?.system_prompt ??
      "You are a helpful WhatsApp customer support assistant. Answer ONLY using the context provided. If the answer is not in the context, say: 'I don't have that information right now. A team member will assist you shortly.' Keep replies concise and friendly. Do not use asterisks or markdown formatting.";

    // 1. Embed the customer's question
    const queryEmbedding = await getEmbedding(customerText);

    let replyText;
    if (companyId) {
      // Fetch existing conversation history
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id, messages(*)")
        .eq("customer_phone", customerPhone)
        .eq("company_id", companyId)
        .maybeSingle();

      // Get last 10 messages sorted by time
      const history = existingConv?.messages
        ?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        ?.slice(-10) ?? [];

      console.log(`[history-debug] phone=${customerPhone} companyId=${companyId} historyLength=${history.length}`);

      // 2. Search knowledge base
      const { data: chunks, error: searchError } = await supabase.rpc(
        "match_chunks",
        {
          query_embedding: queryEmbedding,
          match_count: 5,
          filter_company_id: companyId,
        }
      );

      if (searchError) console.error("Search error:", searchError);

      const context = chunks?.map((c) => c.content).join("\n\n") ?? "";

      // 3. Generate AI reply with history
      if (!context.trim()) {
        replyText =
          "I couldn't find that information. A team member will assist you shortly.";
      } else {
        replyText = await generateAIReply(systemPrompt, context, customerText, history);
      }
    } else {
      replyText = "This number is not configured yet. Please contact support.";
    }

    // 4. Send reply via Twilio
    await sendWhatsAppMessage(customerPhone, replyText);

    // 5. Save conversation + messages
    if (companyId) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .upsert(
          {
            customer_phone: customerPhone,
            status: "open",
            company_id: companyId,
          },
          { onConflict: "customer_phone,company_id" }
        )
        .select()
        .single();

      if (convError) {
        console.error("Conversation upsert error:", convError);
        return;
      }

      console.log(`[history-debug] using conversation_id=${conv.id}`);

      await supabase.from("messages").insert([
        { conversation_id: conv.id, role: "user", content: customerText },
        { conversation_id: conv.id, role: "assistant", content: replyText },
      ]);
    }

    console.log(`Replied to ${customerPhone}: ${replyText}`);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});

// ── Test AI response ──
app.post("/api/test-ai", async (req, res) => {
  const { question, clerk_user_id } = req.body;
  if (!question || !clerk_user_id) {
    return res.status(400).json({ error: "Missing question or clerk_user_id" });
  }

  try {
    const companyId = await getCompanyId(clerk_user_id);

    const { data: company } = await supabase
      .from("companies")
      .select("system_prompt")
      .eq("id", companyId)
      .single();

    const systemPrompt = company?.system_prompt ??
      "You are a helpful WhatsApp customer support assistant. Answer ONLY using the context provided. If the answer is not in the context, say: 'I don't have that information right now. A team member will assist you shortly.' Keep replies concise and friendly.";

    const queryEmbedding = await getEmbedding(question);

    const { data: chunks } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_count: 5,
      filter_company_id: companyId,
    });

    const context = chunks?.map((c) => c.content).join("\n\n") ?? "";

    if (!context.trim()) {
      return res.json({
        answer: "I couldn't find that information in the knowledge base.",
        context_found: false,
        chunks_used: 0,
      });
    }

    const answer = await generateAIReply(systemPrompt, context, question);

    res.json({
      answer,
      context_found: true,
      chunks_used: chunks.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sync or create company ──
app.post("/api/company/sync", async (req, res) => {
  const { clerk_user_id, business_name } = req.body;
  if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

  const { data, error } = await supabase
    .from("companies")
    .upsert(
      { clerk_user_id, business_name: business_name || "My Business" },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Get company by clerk user id ──
app.get("/api/company/:clerk_user_id", async (req, res) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("clerk_user_id", req.params.clerk_user_id)
    .single();

  if (error) return res.status(404).json({ error: "Company not found" });
  res.json(data);
});

// ── Get all documents (scoped by company) ──
app.get("/api/documents", async (req, res) => {
  const { clerk_user_id } = req.query;
  if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

  try {
    const companyId = await getCompanyId(clerk_user_id);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ── Upload document (scoped by company) ──
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const clerk_user_id = req.body.clerk_user_id;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

    const companyId = await getCompanyId(clerk_user_id);

    let text = "";
    if (file.mimetype === "application/pdf") {
      const parsed = await pdfParse(file.buffer);
      text = parsed.text;
    } else {
      text = file.buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return res.status(400).json({ error: "Could not extract text from file" });
    }

    const chunks = [];
    const chunkSize = 500;
    const overlap = 50;
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize).trim();
      if (chunk.length > 20) chunks.push(chunk);
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ name: file.originalname, type: file.mimetype, company_id: companyId })
      .select()
      .single();

    if (docError) return res.status(500).json({ error: docError.message });

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      await supabase.from("document_chunks").insert({
        document_id: doc.id,
        company_id: companyId,
        content: chunk,
        embedding,
      });
    }

    res.json({ success: true, document: doc, chunks_embedded: chunks.length });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Delete document (scoped by company) ──
app.delete("/api/documents/:id", async (req, res) => {
  const { clerk_user_id } = req.query;
  if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

  try {
    const companyId = await getCompanyId(clerk_user_id);
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", req.params.id)
      .eq("company_id", companyId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ── Get conversations (scoped by company) ──
app.get("/api/conversations", async (req, res) => {
  const { clerk_user_id } = req.query;
  if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

  try {
    const companyId = await getCompanyId(clerk_user_id);
    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ── Update conversation status ──
app.patch("/api/conversations/:id", async (req, res) => {
  const { status, clerk_user_id } = req.body;
  if (!clerk_user_id) return res.status(400).json({ error: "Missing clerk_user_id" });

  try {
    const companyId = await getCompanyId(clerk_user_id);
    const { data, error } = await supabase
      .from("conversations")
      .update({ status })
      .eq("id", req.params.id)
      .eq("company_id", companyId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`SwiftlyAI backend running on port ${process.env.PORT || 5000}`)
);