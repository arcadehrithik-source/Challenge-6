"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { HeroSection } from "./HeroSection";
import { WorkflowAndFooterSections } from "./ImpactFooterSections";
import { LANDING_NAV_LINKS } from "./landing-content";
import { ProblemAndFeaturesSections } from "./PlatformSections";

/**
 * Product landing page introducing BreatheWise AI with responsive navigation
 * and interactive city air-quality decision preview.
 */
export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#10201a]">
      <header className="sticky top-0 z-40 border-b border-[#dce5df] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#30443c] hover:text-[#0d3b2e]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding">
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d0ddd5] text-[#10201a] md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#dce5df] bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
              {LANDING_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#edf3ef]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[#e5ede8] pt-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/onboarding">Build My Air Quality Plan</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        <HeroSection />
        <ProblemAndFeaturesSections />
        <WorkflowAndFooterSections />
      </main>
    </div>
  );
}
