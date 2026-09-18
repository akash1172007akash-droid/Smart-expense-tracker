"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { CategoryBreakdownPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/ui/CategoryIcon";

interface CategoryPieChartProps {
  data: CategoryBreakdownPoint[];
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as CategoryBreakdownPoint;
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-semibold text-white">{item.name}</span>
        </div>
        <p className="text-slate-300 font-bold text-sm">{formatCurrency(item.amount)}</p>
        <p className="text-slate-400">{item.percentage}% of total expenses</p>
      </div>
    );
  }
  return null;
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-slate-500 text-sm">
          No expense records in this timeframe.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Share of spending by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                stroke="#0f172a"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.categoryId}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Total Spend</span>
            <span className="text-lg font-bold text-white tracking-tight">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="mt-4 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
          {data.slice(0, 6).map((item) => (
            <div
              key={item.categoryId}
              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/50 text-xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-200 ml-1 shrink-0">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
