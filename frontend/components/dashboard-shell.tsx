import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar />
        <Sidebar variant="mobile" />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <div className="fixed bottom-6 left-7.5 z-40 rounded-full bg-slate-950/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
        Call +91 9840345889 for assistance
      </div>
    </div>
  );
}