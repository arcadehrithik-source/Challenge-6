"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AQI_CATEGORY_META, describePollutant } from "@/lib/aqi";
import { SUPPORTED_CITIES } from "@/lib/cities";
import { formatTimestamp } from "@/lib/utils";

const HourlyAqiChart = dynamic(
  () => import("@/components/air-quality/HourlyAqiChart").then((m) => m.HourlyAqiChart),
  { ssr: false }
);

export default function AirQualityPage() {
  const { airQuality, profile, updateProfile, switchDataMode, dataMode } = useBreatheWise();
  const [cityQuery, setCityQuery] = useState(profile.city);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#10201a]">Air Quality Intelligence</h1>
          <p className="text-sm text-[#4b5e56]">
            Indian NAQI (CPCB) interpretation for {airQuality.city} • Updated{" "}
            {formatTimestamp(airQuality.updatedAt)}
          </p>
        </div>
        <AqiBadge category={airQuality.category} aqi={airQuality.aqi} showRange />
      </div>

      {/* City switcher + Demo scenario switcher */}
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (cityQuery.trim().length >= 2) {
                updateProfile({
                  ...profile,
                  city: cityQuery.trim(),
                  latitude: undefined,
                  longitude: undefined,
                });
              }
            }}
            className="flex flex-wrap items-end gap-2.5"
          >
            <div>
              <label htmlFor="aq-city-input" className="text-xs font-semibold text-[#30443c]">
                Inspect another city
              </label>
              <Input
                id="aq-city-input"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="mt-1 w-56"
                placeholder="Enter city name"
              />
            </div>
            <Button type="submit">Load City</Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {SUPPORTED_CITIES.slice(0, 5).map((c) => (
              <Button
                key={c.name}
                size="sm"
                variant={
                  airQuality.city.toLowerCase() === c.name.toLowerCase() ? "default" : "outline"
                }
                onClick={() => {
                  setCityQuery(c.name);
                  updateProfile({
                    ...profile,
                    city: c.name,
                    latitude: c.latitude,
                    longitude: c.longitude,
                  });
                }}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pollutants Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { code: "PM2.5" as const, value: airQuality.pm25 },
          { code: "PM10" as const, value: airQuality.pm10 },
          { code: "NO2" as const, value: airQuality.no2 },
          { code: "O3" as const, value: airQuality.o3 },
        ].map((p) => (
          <Card key={p.code}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.code}</CardTitle>
              <CardDescription>
                {p.value !== null ? `${p.value.toFixed(1)} µg/m³` : "Measurement unavailable"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-[#4b5e56]">
                {describePollutant(p.code, p.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <HourlyAqiChart hourly={airQuality.hourly} dataMode={airQuality.dataMode} />

      {/* Indian NAQI Reference Table + Demo Mode Controls */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Indian National AQI (CPCB) Scale</CardTitle>
            <CardDescription>
              Every severity tier pairs a numeric range, category label, and icon—never color alone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.values(AQI_CATEGORY_META).map((meta) => (
                <div
                  key={meta.category}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3"
                >
                  <div className="flex items-center gap-3">
                    <AqiBadge category={meta.category} />
                    <span className="text-xs font-semibold text-[#10201a]">{meta.range}</span>
                  </div>
                  <p className="text-xs text-[#4b5e56]">{meta.shortAction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Data Source &amp; Simulation Scenarios</CardTitle>
            <CardDescription>
              Test how BreatheWise adapts across Good, Moderate, Poor, and Severe pollution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[#dce5df] bg-[#f7faf8] p-3.5 text-xs text-[#30443c]">
              <p>
                <strong>Active Source:</strong> {airQuality.dataSource}
              </p>
              <p className="mt-1">
                <strong>Coordinates:</strong> {airQuality.latitude.toFixed(2)},{" "}
                {airQuality.longitude.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#10201a]">
                Run Simulated Scenario (Demonstration Mode)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["good", "moderate", "poor", "severe"] as const).map((sc) => (
                  <Button
                    key={sc}
                    size="sm"
                    variant={
                      dataMode === "demo" && profile.demoScenario === sc ? "default" : "outline"
                    }
                    onClick={() => {
                      updateProfile({ ...profile, demoScenario: sc });
                      switchDataMode("demo");
                    }}
                  >
                    Simulate {sc.charAt(0).toUpperCase() + sc.slice(1)}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="emerald"
                className="mt-3 w-full"
                onClick={() => {
                  updateProfile({ ...profile, demoScenario: "auto" });
                  switchDataMode("live");
                }}
              >
                Return to Live Open-Meteo API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
