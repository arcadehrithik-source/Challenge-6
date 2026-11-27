"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu, RefreshCw, Sparkles, X } from "lucide-react";
import { BreatheWiseAssistantDialog } from "@/components/assistant/BreatheWiseAssistantDialog";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatEnumLabel } from "@/lib/utils";
import { AlertsPopover, MobileNavDrawer, SidebarNavLinks } from "./DashboardNav";
import { Logo } from "./Logo";

/**
 * Shared dashboard layout shell with accessible skip link, top feed controls,
 * responsive desktop sidebar / mobile drawer, demo indicator banner, and AI dialog.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    profile,
    airQuality,
    isLoadingAirQuality,
    dataMode,
    switchDataMode,
    refreshAirQuality,
    recommendations,
    setAssistantOpen,
  } = useBreatheWise();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeDrawerButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevSidebarOpenRef = useRef(false);

  useEffect(() => {
    if (sidebarOpen) {
      closeDrawerButtonRef.current?.focus();
    } else if (prevSidebarOpenRef.current) {
      menuButtonRef.current?.focus();
    }
    prevSidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setAlertsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#10201a]">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#0d3b2e] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-[#dce5df] bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#d0ddd5] lg:hidden"
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Logo href="/" />
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#dce5df] bg-[#f7faf8] px-3 py-1.5 text-xs md:flex">
            <MapPin className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span className="font-semibold text-[#10201a]">
              {airQuality.city}
              {profile.locality ? `, ${profile.locality}` : ""}
            </span>
            <Badge variant={airQuality.dataMode === "live" ? "emerald" : "amber"}>
              {airQuality.dataMode === "live" ? "Live API" : "Demo Simulation"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => switchDataMode(dataMode === "live" ? "demo" : "live")}
              title="Toggle between live Open-Meteo data and clearly labeled demo mode"
              className="hidden sm:inline-flex"
            >
              {dataMode === "live" ? "Demo Mode" : "Use Live API"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              aria-label="Refresh air quality data"
              onClick={() => void refreshAirQuality()}
              disabled={isLoadingAirQuality}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoadingAirQuality && "animate-spin")}
                aria-hidden="true"
              />
            </Button>

            <AlertsPopover
              open={alertsOpen}
              onToggle={() => setAlertsOpen((v) => !v)}
              topRec={recommendations[0]}
              healthAdvisory={airQuality.healthAdvisory}
            />

            <Button size="sm" variant="emerald" onClick={() => setAssistantOpen(true)}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Ask BreatheWise AI</span>
            </Button>

            <Link
              href="/onboarding"
              className="hidden items-center gap-2 rounded-full border border-[#d0ddd5] bg-[#f7faf8] px-3 py-1.5 text-xs font-medium text-[#10201a] hover:bg-[#edf3ef] xl:inline-flex"
            >
              <span>{formatEnumLabel(profile.household)}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside
          aria-label="Dashboard navigation"
          className="hidden w-64 shrink-0 border-r border-[#dce5df] bg-white p-4 lg:block"
        >
          <SidebarNavLinks pathname={pathname} />

          <div className="mt-6 rounded-2xl border border-[#dce5df] bg-[#f7faf8] p-4">
            <p className="text-xs font-semibold text-[#10201a]">Active Persona</p>
            <p className="mt-1 text-xs text-[#4b5e56]">
              {formatEnumLabel(profile.lifestyle)} • {formatEnumLabel(profile.commute)}
            </p>
            <Link
              href="/onboarding"
              className="mt-2.5 inline-block text-xs font-semibold text-emerald-800 hover:underline"
            >
              Edit Profile →
            </Link>
          </div>
        </aside>

        <MobileNavDrawer
          open={sidebarOpen}
          pathname={pathname}
          closeButtonRef={closeDrawerButtonRef}
          onClose={() => setSidebarOpen(false)}
        />

        <main id="dashboard-main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {airQuality.dataMode === "demo" && (
            <div
              role="status"
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950"
            >
              <div>
                <span className="font-bold">Demonstration Mode Active: </span>
                <span>
                  {airQuality.fallbackReason ??
                    "Showing simulated hourly pollution patterns for exploration."}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => switchDataMode("live")}
                className="h-7 border-amber-300 bg-white text-xs"
              >
                Try Live Open-Meteo API
              </Button>
            </div>
          )}

          {children}
        </main>
      </div>

      <BreatheWiseAssistantDialog />
    </div>
  );
}
