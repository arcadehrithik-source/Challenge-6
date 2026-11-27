"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Leaf,
  MapPin,
  Route,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { userProfileSchema } from "@/lib/schemas";
import type { UserProfile } from "@/lib/types";
import {
  type OnboardingFormValues,
  StepCommute,
  StepHousehold,
  StepIndoor,
  StepLifestyle,
  StepLocation,
  StepPreferences,
} from "./steps/OnboardingSteps";

const STEPS = [
  { id: "location", title: "Location", icon: MapPin, optional: false },
  { id: "household", title: "Household", icon: Users, optional: false },
  { id: "lifestyle", title: "Lifestyle", icon: Sparkles, optional: false },
  { id: "commute", title: "Daily Commute", icon: Route, optional: false },
  { id: "indoor", title: "Indoor Environment", icon: Home, optional: true },
  { id: "preferences", title: "Preferences", icon: Leaf, optional: true },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { profile, isHydrated, updateProfile, notify } = useBreatheWise();
  const [stepIdx, setStepIdx] = useState(0);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile,
    mode: "onChange",
  });

  useEffect(() => {
    if (isHydrated) {
      form.reset(profile);
    }
  }, [isHydrated, profile, form]);

  const watchedValues = useWatch({ control: form.control }) as Partial<OnboardingFormValues>;
  const currentStep = STEPS[stepIdx]!;
  const progressValue = ((stepIdx + 1) / STEPS.length) * 100;

  async function handleNext() {
    if (stepIdx === 0) {
      const valid = await form.trigger(["city", "locality"]);
      if (!valid) return;
    }
    if (stepIdx === 3) {
      const valid = await form.trigger(["commute", "commuteDistanceKm"]);
      if (!valid) return;
    }
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    }
  }

  function handleBack() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  function onSubmit(values: OnboardingFormValues) {
    const parsed = userProfileSchema.parse(values);
    const nextProfile: UserProfile = {
      ...parsed,
      updatedAt: new Date().toISOString(),
    };
    updateProfile(nextProfile);
    notify("Air Quality Plan Ready", `Personalized for ${nextProfile.city}.`);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Skip to Dashboard
          </Button>
        </header>

        <main>
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs font-medium text-[#4b5e56]">
              <span>
                Step {stepIdx + 1} of {STEPS.length}: {currentStep.title}
              </span>
              <span>{Math.round(progressValue)}% complete</span>
            </div>
            <Progress value={progressValue} aria-label="Onboarding progress" className="mt-2" />

            <nav aria-label="Onboarding steps" className="mt-4 hidden grid-cols-6 gap-2 sm:grid">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = idx === stepIdx;
                const isDone = idx < stepIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setStepIdx(idx)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#0d3b2e] bg-[#0d3b2e] text-white"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-[#dce5df] bg-white text-[#4b5e56]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {stepIdx === 0 && <StepLocation form={form} watchedValues={watchedValues} />}
                    {stepIdx === 1 && <StepHousehold form={form} watchedValues={watchedValues} />}
                    {stepIdx === 2 && <StepLifestyle form={form} watchedValues={watchedValues} />}
                    {stepIdx === 3 && <StepCommute form={form} watchedValues={watchedValues} />}
                    {stepIdx === 4 && <StepIndoor form={form} watchedValues={watchedValues} />}
                    {stepIdx === 5 && <StepPreferences form={form} />}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ede8] pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={stepIdx === 0}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>

                  <div className="flex items-center gap-2.5">
                    {currentStep.optional && stepIdx < STEPS.length - 1 && (
                      <Button type="button" variant="ghost" onClick={handleNext}>
                        Skip optional step
                      </Button>
                    )}

                    {stepIdx < STEPS.length - 1 ? (
                      <Button key="continue-btn" type="button" onClick={handleNext}>
                        Continue
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    ) : (
                      <Button key="submit-btn" type="submit" variant="emerald">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Generate My Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
