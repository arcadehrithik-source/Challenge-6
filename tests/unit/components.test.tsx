import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { BreatheWiseAssistantDialog } from "@/components/assistant/BreatheWiseAssistantDialog";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { BreatheWiseProvider, useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { SafetyChecklistCard } from "@/components/recommendations/SafetyChecklistCard";
import type { ChecklistItem, Recommendation } from "@/lib/types";
import { POOR_AIR_FIXTURE } from "../fixtures/air-quality-fixtures";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function OpenAssistantTrigger() {
  const { setAssistantOpen } = useBreatheWise();
  return (
    <button type="button" onClick={() => setAssistantOpen(true)}>
      Open Assistant
    </button>
  );
}

describe("Accessible UI components", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders AqiBadge with category text, numeric value, and range (not color alone)", () => {
    render(<AqiBadge category="Very Poor" aqi={342} showRange />);
    expect(screen.getByText("Very Poor")).toBeInTheDocument();
    expect(screen.getByText("(342)")).toBeInTheDocument();
    expect(screen.getByText(/301 – 400/)).toBeInTheDocument();
  });

  it("renders RecommendationCard with all structured decision fields", () => {
    const rec: Recommendation = {
      id: "rec-1",
      title: "Run kitchen exhaust",
      whatToDo: "Switch on chimney before cooking.",
      whyItMatters: "Cooking generates indoor PM2.5.",
      whenToDoIt: "Every meal.",
      expectedBenefit: "Lower indoor spikes.",
      difficulty: "Easy",
      estimatedCost: "₹0",
      environmentalImpact: "Saves fuel with lids.",
      supportingData: "LPG fuel configured.",
      priorityScore: 80,
      urgency: "high",
      category: "indoor",
    };

    render(<RecommendationCard item={rec} />);
    expect(screen.getByText("HIGH PRIORITY")).toBeInTheDocument();
    expect(screen.getByText("Run kitchen exhaust")).toBeInTheDocument();
    expect(screen.getByText(/Cooking generates indoor PM2.5/)).toBeInTheDocument();
  });

  it("toggles SafetyChecklistCard items with proper aria-checked semantics", () => {
    const onToggle = vi.fn();
    const items: ChecklistItem[] = [
      {
        id: "c1",
        label: "Avoid indoor incense",
        category: "indoor",
        co2AvoidedKg: 0.25,
        exposureReductionNote: "Cuts PM2.5 spikes",
        completed: false,
      },
    ];

    render(
      <SafetyChecklistCard
        title="Checklist"
        description="Daily steps"
        checklist={items}
        onToggle={onToggle}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("c1");
  });

  it("validates onboarding step 1 errors and navigates across steps", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => POOR_AIR_FIXTURE,
      })
    );

    render(
      <BreatheWiseProvider>
        <OnboardingWizard />
      </BreatheWiseProvider>
    );

    const cityInput = screen.getByLabelText(/City \*/i);
    fireEvent.change(cityInput, { target: { value: "!@#" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unsupported characters/i);

    fireEvent.click(screen.getByRole("button", { name: "Delhi" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(
      await screen.findByRole("heading", { name: /Who is in your household/i })
    ).toBeInTheDocument();
  });

  it("submits assistant queries and validates structured responses cleanly", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/api/air-quality")) {
        return { ok: true, json: async () => POOR_AIR_FIXTURE };
      }
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            situationAssessment: "Kolkata is at AQI 241.",
            whatThisMeansForYou: "Shift cardio indoors today.",
            recommendedActions: ["Train indoors.", "Close windows.", "Use transit."],
            whyTheseActionsMatter: "Avoids peak PM2.5.",
            estimatedImpact: "Cuts inhalation exposure.",
            importantPrecautions: "Informational guidance only.",
            dataSourceAndTimestamp: "Open-Meteo Air Quality API",
            providerUsed: "BreatheWise Deterministic Engine",
            isFallback: true,
          }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <BreatheWiseProvider>
        <OpenAssistantTrigger />
        <BreatheWiseAssistantDialog />
      </BreatheWiseProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Assistant/i }));
    const input = await screen.findByLabelText(/Ask BreatheWise Intelligence/i);
    fireEvent.change(input, { target: { value: "Is it safe to jog today?" } });
    fireEvent.click(screen.getByRole("button", { name: /^Ask$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Kolkata is at AQI 241\./i)).toBeInTheDocument();
    });
  });
});
