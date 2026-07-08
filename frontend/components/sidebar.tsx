"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import type { NavItem } from "@/types/dashboard";

type SidebarProps = {
  variant?: "desktop" | "mobile";
};

function classNames(...classes: Array<string | false>) {
  return classes.filter(Boolean).join(" ");
}

function NavIcon({ icon }: Pick<NavItem, "icon">) {
  const baseClass = "h-5 w-5";

  if (icon === "dashboard") {
    return (
      <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm8 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4ZM3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Zm8-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6Z" />
      </svg>
    );
  }

  if (icon === "knowledge") {
    return (
      <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 0 0-2 2v11.25c0 .41.47.65.8.4l1.7-1.27 1.7 1.27a.5.5 0 0 0 .6 0l1.7-1.27 1.7 1.27a.5.5 0 0 0 .6 0l1.7-1.27 1.7 1.27c.33.25.8.01.8-.4V5a2 2 0 0 0-2-2H5Zm2 4.25h6a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1 0-1.5Zm0 3h4a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1 0-1.5Z" />
      </svg>
    );
  }

  if (icon === "conversations") {
    return (
      <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9.8L6 14v-3H7a3 3 0 0 1-3-3V4Zm-2 8a3 3 0 0 0 3 3h1v3l3.8-3H13a3 3 0 0 0 2.82-2H8.95L4.5 16.5V13H5a5 5 0 0 1-5-5v4Z" />
      </svg>
    );
  }

  return (
    <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M11.49 2.17a1.75 1.75 0 0 0-2.98 0l-.33.55a1.75 1.75 0 0 1-1.94.8l-.62-.15a1.75 1.75 0 0 0-2.1 2.1l.15.62c.17.7-.14 1.43-.8 1.94l-.55.33a1.75 1.75 0 0 0 0 2.98l.55.33c.66.51.97 1.24.8 1.94l-.15.62a1.75 1.75 0 0 0 2.1 2.1l.62-.15c.7-.17 1.43.14 1.94.8l.33.55a1.75 1.75 0 0 0 2.98 0l.33-.55c.51-.66 1.24-.97 1.94-.8l.62.15a1.75 1.75 0 0 0 2.1-2.1l-.15-.62c-.17-.7.14-1.43.8-1.94l.55-.33a1.75 1.75 0 0 0 0-2.98l-.55-.33a1.75 1.75 0 0 1-.8-1.94l.15-.62a1.75 1.75 0 0 0-2.1-2.1l-.62.15a1.75 1.75 0 0 1-1.94-.8l-.33-.55ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function NavigationLinks({ variant }: Required<SidebarProps>) {
  const pathname = usePathname();

  return (
    <nav
      className={classNames(
        variant === "desktop"
          ? "space-y-2"
          : "flex gap-2 overflow-x-auto px-4 py-3"
      )}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={classNames(
              "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ variant = "desktop" }: SidebarProps) {
  if (variant === "mobile") {
    return (
      <div className="border-b border-slate-200 bg-white lg:hidden">
        <NavigationLinks variant="mobile" />
      </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
          AI
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">
            SwiftlyAI Chatbot
          </p>
          <p className="text-xs text-slate-500">for WhatsApp</p>
        </div>
      </Link>

      <NavigationLinks variant="desktop" />
    </aside>
  );
}
