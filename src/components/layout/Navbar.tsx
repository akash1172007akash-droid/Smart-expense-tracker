"use client";

import React from "react";
import { Menu, Plus, Sparkles } from "lucide-react";
import { Button } from "@/ui/Button";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { useSession } from "next-auth/react";

export function Navbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { openAddModal } = useTransactionModal();
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Welcome back, {session?.user?.name ? session.user.name.split(" ")[0] : "Alex"}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Track, analyze, and optimize your personal cash flow
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={openAddModal}
          size="sm"
          className="rounded-xl font-medium shadow-indigo-600/30 shadow-md"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Transaction</span>
        </Button>
      </div>
    </header>
  );
}
