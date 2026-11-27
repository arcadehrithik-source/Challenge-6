"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
  indicatorClassName,
  "aria-label": ariaLabel,
}: {
  value?: number;
  className?: string;
  indicatorClassName?: string;
  "aria-label"?: string;
}) {
  return (
    <ProgressPrimitive.Root
      aria-label={ariaLabel}
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-[#e3ece6]", className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-emerald-700 transition-transform duration-300",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
