import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // percentage (0 - 100 or >100)
  max?: number;
  indicatorColor?: string;
  status?: "NORMAL" | "WARNING" | "OVER_BUDGET";
}

export function Progress({
  value = 0,
  max = 100,
  indicatorColor,
  status,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let statusColor = "bg-indigo-600";
  if (status === "NORMAL") statusColor = "bg-emerald-500";
  if (status === "WARNING") statusColor = "bg-amber-500";
  if (status === "OVER_BUDGET") statusColor = "bg-rose-500";

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 rounded-full", !indicatorColor && statusColor)}
        style={{
          width: `${percentage}%`,
          backgroundColor: indicatorColor || undefined,
        }}
      />
    </div>
  );
}
