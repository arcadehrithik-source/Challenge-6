"use client";

import Link from "next/link";
import {
  Activity,
  Award,
  Bell,
  Bike,
  CalendarClock,
  Home,
  LayoutDashboard,
  Leaf,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
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

/** Vertical navigation link group shared across desktop sidebar and mobile drawer. */
export function SidebarNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
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

/** Accessible alerts popover displaying the highest-priority daily safety recommendation. */
export function AlertsPopover({
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

/** Accessible mobile slide-over navigation drawer with modal dialog semantics and close ref. */
export function MobileNavDrawer({
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
