"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { Progress } from "@/ui/Progress";
import { Badge } from "@/ui/Badge";
import { CategoryIcon } from "@/ui/CategoryIcon";
import { BudgetProgress } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface BudgetHealthOverviewProps {
  budgets: BudgetProgress[];
}

export function BudgetHealthOverview({ budgets }: BudgetHealthOverviewProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Budget Health & Limits</CardTitle>
            <CardDescription>Category spending caps</CardDescription>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Set Budgets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="h-44 flex items-center justify-center text-slate-500 text-sm">
          No active budgets set for this month.
        </CardContent>
      </Card>
    );
  }

  const overBudgetCount = budgets.filter((b) => b.status === "OVER_BUDGET").length;
  const warningCount = budgets.filter((b) => b.status === "WARNING").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Budget Health & Limits</CardTitle>
            {(overBudgetCount > 0 || warningCount > 0) && (
              <Badge variant="warning" className="text-[10px] py-0">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {overBudgetCount > 0 ? `${overBudgetCount} Over Budget` : `${warningCount} Near Limit`}
              </Badge>
            )}
          </div>
          <CardDescription>Real-time category allowances vs. actual spend</CardDescription>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.slice(0, 5).map((b) => (
          <div key={b.budgetId} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: b.categoryColor }}
                >
                  <CategoryIcon name={b.categoryIcon} className="w-3 h-3" />
                </div>
                <span className="font-medium text-slate-200">{b.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  <strong className="text-white">{formatCurrency(b.spent)}</strong> /{" "}
                  {formatCurrency(b.allocated)}
                </span>
                <span
                  className={`font-semibold ${
                    b.status === "OVER_BUDGET"
                      ? "text-rose-400"
                      : b.status === "WARNING"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {b.percentage}%
                </span>
              </div>
            </div>

            <Progress
              value={b.percentage}
              max={100}
              status={b.status}
              className="h-2"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>
                {b.remaining >= 0
                  ? `${formatCurrency(b.remaining)} remaining`
                  : `${formatCurrency(Math.abs(b.remaining))} over budget`}
              </span>
              <span>{b.status === "OVER_BUDGET" ? "Exceeded" : b.status === "WARNING" ? "Warning (80%+)" : "On track"}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
