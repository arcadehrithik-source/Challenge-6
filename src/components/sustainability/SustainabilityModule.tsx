"use client";

import { Car, CheckCircle2, Flame, Leaf, Train, Zap } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SustainabilityModule() {
  const { airQuality, profile } = useBreatheWise();
  const safeForActiveTravel = airQuality.aqi <= 150;

  const alternatives = [
    {
      icon: Train,
      title: "Public Transport Over Solo Driving",
      status: "Recommended Daily",
      personalBenefit:
        "Sheltered AC metro/bus coaches reduce street-level dust spikes vs open vehicles.",
      environmentalBenefit:
        "Cuts per-passenger CO2 by ~76% compared with a solo petrol car (0.041 vs 0.171 kg/km).",
    },
    {
      icon: Car,
      title: "Neighborhood & Office Carpooling",
      status: "High Impact",
      personalBenefit: "Splits fuel/parking stress while keeping enclosed cabin filtration.",
      environmentalBenefit:
        "Sharing one 10 km round-trip car ride with 1 colleague halves tailpipe CO2 (~1.71 kg saved/day).",
    },
    {
      icon: Leaf,
      title: "Walking & Cycling on Clean Air Windows",
      status: safeForActiveTravel ? "Great Conditions Today" : "Pause During Severe Haze",
      personalBenefit: safeForActiveTravel
        ? "Builds cardiovascular health along quieter side streets."
        : `AQI is ${airQuality.aqi} (${airQuality.category}) — save active trips for days when AQI drops below 150.`,
      environmentalBenefit: "Zero tailpipe emissions and zero road-wear particulate generation.",
    },
    {
      icon: Flame,
      title: "Zero Vehicle Idling at Gates & Signals",
      status: "Every Trip",
      personalBenefit:
        "Prevents exhaust fumes from pooling right outside schools, markets, and homes.",
      environmentalBenefit:
        "Switching off engines at stops >30s saves ~10–15% urban idle fuel waste.",
    },
    {
      icon: Zap,
      title: "Energy-Efficient & Smoke-Free Home Habits",
      status: "Household Staple",
      personalBenefit: "Lowers indoor heat, smoke, and monthly electricity/cooking fuel bills.",
      environmentalBenefit:
        "Using pot lids, LED lighting, and natural midday ventilation reduces fossil power demand.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Sustainable Alternatives</h1>
        <p className="text-sm text-[#4b5e56]">
          Low-emission habits matched to {airQuality.city} (AQI {airQuality.aqi}) and your{" "}
          {profile.preferences.sustainabilityPriority.replace(/_/g, " ")} goal.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {alternatives.map((alt) => {
          const Icon = alt.icon;
          return (
            <Card key={alt.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f1e9] text-[#0d3b2e]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <CardTitle className="text-base">{alt.title}</CardTitle>
                  </div>
                  <Badge variant="emerald">{alt.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs leading-relaxed text-[#30443c]">
                <p className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-[#10201a]">Personal benefit: </strong>
                    {alt.personalBenefit}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Leaf
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-[#10201a]">Environmental benefit: </strong>
                    {alt.environmentalBenefit}
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
