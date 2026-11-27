"use client";

import { useState } from "react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendationCategory } from "@/lib/types";

const CATEGORIES: Array<{ key: "all" | RecommendationCategory; label: string }> = [
  { key: "all", label: "All Actions" },
  { key: "outdoor", label: "Outdoor" },
  { key: "indoor", label: "Indoor" },
  { key: "commute", label: "Commute" },
  { key: "household", label: "Household" },
  { key: "sustainability", label: "Sustainability" },
];

export default function DailyPlanPage() {
  const { recommendations, dailyPlan, airQuality } = useBreatheWise();
  const [filter, setFilter] = useState<"all" | RecommendationCategory>("all");

  const visible =
    filter === "all" ? recommendations : recommendations.filter((r) => r.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">My Personalized Daily Plan</h1>
        <p className="text-sm text-[#4b5e56]">
          Prioritized by current AQI ({airQuality.aqi} • {airQuality.category}), your household
          needs, feasibility, and budget.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            size="sm"
            variant={filter === cat.key ? "default" : "outline"}
            onClick={() => setFilter(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-[#4b5e56]">
              No recommendations in this category for your current profile. Select &ldquo;All
              Actions&rdquo; to see your full plan.
            </CardContent>
          </Card>
        ) : (
          visible.map((rec) => <RecommendationCard key={rec.id} item={rec} />)
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full-Day Schedule Breakdown</CardTitle>
          <CardDescription>
            Align outdoor windows and ventilation with hourly dispersion.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {dailyPlan.map((slot) => (
            <div key={slot.slot} className="rounded-xl border border-[#dce5df] bg-[#f8fbf9] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#10201a]">
                  {slot.slot} ({slot.timeRange})
                </h3>
                <span className="text-xs font-semibold text-emerald-900">
                  {slot.riskLevel} Risk
                </span>
              </div>
              <p className="mt-1 text-xs text-[#4b5e56]">{slot.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#10201a]">
                {slot.actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[#30443c]">
                <strong>Ventilation:</strong> {slot.ventilationAdvice}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
