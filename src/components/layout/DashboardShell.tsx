"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Award,
  Bell,
  Bike,
  CalendarClock,
  Home,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  RefreshCw,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { BreatheWiseAssistantDialog } from "@/components/assistant/BreatheWiseAssistantDialog";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/types";
import { cn, formatEnumLabel } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/air-quality", label: "Air Quality", icon: Activity },
  { href: "/dashboard/plan", label: "My Daily Plan", icon: CalendarClock },
  { href: "/dashboard/indoor-air", label: "Indoor Air", icon: Home },
  { href: "/dashboard/commute", label: "Smart Commute", icon: Bike },
  { href: "/dashboard/sustainability", label: "Sustainability", icon: Leaf },
  { href: "/dashboard/impact", label: "Impact Tracker", icon: Award },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SidebarNavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#0d3b2e] text-white"
                : "text-[#30443c] hover:bg-[#edf3ef] hover:text-[#10201a]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AlertsPopover({
  open,
  onToggle,
  topRec,
  healthAdvisory,
}: {
  open: boolean;
  onToggle: () => void;
  topRec?: Recommendation;
  healthAdvisory: string;
}) {
  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        aria-label="View daily air alerts"
        aria-expanded={open}
        aria-controls="daily-alerts-popover"
        onClick={onToggle}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>
      {open && (
        <div
          id="daily-alerts-popover"
          role="region"
          aria-label="Air quality alert summary"
          className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-[#dce5df] bg-white p-4 shadow-xl"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Top Daily Priority
          </p>
          <p className="mt-1 text-sm font-semibold text-[#10201a]">
            {topRec?.title ?? "Check current AQI conditions"}
          </p>
          <p className="mt-1 text-xs text-[#4b5e56]">{topRec?.whenToDoIt ?? healthAdvisory}</p>
        </div>
      )}
    </div>
  );
}

function MobileNavDrawer({
  open,
  pathname,
  closeButtonRef,
  onClose,
}: {
  open: boolean;
  pathname: string;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile dashboard navigation"
        className="relative z-50 w-72 bg-white p-4 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <Logo href="/" />
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#edf3ef]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarNavLinks pathname={pathname} onNavigate={onClose} />
      </aside>
    </div>
  );
}

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
