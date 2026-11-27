"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Bike, Home, ShieldCheck } from "lucide-react";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import type { AqiCategory } from "@/lib/types";

interface CityPreview {
  city: string;
  aqi: number;
  category: AqiCategory;
  pm25: number;
  pm10: number;
  personaAction: string;
  commuteTip: string;
  indoorTip: string;
  impactNote: string;
}

const PREVIEW_SCENARIOS: CityPreview[] = [
  {
    city: "Delhi",
    aqi: 348,
    category: "Very Poor",
    pm25: 184,
    pm10: 312,
    personaAction: "Shift evening school play indoors; postpone outdoor cardio.",
    commuteTip: "Switch 9 km bike ride to closed-window metro today.",
    indoorTip: "Seal street-facing gaps & run HEPA or damp-mop floors.",
    impactNote: "Saves ~2.1 kg CO2 via metro vs car while cutting peak inhalation.",
  },
  {
    city: "Kolkata",
    aqi: 228,
    category: "Poor",
    pm25: 98,
    pm10: 194,
    personaAction: "Avoid dawn jogging before 10:00; use side streets.",
    commuteTip: "Wear fitted N95 on two-wheeler or take AC bus.",
    indoorTip: "Ventilate 15 mins midday (13:30); keep kitchen exhaust on.",
    impactNote: "Bundled errands + transit avoids ~1.6 kg CO2 today.",
  },
  {
    city: "Bengaluru",
    aqi: 78,
    category: "Satisfactory",
    pm25: 44,
    pm10: 82,
    personaAction: "Safe for morning runs & school outdoor sports.",
    commuteTip: "Great day for zero-emission cycling on quiet lanes.",
    indoorTip: "Open opposite windows for natural cross-ventilation.",
    impactNote: "Natural airflow + cycle commute saves ~2.9 kg CO2 today.",
  },
];

export function HeroVisual() {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const current = PREVIEW_SCENARIOS[selectedIdx]!;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#cde0d4] bg-gradient-to-br from-[#0c3529] via-[#124839] to-[#195e4c] p-5 text-white shadow-xl sm:p-7">
      {/* Subtle atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-amber-300/10 blur-2xl"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">
            Interactive Decision Preview (Illustrative Scenarios)
          </p>
          <p className="mt-0.5 text-sm text-emerald-100/90">
            Select a city profile to see how guidance adapts
          </p>
        </div>
        <div
          className="flex gap-1.5 rounded-xl bg-white/10 p-1"
          role="tablist"
          aria-label="Sample cities"
        >
          {PREVIEW_SCENARIOS.map((item, idx) => (
            <button
              key={item.city}
              type="button"
              role="tab"
              aria-selected={idx === selectedIdx}
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                idx === selectedIdx
                  ? "bg-white text-[#0d3b2e]"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              {item.city}
            </button>
          ))}
        </div>
      </div>

      {/* Main AQI & Pollutant readout */}
      <motion.div
        key={current.city}
        initial={{ opacity: 0.7, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-emerald-200">{current.city} • Indian NAQI Scale</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight">{current.aqi}</span>
              <AqiBadge category={current.category} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-right">
            <div className="rounded-xl bg-black/15 px-3 py-2">
              <p className="text-[11px] text-emerald-200">PM2.5</p>
              <p className="text-sm font-semibold">{current.pm25} µg/m³</p>
            </div>
            <div className="rounded-xl bg-black/15 px-3 py-2">
              <p className="text-[11px] text-emerald-200">PM10</p>
              <p className="text-sm font-semibold">{current.pm10} µg/m³</p>
            </div>
          </div>
        </div>

        {/* Action translation cards */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl bg-white/95 p-3 text-[#10201a]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              Daily Routine
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#30443c]">{current.personaAction}</p>
          </div>
          <div className="rounded-xl bg-white/95 p-3 text-[#10201a]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Bike className="h-3.5 w-3.5" aria-hidden="true" />
              Smart Commute
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#30443c]">{current.commuteTip}</p>
          </div>
          <div className="rounded-xl bg-white/95 p-3 text-[#10201a]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Indoor Air
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#30443c]">{current.indoorTip}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-emerald-950/50 px-3 py-2 text-xs text-emerald-100">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            {current.impactNote}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
        </div>
      </motion.div>

      {/* Lightweight City Skyline SVG Illustration */}
      <svg
        viewBox="0 0 600 90"
        className="relative z-10 mt-4 w-full text-emerald-200/25"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 90V64h28V42h24v22h18V28h32v36h16V48h26v16h22V20h34v44h18V38h28v26h20V16h38v48h16V44h30v20h20V26h32v38h18V50h24v14h24V32h34v32h22V46h28v44H0z"
        />
        <circle cx="92" cy="18" r="6" fill="currentColor" opacity="0.45" />
        <circle cx="485" cy="16" r="10" fill="currentColor" opacity="0.35" />
      </svg>
    </div>
  );
}
