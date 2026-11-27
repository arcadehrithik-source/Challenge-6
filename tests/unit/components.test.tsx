import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { SafetyChecklistCard } from "@/components/recommendations/SafetyChecklistCard";
import type { ChecklistItem, Recommendation } from "@/lib/types";

describe("Accessible UI components", () => {
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
});
