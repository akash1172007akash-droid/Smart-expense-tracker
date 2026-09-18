"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { CashFlowPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CashFlowChartProps {
  data: CashFlowPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === "income")?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === "expense")?.value || 0;
    const net = income - expense;

    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-semibold text-white border-b border-slate-800 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>Income:</span>
          <span className="font-bold">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400">
          <span>Expenses:</span>
          <span className="font-bold">{formatCurrency(expense)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-indigo-300 pt-1 border-t border-slate-800 font-semibold">
          <span>Net Savings:</span>
          <span>{formatCurrency(net)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data }: CashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Trend</CardTitle>
          <CardDescription>Income vs. Expense over time</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-slate-500 text-sm">
          No cash flow data available for this timeframe.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Inflows vs. Outflows across the selected timeframe</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
