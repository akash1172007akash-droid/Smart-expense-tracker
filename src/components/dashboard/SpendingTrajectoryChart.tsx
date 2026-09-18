"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/Card";
import { SpendingTrajectoryPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SpendingTrajectoryChartProps {
  data: SpendingTrajectoryPoint[];
}

const CustomTrajectoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p: any) => p.dataKey === "actualCumulativeSpend")?.value;
    const target = payload.find((p: any) => p.dataKey === "linearPaceTarget")?.value;
    const cap = payload[0]?.payload?.budgetCap;

    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-semibold text-white border-b border-slate-800 pb-1">{label}</p>
        {actual !== undefined && (
          <div className="flex items-center justify-between gap-4 text-indigo-400">
            <span>Cumulative Spent:</span>
            <span className="font-bold">{formatCurrency(actual)}</span>
          </div>
        )}
        {target !== undefined && (
          <div className="flex items-center justify-between gap-4 text-cyan-400">
            <span>Paced Target:</span>
            <span className="font-bold">{formatCurrency(target)}</span>
          </div>
        )}
        {cap !== undefined && cap > 0 && (
          <div className="flex items-center justify-between gap-4 text-rose-400 pt-1 border-t border-slate-800">
            <span>Monthly Budget Cap:</span>
            <span className="font-semibold">{formatCurrency(cap)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function SpendingTrajectoryChart({ data }: SpendingTrajectoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trajectory vs. Target</CardTitle>
          <CardDescription>Daily cumulative spending burn rate</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-slate-500 text-sm">
          No trajectory data for this period.
        </CardContent>
      </Card>
    );
  }

  const budgetCap = data[0]?.budgetCap || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trajectory vs. Budget Target</CardTitle>
        <CardDescription>
          Daily cumulative spending compared against linear monthly budget pacing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTrajectoryTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "15px", fontSize: "12px" }}
              />
              {budgetCap > 0 && (
                <ReferenceLine
                  y={budgetCap}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{
                    value: `Cap: ${formatCurrency(budgetCap)}`,
                    fill: "#f43f5e",
                    fontSize: 10,
                    position: "top",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="actualCumulativeSpend"
                name="Actual Spent"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 2, fill: "#6366f1" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="linearPaceTarget"
                name="Target Pace"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
