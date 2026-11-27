"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userProfileSchema } from "@/lib/schemas";
import type { UserProfile } from "@/lib/types";
import { ONBOARDING_STEPS } from "./onboarding-config";
import {
  type OnboardingFormValues,
  StepHousehold,
  StepLifestyle,
  StepLocation,
} from "./steps/StepLocationAndPersona";
import { StepCommute, StepIndoor, StepPreferences } from "./steps/StepRoutineAndPreferences";
import { WizardHeader } from "./WizardHeader";

function renderOnboardingStep(
  stepIdx: number,
  form: ReturnType<typeof useForm<OnboardingFormValues>>,
  watchedValues: ReturnType<typeof useWatch<OnboardingFormValues>>
) {
  switch (stepIdx) {
    case 0:
      return <StepLocation form={form} watchedValues={watchedValues} />;
    case 1:
      return <StepHousehold form={form} watchedValues={watchedValues} />;
    case 2:
      return <StepLifestyle form={form} watchedValues={watchedValues} />;
    case 3:
      return <StepCommute form={form} watchedValues={watchedValues} />;
    case 4:
      return <StepIndoor form={form} watchedValues={watchedValues} />;
    default:
      return <StepPreferences form={form} />;
  }
}

/**
 * Multi-step Zod-validated onboarding wizard saving household and commute preferences locally.
 */
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

  const watchedValues = useWatch({ control: form.control });
  const currentStep = ONBOARDING_STEPS[stepIdx] ?? ONBOARDING_STEPS[0];

  async function validateStep(index: number): Promise<boolean> {
    if (index === 0) return form.trigger(["city", "locality"]);
    if (index === 3) return form.trigger(["commute", "commuteDistanceKm"]);
    return true;
  }

  async function handleNext() {
    if (!(await validateStep(stepIdx))) return;
    if (stepIdx < ONBOARDING_STEPS.length - 1) {
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
          <WizardHeader stepIdx={stepIdx} onSelectStep={setStepIdx} />

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
                    {renderOnboardingStep(stepIdx, form, watchedValues)}
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
                    {currentStep.optional && stepIdx < ONBOARDING_STEPS.length - 1 && (
                      <Button type="button" variant="ghost" onClick={handleNext}>
                        Skip optional step
                      </Button>
                    )}

                    {stepIdx < ONBOARDING_STEPS.length - 1 ? (
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
