"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CITIES } from "@/lib/cities";
import { userProfileSchema } from "@/lib/schemas";
import type { UserProfile } from "@/lib/types";
import {
  COMMUTE_MODES,
  HOUSEHOLD_OPTIONS,
  INDOOR_TOGGLES,
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

interface StepProps {
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
export function StepLocation({ form, watchedValues }: StepProps) {
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
export function StepHousehold({ form, watchedValues }: StepProps) {
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
export function StepLifestyle({ form, watchedValues }: StepProps) {
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

/** Step 4: Commute mode and one-way trip distance configuration. */
export function StepCommute({ form, watchedValues }: StepProps) {
  const distError = form.formState.errors.commuteDistanceKm?.message;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">How do you usually commute?</h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Used to compare exposure and CO2 alternatives tailored to your trip length.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {COMMUTE_MODES.map((opt) => {
          const active = watchedValues.commute === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => form.setValue("commute", opt.value)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? "border-[#0d3b2e] bg-[#0d3b2e] text-white"
                  : "border-[#dce5df] bg-white text-[#10201a] hover:bg-[#f7faf8]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-xs">
        <Label htmlFor="distance-input">Typical one-way commute distance (km)</Label>
        <Input
          id="distance-input"
          type="number"
          min={0}
          max={120}
          className="mt-1.5"
          aria-invalid={Boolean(distError)}
          aria-describedby={distError ? "distance-error" : undefined}
          {...form.register("commuteDistanceKm", { valueAsNumber: true })}
        />
        {distError && (
          <p id="distance-error" role="alert" className="mt-1 text-xs text-red-700">
            {distError}
          </p>
        )}
      </div>
    </div>
  );
}

/** Step 5 (Optional): Indoor equipment, ventilation habits, and cooking fuel profile. */
export function StepIndoor({ form, watchedValues }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Tell us about your indoor environment</h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Optional step—helps us avoid recommending equipment you don&apos;t have and spotlight
          zero-cost indoor wins.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {INDOOR_TOGGLES.map((toggle) => {
          const checked = Boolean(watchedValues.indoorEnvironment?.[toggle.key]);
          return (
            <button
              key={toggle.key}
              type="button"
              role="switch"
              aria-checked={checked}
              onClick={() => form.setValue(`indoorEnvironment.${toggle.key}`, !checked)}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                checked
                  ? "border-[#0d3b2e] bg-emerald-50 text-[#0d3b2e]"
                  : "border-[#dce5df] bg-white text-[#30443c]"
              }`}
            >
              <span>{toggle.label}</span>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  checked ? "bg-[#0d3b2e] text-white" : "bg-[#edf3ef] text-[#4b5e56]"
                }`}
              >
                {checked ? "Yes" : "No"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cooking-fuel">Primary cooking fuel</Label>
          <select
            id="cooking-fuel"
            className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd7cf] bg-white px-3 text-sm"
            {...form.register("indoorEnvironment.cookingFuel")}
          >
            <option value="lpg_png">LPG / Piped Natural Gas (PNG)</option>
            <option value="electric_induction">Electric / Induction</option>
            <option value="solid_biomass_kerosene">Solid Fuel / Biomass / Kerosene</option>
          </select>
        </div>

        <div>
          <Label htmlFor="ventilation-level">Home ventilation conditions</Label>
          <select
            id="ventilation-level"
            className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd7cf] bg-white px-3 text-sm"
            {...form.register("indoorEnvironment.ventilation")}
          >
            <option value="cross_ventilated">Good cross-ventilation</option>
            <option value="moderate">Moderate airflow</option>
            <option value="sealed_limited">Limited / single-side windows</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/** Step 6 (Optional): Sustainability priority, recommendation budget, and briefing schedule. */
export function StepPreferences({ form }: Pick<StepProps, "form">) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">
          Fine-tune your priorities &amp; budget
        </h1>
        <p className="mt-1 text-sm text-[#4b5e56]">
          Saved locally in your browser; editable anytime from Settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="priority-select">Primary goal</Label>
          <select
            id="priority-select"
            className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd7cf] bg-white px-3 text-sm"
            {...form.register("preferences.sustainabilityPriority")}
          >
            <option value="protect_health">Protect family health first</option>
            <option value="reduce_emissions">Cut transport &amp; household emissions</option>
            <option value="save_energy">Lower home energy waste</option>
            <option value="low_cost_living">Practical zero-cost habits</option>
          </select>
        </div>

        <div>
          <Label htmlFor="budget-select">Recommendation budget</Label>
          <select
            id="budget-select"
            className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd7cf] bg-white px-3 text-sm"
            {...form.register("preferences.budget")}
          >
            <option value="zero_low_cost">Zero / Low-cost practical steps</option>
            <option value="moderate">Moderate (masks, filters, sealing)</option>
            <option value="flexible">Flexible (HEPA / upgrades open)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dce5df] bg-[#f7faf8] p-4">
        <div>
          <p className="text-sm font-semibold text-[#10201a]">Daily morning briefing preference</p>
          <p className="text-xs text-[#4b5e56]">
            Sets preferred morning check-in time in your local dashboard plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="time"
            aria-label="Preferred daily briefing time"
            className="w-32"
            {...form.register("preferences.notificationTime")}
          />
        </div>
      </div>
    </div>
  );
}
