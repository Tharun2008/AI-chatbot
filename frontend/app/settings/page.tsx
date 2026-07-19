"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { getCompany, syncCompany } from "@/lib/api";

export default function Settings() {
  const { userId } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const company = await getCompany(userId);
        setBusinessName(company?.business_name ?? "My Business");
        setWhatsappNumber(company?.twilio_whatsapp_number ?? "");
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Couldn't load your current settings. You can still edit and save below.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await syncCompany(userId, businessName, whatsappNumber);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Couldn't save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Configure the business identity that will power the WhatsApp AI assistant."
      />

      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Business Settings
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Configure your business details for the WhatsApp AI assistant.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="businessName">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="whatsappNumber">
              WhatsApp Number
            </label>
            <input
              id="whatsappNumber"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              disabled={loading}
              placeholder="whatsapp:+14155238886"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-slate-400">
              This must exactly match the "To" number Twilio sends for this tenant, including the
              "whatsapp:" prefix — it's how incoming messages get routed to this business.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
            {saved && (
              <span className="text-sm font-medium text-emerald-600">
                ✓ Settings saved
              </span>
            )}
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </section>
    </DashboardShell>
  );
}