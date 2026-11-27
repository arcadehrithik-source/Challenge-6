"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, Wind } from "lucide-react";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { SafetyChecklistCard } from "@/components/recommendations/SafetyChecklistCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateImpactMetrics } from "@/lib/commute-impact";
import { formatEnumLabel, formatTimestamp } from "@/lib/utils";

const HourlyAqiChart = dynamic(
  () => import("@/components/air-quality/HourlyAqiChart").then((m) => m.HourlyAqiChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 animate-pulse rounded-2xl border border-[#dce5df] bg-white p-6" />
    ),
  }
);

export function DashboardOverview() {
  const {
    profile,
    airQuality,
    isLoadingAirQuality,
    recommendations,
    exposure,
    dailyPlan,
    checklist,
    streakDays,
    toggleChecklistItem,
    setAssistantOpen,
  } = useBreatheWise();

  const impact = calculateImpactMetrics({
    checklist,
    commuteMode: profile.commute,
    commuteDistanceKm: profile.commuteDistanceKm,
    streakDays,
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Personalized Command Center
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#10201a] sm:text-3xl">
            Today&apos;s Air &amp; Action Plan for {airQuality.city}
          </h1>
          <p className="mt-1 text-sm text-[#4b5e56]">
            Tailored for {formatEnumLabel(profile.household)} • {formatEnumLabel(profile.lifestyle)}{" "}
            • {formatEnumLabel(profile.commute)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" asChild>
            <Link href="/onboarding">Update Profile</Link>
          </Button>
          <Button variant="emerald" onClick={() => setAssistantOpen(true)}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Ask BreatheWise AI
          </Button>
        </div>
      </div>

      {/* Top Grid: AQI Overview + Personalized Exposure Indicator */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Current Air Quality Overview</CardTitle>
                <CardDescription>
                  {airQuality.dataSource} • Updated {formatTimestamp(airQuality.updatedAt)}
                </CardDescription>
              </div>
              <AqiBadge category={airQuality.category} showRange />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAirQuality ? (
              <div className="h-32 animate-pulse rounded-xl bg-[#edf3ef]" />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl bg-[#0d3b2e] p-4 text-white">
                    <p className="text-xs text-emerald-200">Indian NAQI</p>
                    <p className="mt-1 text-4xl font-extrabold">{airQuality.aqi}</p>
                    <p className="mt-1 text-xs text-emerald-100">{airQuality.category}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
                    <p className="text-xs text-[#4b5e56]">PM2.5</p>
                    <p className="mt-1 text-2xl font-bold text-[#10201a]">
                      {airQuality.pm25 !== null ? airQuality.pm25.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-xs text-[#4b5e56]">µg/m³</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
                    <p className="text-xs text-[#4b5e56]">PM10</p>
                    <p className="mt-1 text-2xl font-bold text-[#10201a]">
                      {airQuality.pm10 !== null ? airQuality.pm10.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-xs text-[#4b5e56]">µg/m³</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
                    <p className="text-xs text-[#4b5e56]">Main Pollutant</p>
                    <p className="mt-1 text-2xl font-bold text-[#10201a]">
                      {airQuality.mainPollutant}
                    </p>
                    <p className="text-xs text-[#4b5e56]">Primary driver</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3.5 text-sm text-[#2d4038]">
                  <span className="font-semibold text-[#10201a]">Health Advisory: </span>
                  {airQuality.healthAdvisory}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Personalized Exposure Indicator</CardTitle>
              <Badge
                variant={
                  exposure.level === "Critical" || exposure.level === "High"
                    ? "red"
                    : exposure.level === "Elevated"
                      ? "orange"
                      : "emerald"
                }
              >
                {exposure.level} ({exposure.score}/100)
              </Badge>
            </div>
            <CardDescription>{exposure.headline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress
              value={exposure.score}
              aria-label={`Lifestyle exposure sensitivity score ${exposure.score} out of 100`}
            />
            <ul className="space-y-1.5 text-xs text-[#30443c]">
              {exposure.rationale.map((line, idx) => (
                <li key={idx} className="flex gap-2">
                  <Wind
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-[#f3f6f4] px-3 py-2 text-[11px] text-[#4b5e56]">
              {exposure.disclaimer}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Chart + Impact Summary */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HourlyAqiChart hourly={airQuality.hourly} dataMode={airQuality.dataMode} />
        </div>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Environmental Impact Summary</CardTitle>
            <CardDescription>Transparent daily &amp; weekly estimates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200">
                <p className="text-xs text-emerald-900">Est. CO2 Avoided</p>
                <p className="mt-1 text-2xl font-bold text-[#0d3b2e]">
                  {impact.estimatedCo2AvoidedKg} kg
                </p>
              </div>
              <div className="rounded-xl bg-[#f7faf8] p-3.5 border border-[#dce5df]">
                <p className="text-xs text-[#4b5e56]">Actions Done</p>
                <p className="mt-1 text-2xl font-bold text-[#10201a]">
                  {impact.actionsCompleted}/{impact.totalActions}
                </p>
              </div>
              <div className="rounded-xl bg-[#f7faf8] p-3.5 border border-[#dce5df]">
                <p className="text-xs text-[#4b5e56]">Exposure Wins</p>
                <p className="mt-1 text-2xl font-bold text-[#10201a]">
                  {impact.exposureReductionOpportunities}
                </p>
              </div>
              <div className="rounded-xl bg-[#f7faf8] p-3.5 border border-[#dce5df]">
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
      </div>

      {/* Morning / Afternoon / Evening / Night Plan */}
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
                    <Badge
                      variant={
                        slot.riskLevel === "High"
                          ? "red"
                          : slot.riskLevel === "Elevated"
                            ? "orange"
                            : slot.riskLevel === "Moderate"
                              ? "amber"
                              : "emerald"
                      }
                    >
                      {slot.riskLevel} Risk
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#4b5e56]">{slot.timeRange}</p>
                  <p className="mt-2 text-xs text-[#2d4038]">{slot.summary}</p>
                  <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs text-[#10201a]">
                    {slot.actions.map((a, i) => (
                      <li key={i}>{a}</li>
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

      {/* Recommendations + Household Checklist */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#10201a]">
              Prioritized Recommendations for Today
            </h2>
            <Link
              href="/dashboard/plan"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              View full plan →
            </Link>
          </div>
          <div className="space-y-4">
            {recommendations.slice(0, 4).map((rec) => (
              <RecommendationCard key={rec.id} item={rec} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <SafetyChecklistCard
            title="Household Safety Checklist"
            description="Mark completed actions to update your daily impact tracker."
            checklist={checklist}
            onToggle={toggleChecklistItem}
          />
        </div>
      </div>
    </div>
  );
}
