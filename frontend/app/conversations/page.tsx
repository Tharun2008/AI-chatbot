"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { getConversations, updateConversationStatus } from "@/lib/api";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  customer_phone: string;
  status: string;
  created_at: string;
  messages: Message[];
}

export default function ConversationsPage() {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId]);

  async function fetchConversations() {
    try {
      const data = await getConversations(userId!);
      setConversations(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id: string) {
    if (!userId) return;
    await updateConversationStatus(id, "resolved", userId);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "resolved" } : c))
    );
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, status: "resolved" } : null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Inbox"
        title="Conversations"
        description="WhatsApp threads handled by your AI assistant."
      />

      <section className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-950">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No conversations yet. Messages will appear here once customers contact you on WhatsApp.
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                    selected?.id === conv.id ? "bg-slate-50 border-l-2 border-l-slate-950" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-slate-950 text-sm truncate">
                      {conv.customer_phone}
                    </p>
                    <span
                      className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                        conv.status === "open"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {conv.messages?.length ?? 0} messages ·{" "}
                    {new Date(conv.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-950">{selected.customer_phone}</p>
                  <p className="text-xs text-slate-400">
                    Started {new Date(selected.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                {selected.status === "open" && (
                  <button
                    onClick={() => handleResolve(selected.id)}
                    className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selected.messages?.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm mt-8">No messages yet</p>
                ) : (
                  selected.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-slate-100 text-slate-950 rounded-tl-sm"
                            : "bg-slate-950 text-white rounded-tr-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <svg className="h-10 w-10 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
              </svg>
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}