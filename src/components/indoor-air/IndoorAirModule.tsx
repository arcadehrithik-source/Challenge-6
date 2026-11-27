"use client";

import { AlertCircle, Flame, Home, ShieldCheck, Wind } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AQI_THRESHOLDS } from "@/lib/aqi";
import { IndoorChecklistCard } from "./IndoorChecklistCard";

/**
 * Dedicated Indoor Air Intelligence module providing ventilation schedules,
 * cooking exhaust advice, HEPA vs low-cost actions, and room checklists.
 */
export function IndoorAirModule() {
  const { airQuality, profile } = useBreatheWise();
  const isHighOutdoor = airQuality.aqi > AQI_THRESHOLDS.MODERATE_MAX;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#10201a]">Indoor Air Intelligence</h1>
          <p className="text-sm text-[#4b5e56]">
            Practical ventilation, cooking exhaust, and low-cost particle control for{" "}
            {airQuality.city} (AQI {airQuality.aqi}).
          </p>
        </div>
        <Badge variant={profile.indoorEnvironment.hasAirPurifier ? "emerald" : "amber"}>
          {profile.indoorEnvironment.hasAirPurifier
            ? "HEPA Purifier Configured"
            : "No Purifier Mode (Zero/Low-Cost Focus)"}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <CardTitle>Today&apos;s Ventilation Timing</CardTitle>
            </div>
            <CardDescription>
              Based on {airQuality.city} AQI {airQuality.aqi} ({airQuality.category})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#2d4038]">
            <p>
              {isHighOutdoor
                ? "Keep outer windows closed during early morning (06:00–10:30) and evening/night (17:30–05:30). Open opposite windows briefly for 15–20 minutes between 13:00 and 15:30 to flush indoor CO2."
                : "Outdoor air is supportive of natural cross-ventilation. Open opposite windows for 30–45 minutes midday to refresh indoor air without relying on mechanical cooling."}
            </p>
            <div className="rounded-xl bg-[#f7faf8] p-3 text-xs text-[#4b5e56]">
              <strong>Your home setting:</strong>{" "}
              {profile.indoorEnvironment.ventilation.replace(/_/g, " ")} • Windows frequently open:{" "}
              {profile.indoorEnvironment.windowsFrequentlyOpen ? "Yes" : "No"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-700" aria-hidden="true" />
              <CardTitle>Cooking &amp; Indoor Combustion Guidance</CardTitle>
            </div>
            <CardDescription>
              Configured fuel:{" "}
              {profile.indoorEnvironment.cookingFuel.replace(/_/g, " ").toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#2d4038]">
            <p>
              High-heat tempering (tadka), frying, and unvented gas or biomass flames cause sharp
              short-term indoor PM2.5 and NO2 peaks. Always run your chimney/exhaust fan or open a
              kitchen exhaust window while closing the door to bedrooms.
            </p>
            {profile.indoorEnvironment.cookingFuel === "solid_biomass_kerosene" && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Biomass/kerosene smoke produces severe indoor particulates. Cook in the best
                  ventilated space available, keep children away from the hearth, and consider LPG
                  or induction transitions where accessible.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <CardTitle>HEPA Purifier &amp; Filter Maintenance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-[#2d4038]">
            <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed">
              <li>
                <strong>Match CADR to room size:</strong> Place the purifier in the bedroom or main
                living room with doors/windows closed—an open door halves effective filtration.
              </li>
              <li>
                <strong>Clean pre-filter every 2 weeks:</strong> Vacuum or wash the outer mesh
                screen (when dry) to keep airflow high and fan power draw low.
              </li>
              <li>
                <strong>Replace True HEPA filter on schedule:</strong> Typically every 6–12 months
                in high-PM2.5 cities; never wash disposable pleated HEPA paper.
              </li>
              <li>
                <strong>Avoid ionizers / ozone generators:</strong> Choose purely mechanical True
                HEPA + activated carbon filtration without ozone emission.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <CardTitle>Zero &amp; Low-Cost Improvements (What Works vs Myth)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs leading-relaxed text-[#2d4038]">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <p className="font-semibold text-emerald-950">
                What actually works on a tight budget:
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Zero indoor smoking, incense sticks, candles, or coil burning.</li>
                <li>
                  Damp mopping &amp; wet-cloth wiping instead of dry sweeping or feather dusters.
                </li>
                <li>
                  Foam weatherstripping or rolled damp towels along leaky door/window bottoms.
                </li>
                <li>
                  DIY box-fan + MERV-13 filter frame (~₹1,800–₹2,500) if a commercial HEPA unit is
                  unaffordable.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <p className="font-semibold">Evidence Check — Houseplants:</p>
              <p className="mt-0.5">
                While indoor plants improve visual comfort, controlled building studies show potted
                houseplants alone <strong>cannot meaningfully purify an entire room</strong> of
                PM2.5 or smog gases. Always pair source control and ventilation/filtration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <IndoorChecklistCard />
    </div>
  );
}
