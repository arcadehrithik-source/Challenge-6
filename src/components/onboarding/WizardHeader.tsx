"use client";

import { Progress } from "@/components/ui/progress";
import { ONBOARDING_STEPS } from "./onboarding-config";

/**
 * Renders the step counter, completion progress bar, and clickable 6-step navigation bar.
 */
export function WizardHeader({
  stepIdx,
  onSelectStep,
}: {
  stepIdx: number;
  onSelectStep: (idx: number) => void;
}) {
  const currentStep = ONBOARDING_STEPS[stepIdx] ?? ONBOARDING_STEPS[0];
  const progressValue = ((stepIdx + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between text-xs font-medium text-[#4b5e56]">
        <span>
          Step {stepIdx + 1} of {ONBOARDING_STEPS.length}: {currentStep.title}
        </span>
        <span>{Math.round(progressValue)}% complete</span>
      </div>
      <Progress value={progressValue} aria-label="Onboarding progress" className="mt-2" />

      <nav aria-label="Onboarding steps" className="mt-4 hidden grid-cols-6 gap-2 sm:grid">
        {ONBOARDING_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === stepIdx;
          const isDone = idx < stepIdx;
          return (
            <button
              key={step.id}
              type="button"
              aria-current={isActive ? "step" : undefined}
              onClick={() => onSelectStep(idx)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "border-[#0d3b2e] bg-[#0d3b2e] text-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-[#dce5df] bg-white text-[#4b5e56]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{step.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
