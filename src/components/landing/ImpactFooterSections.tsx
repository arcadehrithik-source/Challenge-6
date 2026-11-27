import Link from "next/link";
import { CheckCircle2, ShieldCheck, Wind } from "lucide-react";
import { PrimaryCtaActions } from "./HeroSection";
import { WORKFLOW_STEPS } from "./landing-content";

/** Workflow, transparent environmental impact banner, final CTA, and footer sections. */
export function WorkflowAndFooterSections() {
  return (
    <>
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
              <div key={item.step} className="rounded-2xl border border-[#dce5df] bg-[#f7faf8] p-6">
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
                BreatheWise pairs personal exposure guidance with low-emission everyday choices—and
                shows the exact emission-factor baselines behind every estimated kilogram of CO2
                avoided.
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
                  Budget-aware recommendations prioritize free ventilation timing, damp mopping, and
                  route shifts before paid hardware.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-[#10201a]">
            Ready for a personalized daily air-quality plan?
          </h2>
          <p className="mt-3 text-base text-[#4b5e56]">
            Set up your city, household, and commute in under a minute—saved locally in your browser
            with zero unnecessary data collection.
          </p>
          <PrimaryCtaActions
            secondaryHref="/dashboard"
            secondaryLabel="Explore Live Prototype Dashboard"
            secondaryVariant="secondary"
            centered
          />
        </div>
      </section>

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
    </>
  );
}
