"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Flame, Leaf } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { SafetyChecklistCard } from "@/components/recommendations/SafetyChecklistCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateImpactMetrics } from "@/lib/commute-impact";

export function ImpactTrackerModule() {
  const { checklist, profile, streakDays, toggleChecklistItem } = useBreatheWise();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");

  const metrics = calculateImpactMetrics({
    checklist,
    commuteMode: profile.commute,
    commuteDistanceKm: profile.commuteDistanceKm,
    streakDays,
  });

  const multiplier = timeframe === "monthly" ? 4 : 1;
  const displayedCo2 = Number((metrics.estimatedCo2AvoidedKg * multiplier).toFixed(2));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#10201a]">Environmental Impact Tracker</h1>
          <p className="text-sm text-[#4b5e56]">
            Transparent self-tracking of exposure-saving actions and modeled CO2 avoided.
          </p>
        </div>

        <div className="flex rounded-xl border border-[#dce5df] bg-white p-1">
          {(["weekly", "monthly"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                timeframe === tf ? "bg-[#0d3b2e] text-white" : "text-[#4b5e56]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4b5e56]">
                Est. CO2 Avoided ({timeframe})
              </span>
              <Leaf className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#0d3b2e]">{displayedCo2} kg</p>
            <p className="mt-1 text-[11px] text-[#4b5e56]">Illustrative baseline estimate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4b5e56]">Actions Completed Today</span>
              <Award className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#10201a]">
              {metrics.actionsCompleted}/{metrics.totalActions}
            </p>
            <p className="mt-1 text-[11px] text-[#4b5e56]">Daily clean-air checklist</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4b5e56]">
                Energy &amp; Clean Air Wins
              </span>
              <Flame className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#10201a]">
              {metrics.energyActionsCompleted + metrics.transportSwitches}
            </p>
            <p className="mt-1 text-[11px] text-[#4b5e56]">Transport + household energy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4b5e56]">Sustainability Streak</span>
              <Badge variant="emerald">Active</Badge>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#10201a]">
              {metrics.streakDays} day{metrics.streakDays === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-[11px] text-[#4b5e56]">Saved locally on this device</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Interactive Checklist */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Estimated Weekly CO2 Savings Trend (kg)</CardTitle>
            <CardDescription>
              Projected from your completed daily habits and commute baseline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="h-64 w-full"
              role="img"
              aria-label="Bar chart showing modeled daily CO2 savings across Monday through Sunday."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.weeklySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ece7" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4b5e56" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#4b5e56" }} />
                  <Tooltip />
                  <Bar
                    dataKey="co2Kg"
                    name="Est. CO2 Avoided (kg)"
                    fill="#0f766e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-5">
          <SafetyChecklistCard
            title="Log Today's Actions"
            description="Check items off to update your impact numbers live."
            checklist={checklist}
            onToggle={toggleChecklistItem}
            showDetails={false}
          />
        </div>
      </div>

      {/* Transparent Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Transparent Formula &amp; Baseline Assumptions</CardTitle>
          <CardDescription>
            We never present self-tracked estimates as audited or verified emissions reductions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[#30443c]">
            {metrics.assumptions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
