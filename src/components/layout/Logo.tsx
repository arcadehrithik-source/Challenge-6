import { Wind } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 focus-visible:rounded-lg", className)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d3b2e] text-emerald-100 shadow-sm">
        <Wind className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-bold tracking-tight text-[#10201a]">BreatheWise AI</span>
          <span className="text-[11px] font-medium text-[#4b5e56]">Urban Air Intelligence</span>
        </span>
      )}
    </Link>
  );
}
