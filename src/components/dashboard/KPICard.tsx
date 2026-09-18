import React from "react";
import { Card, CardContent } from "@/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface KPICardProps {
  title: string;
  amount: number | string;
  isCurrency?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  trendText?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPICard({
  title,
  amount,
  isCurrency = true,
  subtitle,
  icon: Icon,
  trendText,
  variant = "default",
}: KPICardProps) {
  const iconVariants = {
    default: "text-indigo-400 bg-indigo-500/15 border-indigo-500/20",
    success: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
    warning: "text-amber-400 bg-amber-500/15 border-amber-500/20",
    danger: "text-rose-400 bg-rose-500/15 border-rose-500/20",
  };

  const formattedValue =
    typeof amount === "number"
      ? isCurrency
        ? formatCurrency(amount)
        : `${amount.toFixed(1)}%`
      : amount;

  return (
    <Card className="relative overflow-hidden hover:border-slate-700/80 transition-all shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
              iconVariants[variant]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {formattedValue}
          </h3>
          {(subtitle || trendText) && (
            <div className="mt-1.5 flex items-center gap-2">
              {trendText && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {trendText}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
