"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2, Trophy, Users } from "lucide-react";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_CITIES } from "@/lib/cities";

const COMMUNITY_CHALLENGES = [
  {
    id: "ch-no-burn",
    title: "Zero Leaf & Waste Burning Week",
    participants: "Illustrative target: Neighborhood RWAs",
    goal: "Compost dry garden leaves instead of evening open burning.",
  },
  {
    id: "ch-transit-tuesday",
    title: "Public Transit & Carpool Commute",
    participants: "Illustrative target: Office & College Commuters",
    goal: "Replace 2 solo car/two-wheeler trips per week with metro, bus, or shared rides.",
  },
  {
    id: "ch-school-no-idle",
    title: "No-Idling School Gate Pledge",
    participants: "Illustrative target: Parent Pickup Zones",
    goal: "Switch off engines while waiting outside school gates to protect children.",
  },
];

export function CommunityModule() {
  const { airQuality, recommendations, notify } = useBreatheWise();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const shareText = `BreatheWise Daily Advisory for ${airQuality.city}: AQI ${airQuality.aqi} (${airQuality.category}), Main Pollutant ${airQuality.mainPollutant}. Top action today: ${recommendations[0]?.title ?? "Protect sensitive groups and reduce unnecessary idling."}`;

  async function copyShareCard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      notify("Advisory copied", "Shareable city air-quality summary copied to clipboard.");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      notify("Copy unavailable", "Select and copy the summary text manually.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Community Intelligence</h1>
        <p className="text-sm text-[#4b5e56]">
          City-level awareness, neighborhood challenges, and shareable advisories. Individual
          household profiles are never shared or exposed.
        </p>
      </div>

      {/* Shareable Daily Card + Aggregate Stats */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 bg-[#0d3b2e] text-white border-[#0d3b2e]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-200">
                  Shareable Neighborhood Card
                </p>
                <CardTitle className="mt-1 text-white">
                  {airQuality.city} Daily Air Briefing
                </CardTitle>
              </div>
              <AqiBadge category={airQuality.category} aqi={airQuality.aqi} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-emerald-50">
              {shareText}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-emerald-200">
                Source: {airQuality.dataSource} • Contains zero personal household data
              </span>
              <Button variant="secondary" size="sm" onClick={() => void copyShareCard()}>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy Advisory Card"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <CardTitle>City Winter Pollution Context</CardTitle>
            </div>
            <CardDescription>Regional seasonal patterns across Indian cities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {SUPPORTED_CITIES.slice(0, 4).map((city) => (
              <div
                key={city.name}
                className="rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3 text-xs"
              >
                <p className="font-bold text-[#10201a]">
                  {city.name} ({city.state})
                </p>
                <p className="mt-0.5 text-[#4b5e56]">{city.winterNote}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Community Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              <CardTitle>Collective Clean-Air Challenges</CardTitle>
            </div>
            <Badge variant="slate">Illustrative Community Templates</Badge>
          </div>
          <CardDescription>
            Practical neighborhood actions families and student groups can adopt together.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {COMMUNITY_CHALLENGES.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col justify-between rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4"
            >
              <div>
                <h3 className="font-bold text-[#10201a]">{ch.title}</h3>
                <p className="mt-1 text-xs font-medium text-emerald-800">{ch.participants}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#4b5e56]">{ch.goal}</p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#0d3b2e]">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Shareable in RWA &amp; parent groups</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
