import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Financial Intelligence & Budget Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Master Your Finances with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Precision & Real-Time Analytics
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Track expenses and income, enforce automated category budgets, forecast spending trajectories, and export audit-ready financial statements.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Launch Dashboard (Try Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span>Create New Account</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Visual Cash Flow & Trajectory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive dual-series cash flow charts, category breakdown donut charts, and cumulative burn-rate pacing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Automated Budget Warning Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set monthly category allowances with dynamic progress bars and automated warning badges at 80% and over-budget states.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Statements & CSV Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate formatted RFC 4180 CSV exports and printable monthly financial statements with executive KPI overviews.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 SmartSpend. Full-Stack Portfolio Application built with Next.js App Router, Prisma & TypeScript.</p>
      </footer>
    </div>
  );
}
