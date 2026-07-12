"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { getConversations, updateConversationStatus, clearAllConversations } from "@/lib/api";

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
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId]);

  async function fetchConversations() {
    setError(null);
    try {
      const data = await getConversations(userId!);
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Couldn't load conversations. Please refresh, or check that the backend is running.");
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

  async function handleClearAll() {
    if (!userId) return;
    setClearing(true);
    try {
      await clearAllConversations(userId);
      setConversations([]);
      setSelected(null);
      setShowClearConfirm(false);
      // Force a fresh fetch on the server-rendered dashboard so its
      // metrics (conversation count, human follow-up, etc.) reset to 0.
      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to clear conversations:", err);
      setError("Couldn't clear conversations. Please try again.");
      setShowClearConfirm(false);
    } finally {
      setClearing(false);
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
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-950">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
            {conversations.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {error ? (
              <div className="p-4 m-4 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            ) : loading ? (
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

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-950">
              Clear all conversations?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This permanently deletes all {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""} and their message history for
              this account. This can't be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {clearing ? "Clearing..." : "Yes, clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}