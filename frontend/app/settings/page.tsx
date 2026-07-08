"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";

export default function Settings() {
  const [businessName, setBusinessName] = useState("SwiftlyAI Chatbot for WhatsApp");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("settings_businessName");
    const savedNumber = localStorage.getItem("settings_whatsappNumber");
    if (savedName) setBusinessName(savedName);
    if (savedNumber) setWhatsappNumber(savedNumber);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("settings_businessName", businessName);
    localStorage.setItem("settings_whatsappNumber", whatsappNumber);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
              placeholder="+91 90000 00000"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
            {saved && (
              <span className="text-sm font-medium text-emerald-600">
                ✓ Settings saved
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
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