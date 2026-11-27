import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailySlotPlan, ImpactMetrics } from "@/lib/types";

function slotRiskBadgeVariant(
  riskLevel: DailySlotPlan["riskLevel"]
): "red" | "orange" | "amber" | "emerald" {
  if (riskLevel === "High") return "red";
  if (riskLevel === "Elevated") return "orange";
  return riskLevel === "Moderate" ? "amber" : "emerald";
}

/**
 * Displays daily/weekly CO2 avoided, checklist progress, and methodology link.
 */
export function ImpactSummaryCard({ impact }: { impact: ImpactMetrics }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Environmental Impact Summary</CardTitle>
        <CardDescription>Transparent daily &amp; weekly estimates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <p className="text-xs text-emerald-900">Est. CO2 Avoided</p>
            <p className="mt-1 text-2xl font-bold text-[#0d3b2e]">
              {impact.estimatedCo2AvoidedKg} kg
            </p>
          </div>
          <div className="rounded-xl border border-[#dce5df] bg-[#f7faf8] p-3.5">
            <p className="text-xs text-[#4b5e56]">Actions Done</p>
            <p className="mt-1 text-2xl font-bold text-[#10201a]">
              {impact.actionsCompleted}/{impact.totalActions}
            </p>
          </div>
          <div className="rounded-xl border border-[#dce5df] bg-[#f7faf8] p-3.5">
            <p className="text-xs text-[#4b5e56]">Exposure Wins</p>
            <p className="mt-1 text-2xl font-bold text-[#10201a]">
              {impact.exposureReductionOpportunities}
            </p>
          </div>
          <div className="rounded-xl border border-[#dce5df] bg-[#f7faf8] p-3.5">
            <p className="text-xs text-[#4b5e56]">Streak</p>
            <p className="mt-1 text-2xl font-bold text-[#10201a]">
              {impact.streakDays} day{impact.streakDays === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-[#4b5e56]">
          Estimates compare your active commute &amp; checklist habits against a solo petrol car
          baseline (0.171 kg CO2/km).{" "}
          <Link href="/dashboard/impact" className="font-semibold text-emerald-800 underline">
            View full methodology
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Renders the 4 time-of-day exposure and ventilation slots (Morning, Afternoon, Evening, Night).
 */
export function DailyPlanGrid({ dailyPlan }: { dailyPlan: DailySlotPlan[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-of-Day Air Quality Plan</CardTitle>
        <CardDescription>
          Morning, afternoon, evening, and night actions timed to typical urban dispersion cycles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dailyPlan.map((slot) => (
            <div
              key={slot.slot}
              className="flex flex-col justify-between rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#10201a]">{slot.slot}</span>
                  <Badge variant={slotRiskBadgeVariant(slot.riskLevel)}>
                    {slot.riskLevel} Risk
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs font-medium text-[#4b5e56]">{slot.timeRange}</p>
                <p className="mt-2 text-xs text-[#2d4038]">{slot.summary}</p>
                <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs text-[#10201a]">
                  {slot.actions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 border-t border-[#e3ece6] pt-2.5 text-[11px] text-[#4b5e56]">
                <strong>Ventilation:</strong> {slot.ventilationAdvice}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
