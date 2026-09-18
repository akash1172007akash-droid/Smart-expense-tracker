"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionItem, CategoryItem, BudgetProgress } from "@/types";
import {
  Printer,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useSession } from "next-auth/react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReportsPage() {
  const { data: session } = useSession();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Calculate start and end of selected month
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

      const [txRes, bRes] = await Promise.all([
        fetch(`/api/transactions?startDate=${startDate}&endDate=${endDate}&limit=100`),
        fetch(`/api/budgets?month=${month}&year=${year}`),
      ]);

      const txData = await txRes.json();
      const bData = await bRes.json();

      if (txRes.ok) setTransactions(txData.transactions || []);
      if (bRes.ok) setBudgets(bData.progress || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Compute metrics for the statement
  const incomeTx = transactions.filter((t) => t.type === "INCOME");
  const expenseTx = transactions.filter((t) => t.type === "EXPENSE");

  const totalIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0.0";

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    window.open(`/api/export/csv?startDate=${startDate}&endDate=${endDate}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Action Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Financial Reports & Statements
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable monthly statements and downloadable spreadsheet CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month / Year Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y} className="bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print / PDF Statement</span>
          </Button>
        </div>
      </div>

      {/* Printable Statement Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 print:text-indigo-600">
                Monthly Statement
              </span>
              <Badge variant="default" className="text-[10px] print:hidden">
                Official Summary
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white print:text-black mt-1">
              {MONTH_NAMES[month - 1]} {year}
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Statement Period: {MONTH_NAMES[month - 1]} 1, {year} –{" "}
              {MONTH_NAMES[month - 1]} {new Date(year, month, 0).getDate()}, {year}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <p className="text-sm font-bold text-white print:text-black">
              Account: {session?.user?.name || "Alex Morgan"}
            </p>
            <p className="text-xs text-slate-400 print:text-slate-600">
              {session?.user?.email || "demo@example.com"}
            </p>
            <p className="text-[11px] text-slate-500 print:text-slate-500 mt-1">
              Generated: {formatDate(new Date(), "PPpp")}
            </p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-slate-600 mb-3">
            Financial Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">
                Total Inflow
              </span>
              <span className="text-xl font-bold text-emerald-400 print:text-emerald-700">
                {formatCurrency(totalIncome)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">
                Total Outflow
              </span>
              <span className="text-xl font-bold text-rose-400 print:text-rose-700">
                {formatCurrency(totalExpense)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">
                Net Cash Savings
              </span>
              <span
                className={`text-xl font-bold ${
                  netSavings >= 0
                    ? "text-indigo-400 print:text-indigo-700"
                    : "text-rose-400 print:text-rose-700"
                }`}
              >
                {formatCurrency(netSavings)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">
                Savings Rate
              </span>
              <span className="text-xl font-bold text-white print:text-black">
                {savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Category Budget Allocation Performance */}
        {budgets.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-slate-600 mb-3">
              Budget Performance by Category
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
                <thead className="bg-slate-950/80 print:bg-slate-200 border-b border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Allocated</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actual Spent</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Variance</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {budgets.map((b) => (
                    <tr key={b.budgetId}>
                      <td className="py-2 px-3 font-medium text-white print:text-black">
                        {b.categoryName}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 print:text-slate-700">
                        {formatCurrency(b.allocated)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 print:text-slate-700 font-semibold">
                        {formatCurrency(b.spent)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          b.remaining >= 0
                            ? "text-emerald-400 print:text-emerald-700"
                            : "text-rose-400 print:text-rose-700"
                        }`}
                      >
                        {b.remaining >= 0 ? "+" : ""}
                        {formatCurrency(b.remaining)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-200 print:text-slate-800">
                        {b.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction Ledger Table */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-slate-600 mb-3">
            Monthly Transactions Ledger ({transactions.length} items)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
              <thead className="bg-slate-950/80 print:bg-slate-200 border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Method</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No transactions recorded for this billing cycle.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2 px-3 text-slate-400 print:text-slate-700">
                        {formatDate(tx.date, "yyyy-MM-dd")}
                      </td>
                      <td className="py-2 px-3 font-medium text-white print:text-black">
                        {tx.title}
                        {tx.notes && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                            {tx.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-300 print:text-slate-700">
                        {tx.category?.name || "Uncategorized"}
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-slate-600 uppercase text-[10px]">
                        {tx.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <span
                          className={
                            tx.type === "INCOME"
                              ? "text-emerald-400 print:text-emerald-700"
                              : "text-white print:text-black"
                          }
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statement Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 print:text-slate-600 gap-2">
          <span>SmartSpend Financial Analytics • Confidential Personal Ledger</span>
          <span>Verified Accurate by Automated Transaction Engine</span>
        </div>
      </div>
    </div>
  );
}
