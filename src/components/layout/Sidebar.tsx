"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Tags,
  FileText,
  Wallet,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Budgets & Limits", href: "/budgets", icon: PieChart },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Reports & Export", href: "/reports", icon: FileText },
];

export function Sidebar({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight">SmartSpend</span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
            Financial Analytics
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
            {getInitials(session?.user?.name || session?.user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {session?.user?.name || "Demo User"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {session?.user?.email || "demo@example.com"}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
