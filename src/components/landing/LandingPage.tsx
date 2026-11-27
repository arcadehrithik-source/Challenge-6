"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Menu, ShieldCheck, Sparkles, Wind, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroVisual } from "./HeroVisual";
import { FEATURE_CARDS, LANDING_NAV_LINKS, PROBLEM_CARDS, WORKFLOW_STEPS } from "./landing-content";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#10201a]">
      {/* Navigation */}
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
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-900">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Challenge 6 • Urban Air Quality Assistant
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#10201a] sm:text-5xl lg:text-6xl">
                Breathe smarter. Live healthier.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#42554e]">
                Your personal AI companion for navigating urban air pollution, protecting your
                family, and making healthier everyday choices.
              </p>
              <p className="mt-3 max-w-xl text-sm font-medium text-[#0d3b2e]">
                &ldquo;Don&apos;t just tell people how polluted their city is. Tell them what they
                should do differently today, why it matters, and what impact their decisions
                create.&rdquo;
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button size="lg" asChild>
                  <Link href="/onboarding">
                    Build My Air Quality Plan
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[#dce5df] pt-6">
                <div>
                  <dt className="text-xs text-[#4b5e56]">AQI Standard</dt>
                  <dd className="mt-0.5 text-sm font-bold text-[#10201a]">Indian NAQI (CPCB)</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#4b5e56]">Household Personas</dt>
                  <dd className="mt-0.5 text-sm font-bold text-[#10201a]">5 Tailored Profiles</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#4b5e56]">Privacy Model</dt>
                  <dd className="mt-0.5 text-sm font-bold text-[#10201a]">Local-First Profile</dd>
                </div>
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-6"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </section>

        {/* Problem Awareness */}
        <section className="border-y border-[#dce5df] bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Why Static AQI Numbers Fall Short
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#10201a]">
                Air pollution changes hour by hour—and hits every household differently
              </h2>
              <p className="mt-3 text-base text-[#4b5e56]">
                A single number on a weather widget cannot tell a school parent, a cyclist, and a
                remote worker what to change today.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROBLEM_CARDS.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="bg-[#f9fbf9]">
                    <CardContent className="p-6">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f1e9] text-[#0d3b2e]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-base font-bold text-[#10201a]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4b5e56]">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Actionable Intelligence Platform
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#10201a]">
                Built to turn pollution data into everyday protection and cleaner habits
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d3b2e] text-emerald-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-lg font-bold text-[#10201a]">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4b5e56]">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-y border-[#dce5df] bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Four-Step Workflow
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#10201a]">How BreatheWise AI works</h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {WORKFLOW_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[#dce5df] bg-[#f7faf8] p-6"
                >
                  <span className="text-xs font-bold tracking-widest text-emerald-800">
                    STEP {item.step}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-[#10201a]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b5e56]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Environmental Impact */}
        <section id="impact" className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 rounded-3xl border border-[#c7dbcf] bg-[#0d3b2e] p-8 text-white lg:grid-cols-12 lg:p-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Transparent Impact Methodology
                </span>
                <h2 className="mt-4 text-3xl font-bold">
                  Every personal protection decision can also reduce urban emissions
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                  BreatheWise pairs personal exposure guidance with low-emission everyday
                  choices—and shows the exact emission-factor baselines behind every estimated
                  kilogram of CO2 avoided.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-emerald-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Compares solo cars against metro, bus, cycling, and walking baselines
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Never exaggerates indoor plants or unverified offset claims
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    Works reliably with deterministic intelligence even without external AI keys
                  </li>
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs text-emerald-200">Public Transit vs Solo Car</p>
                  <p className="mt-1 text-2xl font-bold">~76% lower</p>
                  <p className="mt-1 text-xs text-emerald-100/80">
                    Modeled CO2 per passenger-km on a typical 10 km city commute.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs text-emerald-200">Clean Cooking Exhaust</p>
                  <p className="mt-1 text-2xl font-bold">15–20%</p>
                  <p className="mt-1 text-xs text-emerald-100/80">
                    Fuel saved with lids on pots + active kitchen ventilation.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-5 sm:col-span-2">
                  <p className="text-xs text-emerald-200">Zero-Cost Protection First</p>
                  <p className="mt-1 text-sm font-medium text-emerald-50">
                    Budget-aware recommendations prioritize free ventilation timing, damp mopping,
                    and route shifts before paid hardware.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-[#10201a]">
              Ready for a personalized daily air-quality plan?
            </h2>
            <p className="mt-3 text-base text-[#4b5e56]">
              Set up your city, household, and commute in under a minute—saved locally in your
              browser with zero unnecessary data collection.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/onboarding">
                  Build My Air Quality Plan
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Explore Live Prototype Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dce5df] bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-[#10201a]">
              <Wind className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              BreatheWise AI
            </div>
            <p className="mt-1.5 max-w-md text-xs text-[#4b5e56]">
              Prototype built for Challenge 6 (PromptWars). Informational air quality guidance
              only—never a substitute for medical diagnosis or clinical advice.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-medium text-[#30443c]">
            <Link href="/onboarding" className="hover:text-[#0d3b2e]">
              Onboarding
            </Link>
            <Link href="/dashboard" className="hover:text-[#0d3b2e]">
              Dashboard
            </Link>
            <Link href="/dashboard/indoor-air" className="hover:text-[#0d3b2e]">
              Indoor Air
            </Link>
            <Link href="/dashboard/commute" className="hover:text-[#0d3b2e]">
              Smart Commute
            </Link>
            <Link href="/dashboard/impact" className="hover:text-[#0d3b2e]">
              Impact Tracker
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
