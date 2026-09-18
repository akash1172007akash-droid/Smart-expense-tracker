import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/30",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 shadow-sm border border-slate-700/60",
      outline:
        "border border-slate-700/80 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20",
      ghost:
        "text-slate-300 hover:bg-slate-800/80 hover:text-white",
      link:
        "text-indigo-400 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
