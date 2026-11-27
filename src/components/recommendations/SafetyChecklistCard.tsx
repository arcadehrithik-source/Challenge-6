"use client";

import { CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChecklistItem } from "@/lib/types";

export function SafetyChecklistCard({
  title,
  description,
  checklist,
  onToggle,
  showDetails = true,
}: {
  title: string;
  description: string;
  checklist: ChecklistItem[];
  onToggle: (id: string) => void;
  showDetails?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {checklist.map((item) => (
          <button
            key={item.id}
            type="button"
            role="checkbox"
            aria-checked={item.completed}
            onClick={() => onToggle(item.id)}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
              item.completed
                ? "border-emerald-300 bg-emerald-50/70"
                : "border-[#dce5df] bg-white hover:bg-[#f7faf8]"
            }`}
          >
            {item.completed ? (
              <CheckSquare
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
            ) : (
              <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#4b5e56]" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-semibold ${
                  item.completed ? "line-through text-[#4b5e56]" : "text-[#10201a]"
                }`}
              >
                {item.label}
              </p>
              {showDetails && (
                <p className="mt-0.5 text-[11px] text-[#4b5e56]">
                  {item.exposureReductionNote} • ~{item.co2AvoidedKg} kg CO2
                </p>
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
