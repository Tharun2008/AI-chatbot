"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export function TopNavbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            SwiftlyAI Chatbot for WhatsApp
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            {user ? `Logged in as ${user.emailAddresses[0]?.emailAddress}` : "Production dashboard"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a5 5 0 0 0-5 5v2.5c0 .9-.3 1.78-.85 2.5L3.3 13.13A1 1 0 0 0 4.1 14.7h11.8a1 1 0 0 0 .8-1.57L15.85 12A4.08 4.08 0 0 1 15 9.5V7a5 5 0 0 0-5-5Zm-2 14a2 2 0 0 0 4 0H8Z" />
            </svg>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          <UserButton/>
        </div>
      </div>
    </header>
  );
}