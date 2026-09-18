"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimeframeOption =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "year"
  | "custom";

interface TimeframeSelectorProps {
  current: TimeframeOption;
  onChange: (timeframe: TimeframeOption, startDate?: string, endDate?: string) => void;
  startDate?: string;
  endDate?: string;
}

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  year: "Year to Date",
  custom: "Custom Range",
};

export function TimeframeSelector({
  current,
  onChange,
  startDate,
  endDate,
}: TimeframeSelectorProps) {
  const [showCustomInputs, setShowCustomInputs] = useState(current === "custom");
  const [localStart, setLocalStart] = useState(startDate || "");
  const [localEnd, setLocalEnd] = useState(endDate || "");

  const handleSelect = (tf: TimeframeOption) => {
    if (tf === "custom") {
      setShowCustomInputs(true);
      if (localStart && localEnd) {
        onChange("custom", localStart, localEnd);
      }
    } else {
      setShowCustomInputs(false);
      onChange(tf);
    }
  };

  const handleApplyCustom = () => {
    if (localStart && localEnd) {
      onChange("custom", localStart, localEnd);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Segmented Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
        {(Object.keys(TIMEFRAME_LABELS) as TimeframeOption[]).map((tf) => {
          const isActive = current === tf;
          return (
            <button
              key={tf}
              onClick={() => handleSelect(tf)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {TIMEFRAME_LABELS[tf]}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs */}
      {showCustomInputs && (
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleApplyCustom}
            className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
