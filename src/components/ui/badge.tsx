import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "amber" | "orange" | "red" | "slate";
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[#edf3ef] text-[#10201a] border-[#d0ddd5]",
  emerald: "bg-emerald-50 text-emerald-900 border-emerald-200",
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  orange: "bg-orange-50 text-orange-900 border-orange-200",
  red: "bg-red-50 text-red-900 border-red-200",
  slate: "bg-slate-100 text-slate-800 border-slate-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
