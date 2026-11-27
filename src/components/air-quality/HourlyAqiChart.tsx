"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HourlyAirQualityPoint } from "@/lib/types";

function readObservationType(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || !("observationType" in payload)) {
    return undefined;
  }
  const value = payload.observationType;
  return typeof value === "string" ? value : undefined;
}

export function HourlyAqiChart({
  hourly,
  dataMode,
}: {
  hourly: HourlyAirQualityPoint[];
  dataMode: "live" | "demo";
}) {
  const observedCount = hourly.filter((h) => h.observationType === "observed").length;
  const forecastCount = hourly.filter((h) => h.observationType === "forecast").length;
  const simulatedCount = hourly.filter((h) => h.observationType === "simulated").length;

  const peak = hourly.reduce(
    (max, pt) => (pt.aqi > max.aqi ? pt : max),
    hourly[0] ?? { label: "N/A", aqi: 0 }
  );
  const lowest = hourly.reduce(
    (min, pt) => (pt.aqi < min.aqi ? pt : min),
    hourly[0] ?? { label: "N/A", aqi: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>24-Hour Air Quality Trajectory</CardTitle>
            <CardDescription>
              Clearly distinguishes observed readings, model forecasts, and simulated values.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {observedCount > 0 && <Badge variant="emerald">{observedCount} Observed</Badge>}
            {forecastCount > 0 && <Badge variant="slate">{forecastCount} Forecast</Badge>}
            {simulatedCount > 0 && <Badge variant="amber">{simulatedCount} Simulated Demo</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="h-64 w-full"
          role="img"
          aria-label={`Hourly AQI chart peaking at AQI ${peak.aqi} around ${peak.label} and dipping to AQI ${lowest.aqi} around ${lowest.label}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ece7" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4b5e56" }} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: "#4b5e56" }} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#d0ddd5",
                  fontSize: "12px",
                }}
                formatter={(value: number, _name: string, item) => {
                  const obs = readObservationType(item?.payload);
                  return [`AQI ${value} (${obs ?? dataMode})`, "Indian NAQI"];
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#0d3b2e"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#aqiGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible textual summary for screen readers & quick scanning */}
        <div className="mt-4 grid gap-2 rounded-xl border border-[#e3ece6] bg-[#f8fbf9] p-3 text-xs text-[#30443c] sm:grid-cols-3">
          <div>
            <span className="font-semibold">Peak window:</span> AQI {peak.aqi} around {peak.label}
          </div>
          <div>
            <span className="font-semibold">Cleanest window:</span> AQI {lowest.aqi} around{" "}
            {lowest.label}
          </div>
          <div>
            <span className="font-semibold">Data classification:</span>{" "}
            {dataMode === "live" ? "Observed + Forecast (Open-Meteo)" : "Simulated Demonstration"}
          </div>
        </div>

        <details className="mt-3 rounded-xl border border-[#e3ece6] bg-[#f8fbf9] px-3 py-2 text-xs text-[#30443c]">
          <summary className="cursor-pointer font-semibold text-[#10201a]">
            View hourly measurements table ({hourly.length} hours)
          </summary>
          <div className="mt-2 max-h-56 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#dce5df] text-[#4b5e56]">
                  <th scope="col" className="py-1.5 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-1.5 pr-3 font-semibold">
                    Indian NAQI
                  </th>
                  <th scope="col" className="py-1.5 pr-3 font-semibold">
                    PM2.5 (µg/m³)
                  </th>
                  <th scope="col" className="py-1.5 pr-3 font-semibold">
                    PM10 (µg/m³)
                  </th>
                  <th scope="col" className="py-1.5 font-semibold">
                    Source Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {hourly.map((pt) => (
                  <tr key={pt.time} className="border-b border-[#edf3ef] last:border-0">
                    <td className="py-1.5 pr-3 font-medium text-[#10201a]">{pt.label}</td>
                    <td className="py-1.5 pr-3">{pt.aqi}</td>
                    <td className="py-1.5 pr-3">{pt.pm25 !== null ? pt.pm25.toFixed(1) : "N/A"}</td>
                    <td className="py-1.5 pr-3">{pt.pm10 !== null ? pt.pm10.toFixed(1) : "N/A"}</td>
                    <td className="py-1.5 capitalize">{pt.observationType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
