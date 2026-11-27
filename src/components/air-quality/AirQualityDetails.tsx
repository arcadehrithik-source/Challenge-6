import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AQI_CATEGORY_META, describePollutant } from "@/lib/aqi";
import type { AirQualitySnapshot } from "@/lib/types";

/**
 * Displays individual pollutant concentration cards (PM2.5, PM10, NO2, O3) for the active location.
 */
export function PollutantBreakdownGrid({ airQuality }: { airQuality: AirQualitySnapshot }) {
  const pollutants = [
    { code: "PM2.5" as const, value: airQuality.pm25 },
    { code: "PM10" as const, value: airQuality.pm10 },
    { code: "NO2" as const, value: airQuality.no2 },
    { code: "O3" as const, value: airQuality.o3 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pollutants.map((p) => (
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
  );
}

/**
 * Displays the CPCB Indian National AQI 6-tier severity reference scale with non-color badges.
 */
export function AqiScaleReferenceCard() {
  return (
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
  );
}
