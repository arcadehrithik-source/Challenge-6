"use client";

import { useState } from "react";
import { AlertTriangle, Bike, Bus, Car, Footprints, Info } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compareCommuteOptions } from "@/lib/commute-impact";
import type { CommuteMode } from "@/lib/types";

const MODE_ICON: Record<CommuteMode, React.ComponentType<{ className?: string }>> = {
  walking: Footprints,
  bicycle: Bike,
  public_transport: Bus,
  two_wheeler: Bike,
  car: Car,
  work_from_home: Bus,
};

export function SmartCommuteModule() {
  const { airQuality, profile } = useBreatheWise();
  const [distanceKm, setDistanceKm] = useState(profile.commuteDistanceKm || 8);

  const comparisons = compareCommuteOptions(airQuality.aqi, distanceKm, profile.commute);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Smart Commute Assistant</h1>
        <p className="text-sm text-[#4b5e56]">
          Compare travel time, estimated CO2 emissions, and modeled exposure across commute modes at{" "}
          {airQuality.city} AQI {airQuality.aqi} ({airQuality.category}).
        </p>
      </div>

      {/* Controls & Route Exposure Caveat */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Trip Distance</CardTitle>
            <CardDescription>
              Adjust one-way distance (km) to recalculate round-trip CO2 &amp; time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="commute-dist-input">One-way distance (km)</Label>
            <Input
              id="commute-dist-input"
              type="number"
              min={1}
              max={80}
              value={distanceKm}
              onChange={(e) =>
                setDistanceKm(Math.max(1, Math.min(80, Number(e.target.value) || 1)))
              }
            />
            <p className="text-xs text-[#4b5e56]">
              Round trip modeled: <strong>{(distanceKm * 2).toFixed(0)} km/day</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-start gap-3 p-5 text-xs leading-relaxed text-amber-950">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="space-y-1.5">
              <p className="font-bold">Important Route Exposure Note:</p>
              <p>
                A{" "}
                <strong>shorter route does not automatically mean lower pollution exposure</strong>.
                Walking or cycling along a congested arterial road with idling diesel vehicles can
                deliver higher particulate inhalation than a slightly longer side-street route.
              </p>
              <p>
                Exposure tiers below are <strong>modeled estimates</strong> combining ambient city
                AQI, trip duration, and breathing/enclosure factors—not live personal sensor
                measurements along your street.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {comparisons.map((opt) => {
          const Icon = MODE_ICON[opt.mode];
          return (
            <Card
              key={opt.mode}
              className={opt.isRecommended ? "border-emerald-500 ring-1 ring-emerald-500" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3ef] text-[#0d3b2e]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <CardTitle className="text-base">{opt.label}</CardTitle>
                  </div>
                  <div className="flex gap-1.5">
                    {opt.isRecommended && <Badge variant="emerald">Recommended Today</Badge>}
                    {opt.isCurrentMode && <Badge variant="slate">Your Current Mode</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f7faf8] p-3 text-center">
                  <div>
                    <p className="text-[11px] text-[#4b5e56]">One-Way Time</p>
                    <p className="text-sm font-bold text-[#10201a]">{opt.estimatedMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#4b5e56]">Round-Trip CO2</p>
                    <p className="text-sm font-bold text-[#10201a]">{opt.estimatedCo2Kg} kg</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#4b5e56]">Modeled Exposure</p>
                    <p className="text-sm font-bold text-[#10201a]">
                      {opt.exposureTier} ({opt.relativeExposureIndex})
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-[#2d4038]">{opt.guidance}</p>

                {opt.exposureTier === "High" && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-red-800">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Consider sheltered transit or N95 protection at current AQI.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
