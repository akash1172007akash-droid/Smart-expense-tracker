"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TimeframeSelector, TimeframeOption } from "@/components/dashboard/TimeframeSelector";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { SpendingTrajectoryChart } from "@/components/dashboard/SpendingTrajectoryChart";
import { BudgetHealthOverview } from "@/components/dashboard/BudgetHealthOverview";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { AnalyticsResponse, TransactionItem } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { refreshKey } = useTransactionModal();
  const [timeframe, setTimeframe] = useState<TimeframeOption>("this_month");
  const [customStart, setCustomStart] = useState<string | undefined>();
  const [customEnd, setCustomEnd] = useState<string | undefined>();

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ timeframe });
      if (timeframe === "custom" && customStart && customEnd) {
        params.set("startDate", customStart);
        params.set("endDate", customEnd);
      }

      const [analyticsRes, txRes] = await Promise.all([
        fetch(`/api/analytics?${params.toString()}`),
        fetch("/api/transactions?limit=6"),
      ]);

      const analyticsData = await analyticsRes.json();
      const txData = await txRes.json();

      if (analyticsRes.ok) setAnalytics(analyticsData);
      if (txRes.ok) setRecentTransactions(txData.transactions || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, customStart, customEnd]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  const handleTimeframeChange = (
    newTf: TimeframeOption,
    start?: string,
    end?: string
  ) => {
    setTimeframe(newTf);
    if (start && end) {
      setCustomStart(start);
      setCustomEnd(end);
    }
  };

  const summary = analytics?.summary;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Financial Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cash flow overview, category allocations, and spending trajectory.
          </p>
        </div>

        <TimeframeSelector
          current={timeframe}
          onChange={handleTimeframeChange}
          startDate={customStart}
          endDate={customEnd}
        />
      </div>

      {isLoading && !analytics ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Computing financial analytics...</p>
        </div>
      ) : (
        <>
          {/* Main KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Inflow (Income)"
              amount={summary?.totalIncome || 0}
              icon={TrendingUp}
              variant="success"
              subtitle="All earned inflows"
            />
            <KPICard
              title="Total Outflow (Expense)"
              amount={summary?.totalExpenses || 0}
              icon={TrendingDown}
              variant="danger"
              subtitle="All recorded expenses"
            />
            <KPICard
              title="Net Cash Savings"
              amount={summary?.netSavings || 0}
              icon={PiggyBank}
              variant={
                (summary?.netSavings || 0) >= 0 ? "default" : "danger"
              }
              subtitle={
                (summary?.netSavings || 0) >= 0
                  ? "Surplus saved"
                  : "Deficit incurred"
              }
            />
            <KPICard
              title="Savings Rate"
              amount={summary?.savingsRate || 0}
              isCurrency={false}
              icon={Percent}
              variant={
                (summary?.savingsRate || 0) >= 20 ? "success" : "warning"
              }
              trendText={
                (summary?.savingsRate || 0) >= 20 ? "Target Met" : "Below 20%"
              }
              subtitle="Share of income preserved"
            />
          </div>

          {/* Secondary Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block">Avg Daily Spend</span>
              <strong className="text-base text-slate-200">
                ${(summary?.dailyAverageSpend || 0).toFixed(2)} / day
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Transactions Count</span>
              <strong className="text-base text-slate-200">
                {summary?.transactionCount || 0} records
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Active Budgets</span>
              <strong className="text-base text-slate-200">
                {analytics?.budgetHealth.length || 0} categories
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Budget Status</span>
              <strong
                className={`text-base ${
                  analytics?.budgetHealth.some((b) => b.status === "OVER_BUDGET")
                    ? "text-rose-400"
                    : analytics?.budgetHealth.some((b) => b.status === "WARNING")
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {analytics?.budgetHealth.some((b) => b.status === "OVER_BUDGET")
                  ? "Alerts Triggered"
                  : analytics?.budgetHealth.some((b) => b.status === "WARNING")
                  ? "Warnings Active"
                  : "Healthy Pace"}
              </strong>
            </div>
          </div>

          {/* Charts Row 1: Cash Flow & Expense Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CashFlowChart data={analytics?.cashFlow || []} />
            </div>
            <div className="lg:col-span-1">
              <CategoryPieChart data={analytics?.categoryBreakdown || []} />
            </div>
          </div>

          {/* Charts Row 2: Trajectory & Budget Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrajectoryChart data={analytics?.trajectory || []} />
            <BudgetHealthOverview budgets={analytics?.budgetHealth || []} />
          </div>

          {/* Recent Activity Ledger */}
          <RecentTransactionsTable
            transactions={recentTransactions}
            onDeleteSuccess={fetchDashboardData}
          />
        </>
      )}
    </div>
  );
}
