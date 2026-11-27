import { AlertOctagon, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { AQI_CATEGORY_META } from "@/lib/aqi";
import type { AqiCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<AqiCategory, React.ComponentType<{ className?: string }>> = {
  Good: CheckCircle2,
  Satisfactory: Info,
  Moderate: AlertTriangle,
  Poor: ShieldAlert,
  "Very Poor": AlertOctagon,
  Severe: AlertOctagon,
};

export function AqiBadge({
  category,
  aqi,
  showRange = false,
  className,
}: {
  category: AqiCategory;
  aqi?: number;
  showRange?: boolean;
  className?: string;
}) {
  const meta = AQI_CATEGORY_META[category];
  const Icon = CATEGORY_ICON[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        meta.surfaceClass,
        meta.borderClass,
        meta.colorClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{category}</span>
      {typeof aqi === "number" && <span className="font-bold">({aqi})</span>}
      {showRange && <span className="opacity-80">• {meta.range}</span>}
    </span>
  );
}
