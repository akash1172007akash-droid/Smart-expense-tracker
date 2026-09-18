import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
            error && "border-rose-500 focus-visible:ring-rose-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500 focus-visible:ring-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
