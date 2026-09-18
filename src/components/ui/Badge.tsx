import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  customColor?: string;
}

export function Badge({
  className,
  variant = "default",
  customColor,
  children,
  style,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors";

  const variants = {
    default: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    destructive: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    outline: "border border-slate-700 text-slate-300",
  };

  const customStyle: React.CSSProperties = customColor
    ? {
        backgroundColor: `${customColor}20`,
        color: customColor,
        borderColor: `${customColor}40`,
        ...style,
      }
    : { ...style };

  return (
    <span
      className={cn(
        baseStyles,
        !customColor && variants[variant],
        customColor && "border",
        className
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
}
