import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
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

Input.displayName = "Input";
