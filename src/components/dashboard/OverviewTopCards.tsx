import { Wind } from "lucide-react";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AirQualitySnapshot, ExposureIndicator } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

function exposureBadgeVariant(level: ExposureIndicator["level"]): "red" | "orange" | "emerald" {
  if (level === "Critical" || level === "High") return "red";
  return level === "Elevated" ? "orange" : "emerald";
}

/**
 * Displays live/demo CPCB Indian NAQI metrics, particulate readings, and category advisory.
 */
export function AirQualityOverviewCard({
  airQuality,
  isLoading,
}: {
  airQuality: AirQualitySnapshot;
  isLoading: boolean;
}) {
  return (
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
        {isLoading ? (
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
                <p className="mt-1 text-2xl font-bold text-[#10201a]">{airQuality.mainPollutant}</p>
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
  );
}

/**
 * Displays the non-medical personalized situational exposure score and explanatory rationale.
 */
export function PersonalizedExposureCard({ exposure }: { exposure: ExposureIndicator }) {
  return (
    <Card className="lg:col-span-5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Personalized Exposure Indicator</CardTitle>
          <Badge variant={exposureBadgeVariant(exposure.level)}>
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
              <Wind className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="rounded-lg bg-[#f3f6f4] px-3 py-2 text-[11px] text-[#4b5e56]">
          {exposure.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
