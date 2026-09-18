"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionModalProvider } from "@/components/providers/TransactionModalProvider";
import { X } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <TransactionModalProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-slate-950 z-10 shadow-2xl">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Navbar onOpenMobile={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>

        {/* Global Transaction Add/Edit Modal */}
        <TransactionModal />
      </div>
    </TransactionModalProvider>
  );
}
