"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CITIES } from "@/lib/cities";
import { userProfileSchema } from "@/lib/schemas";
import type { UserProfile } from "@/lib/types";
import {
  HOUSEHOLD_OPTIONS,
  LIFESTYLE_OPTIONS,
  type OnboardingCardOption,
} from "../onboarding-config";

export type OnboardingFormValues = z.input<typeof userProfileSchema>;

type WatchedOnboardingValues = Partial<{
  city: string;
  locality: string;
  household: UserProfile["household"];
  lifestyle: UserProfile["lifestyle"];
  commute: UserProfile["commute"];
  commuteDistanceKm: number;
  indoorEnvironment: Partial<UserProfile["indoorEnvironment"]>;
}>;

export interface OnboardingStepProps {
  form: UseFormReturn<OnboardingFormValues>;
  watchedValues: WatchedOnboardingValues;
}

function OptionCardGrid<T extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: ReadonlyArray<OnboardingCardOption<T>>;
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const active = selectedValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(opt.value)}
            className={`flex flex-col rounded-xl border p-4 text-left transition-colors cursor-pointer ${
              active
                ? "border-[#0d3b2e] bg-emerald-50/70"
                : "border-[#dce5df] bg-white hover:bg-[#f7faf8]"
            }`}
          >
            <span className="font-semibold text-[#10201a]">{opt.label}</span>
            <span className="mt-1 text-xs text-[#4b5e56]">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Step 1: City preset chips or custom city/locality location selection. */
export function StepLocation({ form, watchedValues }: OnboardingStepProps) {
  const cityError = form.formState.errors.city?.message;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Where do you spend most of your day?</h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Choose a city preset or enter any city name manually. No street address or personal
          identity is requested.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4b5e56]">
          Quick City Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CITIES.slice(0, 6).map((c) => {
            const selected =
              (watchedValues.city ?? "").trim().toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  form.setValue("city", c.name, { shouldValidate: true });
                  form.setValue("latitude", c.latitude);
                  form.setValue("longitude", c.longitude);
                }}
                className={`min-h-8 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selected
                    ? "border-[#0d3b2e] bg-[#0d3b2e] text-white"
                    : "border-[#cbd7cf] bg-white text-[#10201a] hover:bg-[#edf3ef]"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city-input">City *</Label>
          <Input
            id="city-input"
            placeholder="e.g., Kolkata, Delhi, Asansol"
            className="mt-1.5"
            aria-invalid={Boolean(cityError)}
            aria-describedby={cityError ? "city-error" : undefined}
            {...form.register("city", {
              onChange: () => {
                form.setValue("latitude", undefined);
                form.setValue("longitude", undefined);
              },
            })}
          />
          {cityError && (
            <p id="city-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">
              {cityError}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="locality-input">Locality / Neighborhood (optional)</Label>
          <Input
            id="locality-input"
            placeholder="e.g., Salt Lake, Indiranagar"
            className="mt-1.5"
            {...form.register("locality")}
          />
        </div>
      </div>
    </div>
  );
}

/** Step 2: Household composition selection for vulnerability-aware recommendations. */
export function StepHousehold({ form, watchedValues }: OnboardingStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Who is in your household?</h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Children and senior citizens have distinct respiratory sensitivity and timing needs.
        </p>
      </div>
      <OptionCardGrid
        options={HOUSEHOLD_OPTIONS}
        selectedValue={watchedValues.household}
        onSelect={(val) => form.setValue("household", val)}
      />
    </div>
  );
}

/** Step 3: Daily activity profile selection. */
export function StepLifestyle({ form, watchedValues }: OnboardingStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">
          Which daily routine describes you best?
        </h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Your breathing rate and hours spent outdoors shape our priority guidance.
        </p>
      </div>
      <OptionCardGrid
        options={LIFESTYLE_OPTIONS}
        selectedValue={watchedValues.lifestyle}
        onSelect={(val) => form.setValue("lifestyle", val)}
      />
    </div>
  );
}
