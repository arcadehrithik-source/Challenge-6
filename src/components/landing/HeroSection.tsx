"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "./HeroVisual";

/** Shared primary/secondary call-to-action button pair used across landing hero and CTA blocks. */
export function PrimaryCtaActions({
  secondaryHref,
  secondaryLabel,
  secondaryVariant,
  centered = false,
}: {
  secondaryHref: string;
  secondaryLabel: string;
  secondaryVariant: "outline" | "secondary";
  centered?: boolean;
}) {
  return (
    <div
      className={
        centered
          ? "mt-7 flex flex-wrap justify-center gap-3"
          : "mt-8 flex flex-wrap items-center gap-3.5"
      }
    >
      <Button size="lg" asChild>
        <Link href="/onboarding">
          Build My Air Quality Plan
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button size="lg" variant={secondaryVariant} asChild>
        {secondaryHref.startsWith("#") ? (
          <a href={secondaryHref}>{secondaryLabel}</a>
        ) : (
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        )}
      </Button>
    </div>
  );
}

/** Landing hero section presenting value proposition and interactive live city preview. */
export function HeroSection() {
  return (
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
            Your personal AI companion for navigating urban air pollution, protecting your family,
            and making healthier everyday choices.
          </p>
          <p className="mt-3 max-w-xl text-sm font-medium text-[#0d3b2e]">
            &ldquo;Don&apos;t just tell people how polluted their city is. Tell them what they
            should do differently today, why it matters, and what impact their decisions
            create.&rdquo;
          </p>

          <PrimaryCtaActions
            secondaryHref="#features"
            secondaryLabel="Explore Features"
            secondaryVariant="outline"
          />

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
  );
}
