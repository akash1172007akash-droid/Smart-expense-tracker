"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Progress } from "@/ui/Progress";
import { Badge } from "@/ui/Badge";
import { CategoryIcon } from "@/ui/CategoryIcon";
import { SetBudgetModal } from "@/components/budgets/SetBudgetModal";
import { BudgetProgress, CategoryItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  PiggyBank,
  TrendingDown,
  Calendar,
  Edit2,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgetList, setBudgetList] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>();
  const [editingAmount, setEditingAmount] = useState<number | undefined>();

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data = await res.json();
      if (res.ok) {
        setBudgetList(data.progress || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const totalAllocated = budgetList.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgetList.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 1000) / 10 : 0;

  const handleOpenEdit = (b: BudgetProgress) => {
    setEditingCategoryId(b.categoryId);
    setEditingAmount(b.allocated);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingCategoryId(undefined);
    setEditingAmount(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Budgets & Limits</h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor allocated allowances, progress bars, and automated 80% threshold warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month / Year selector */}
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

          <Button size="sm" onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Set Budget</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Allocated</span>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalAllocated)}</p>
          <span className="text-xs text-slate-500">Planned for {MONTH_NAMES[month - 1]}</span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Spent</span>
          <p className="text-2xl font-bold text-rose-400">{formatCurrency(totalSpent)}</p>
          <span className="text-xs text-slate-500">Actual expenditures</span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Remaining</span>
          <p
            className={`text-2xl font-bold ${
              totalRemaining >= 0 ? "text-emerald-400" : "text-rose-500"
            }`}
          >
            {formatCurrency(totalRemaining)}
          </p>
          <span className="text-xs text-slate-500">
            {totalRemaining >= 0 ? "Under planned budget" : "Exceeded total budget"}
          </span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Overall Utilization</span>
          <p className="text-2xl font-bold text-indigo-400">{overallRate}%</p>
          <span className="text-xs text-slate-500">Target allowance spent</span>
        </Card>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">Category Spending Allocations</h3>

        {isLoading ? (
          <p className="text-slate-500 text-sm py-8">Loading category budgets...</p>
        ) : budgetList.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 space-y-3">
            <PiggyBank className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">
              No budgets established for {MONTH_NAMES[month - 1]} {year}.
            </p>
            <Button size="sm" onClick={handleOpenNew}>
              Set First Category Budget
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetList.map((b) => (
              <Card
                key={b.budgetId}
                className="hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      <CategoryIcon name={b.categoryIcon} className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{b.categoryName}</CardTitle>
                      <span className="text-[11px] text-slate-400">
                        Monthly Allowance
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit category budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Spent: </span>
                      <strong className="text-base text-white">{formatCurrency(b.spent)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Cap: </span>
                      <strong className="text-sm text-slate-200">{formatCurrency(b.allocated)}</strong>
                    </div>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <Progress
                    value={b.percentage}
                    max={100}
                    status={b.status}
                    className="h-2.5"
                  />

                  {/* Status Badges & Remaining */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">
                      {b.remaining >= 0 ? (
                        <span className="text-emerald-400 font-medium">
                          {formatCurrency(b.remaining)} left
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">
                          +{formatCurrency(Math.abs(b.remaining))} over
                        </span>
                      )}
                    </span>

                    {b.status === "OVER_BUDGET" ? (
                      <Badge variant="destructive" className="py-0.5">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {b.percentage}% Exceeded
                      </Badge>
                    ) : b.status === "WARNING" ? (
                      <Badge variant="warning" className="py-0.5">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {b.percentage}% Warning
                      </Badge>
                    ) : (
                      <Badge variant="success" className="py-0.5">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {b.percentage}% On Track
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        currentMonth={month}
        currentYear={year}
        onSuccess={fetchBudgets}
        initialCategoryId={editingCategoryId}
        initialAmount={editingAmount}
      />
    </div>
  );
}
