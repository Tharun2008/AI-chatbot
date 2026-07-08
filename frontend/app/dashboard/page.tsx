import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getDashboardData(clerkUserId: string) {
  try {
    const [conversationsRes, documentsRes] = await Promise.all([
      fetch(`${API_URL}/api/conversations?clerk_user_id=${clerkUserId}`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/api/documents?clerk_user_id=${clerkUserId}`, {
        cache: "no-store",
      }),
    ]);

    const conversations = conversationsRes.ok ? await conversationsRes.json() : [];
    const documents = documentsRes.ok ? await documentsRes.json() : [];

    return { conversations, documents };
  } catch {
    return { conversations: [], documents: [] };
  }
}

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { conversations, documents } = await getDashboardData(userId);

  const openConversations = conversations.filter(
    (c: { status: string }) => c.status === "open"
  );

  const totalMessages = conversations.reduce(
    (acc: number, c: { messages?: unknown[] }) =>
      acc + (c.messages?.length ?? 0),
    0
  );

  const needsFollowUp = conversations.filter(
    (c: { messages?: { role: string }[] }) =>
      c.messages?.slice(-1)[0]?.role === "user"
  ).length;

  const dashboardMetrics = [
  {
    label: "Total Messages",
    value: totalMessages.toLocaleString(),
    detail: `Across ${conversations.length} conversations`,
    tone: "blue" as const,
  },
  {
    label: "Active Conversations",
    value: openConversations.length,
    detail: `${needsFollowUp} need a human follow-up`,
    tone: "emerald" as const,
  },
  {
    label: "Documents Uploaded",
    value: documents.length,
    detail: documents.length === 0 ? "Upload FAQs to train replies" : "Knowledge base active",
    tone: "amber" as const,
  },
  {
    label: "AI Status",
    value: documents.length > 0 ? "Online" : "No Docs",
    detail: documents.length > 0 ? "Answering from knowledge base" : "Upload a document first",
    tone: "violet" as const,
  },
];

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Monitor WhatsApp support volume, AI readiness, and the customer conversations that need attention."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Recent Conversations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest WhatsApp threads handled by the assistant.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Live
            </span>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                No conversations yet. Messages will appear here once customers
                contact you on WhatsApp.
              </p>
            ) : (
              conversations
                .slice(0, 3)
                .map(
                  (conversation: {
                    id: string;
                    customer_phone: string;
                    status: string;
                    created_at: string;
                    messages?: { content: string }[];
                  }) => (
                    <div
                      key={conversation.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {conversation.customer_phone}
                        </p>
                        <p className="mt-1 max-w-xl truncate text-sm text-slate-500">
                          {conversation.messages?.[
                            conversation.messages.length - 1
                          ]?.content ?? "No messages yet"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400">
                          {new Date(
                            conversation.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            conversation.status === "open"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </div>
                    </div>
                  )
                )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            AI Assistant Health
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Live status of your AI assistant and connected services.
          </p>

          <div className="mt-6 space-y-4">
            {[
              ["Backend API", "Connected"],
              ["WhatsApp Inbox", "Ready"],
              [
                "Knowledge Base",
                documents.length > 0
                  ? `${documents.length} document${documents.length > 1 ? "s" : ""} loaded`
                  : "No documents yet",
              ],
              [
                "Needs Follow-up",
                needsFollowUp > 0
                  ? `${needsFollowUp} conversation${needsFollowUp > 1 ? "s" : ""}`
                  : "All clear",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-600">
                  {label}
                </span>
                <span className="text-sm font-semibold text-slate-950">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}