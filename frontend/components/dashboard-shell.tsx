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
    </div>
  );
}
