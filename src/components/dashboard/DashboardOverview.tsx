"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { SafetyChecklistCard } from "@/components/recommendations/SafetyChecklistCard";
import { Button } from "@/components/ui/button";
import { formatEnumLabel } from "@/lib/utils";
import {
  AirQualityOverviewCard,
  DailyPlanGrid,
  ImpactSummaryCard,
  PersonalizedExposureCard,
} from "./OverviewCards";

const HourlyAqiChart = dynamic(
  () => import("@/components/air-quality/HourlyAqiChart").then((m) => m.HourlyAqiChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 animate-pulse rounded-2xl border border-[#dce5df] bg-white p-6" />
    ),
  }
);

/**
 * Primary personalized dashboard command center synthesizing live/demo AQI,
 * exposure score, hourly trajectory, impact tracking, and daily actions.
 */
export function DashboardOverview() {
  const {
    profile,
    airQuality,
    isLoadingAirQuality,
    recommendations,
    exposure,
    dailyPlan,
    checklist,
    impact,
    toggleChecklistItem,
    setAssistantOpen,
  } = useBreatheWise();

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-12">
        <AirQualityOverviewCard airQuality={airQuality} isLoading={isLoadingAirQuality} />
        <PersonalizedExposureCard exposure={exposure} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HourlyAqiChart hourly={airQuality.hourly} dataMode={airQuality.dataMode} />
        </div>
        <ImpactSummaryCard impact={impact} />
      </div>

      <DailyPlanGrid dailyPlan={dailyPlan} />

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
