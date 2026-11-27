"use client";

import { useState } from "react";
import { Loader2, Send, ShieldAlert, Sparkles } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { assistantStructuredResponseSchema } from "@/lib/schemas";
import type { AssistantStructuredResponse } from "@/lib/types";

const SAMPLE_PROMPTS = [
  "Is it safe to go jogging today?",
  "What should my family do during severe smog?",
  "How can I improve indoor air quality without spending much?",
  "Should I use my bicycle or take public transport today?",
  "What should my child do instead of playing outside?",
  "How can I reduce my household pollution footprint?",
];

export function BreatheWiseAssistantDialog() {
  const { assistantOpen, setAssistantOpen, airQuality, profile } = useBreatheWise();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantStructuredResponse | null>(null);

  async function askQuestion(promptText: string) {
    const trimmed = promptText.trim();
    if (trimmed.length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuestion(trimmed);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          context: {
            location: profile.locality
              ? `${airQuality.city}, ${profile.locality}`
              : airQuality.city,
            aqi: airQuality.aqi,
            aqiCategory: airQuality.category,
            pm25: airQuality.pm25,
            pm10: airQuality.pm10,
            dataMode: airQuality.dataMode,
            updatedAt: airQuality.updatedAt,
            household: profile.household,
            lifestyle: profile.lifestyle,
            commute: profile.commute,
            commuteDistanceKm: profile.commuteDistanceKm,
            indoorEnvironment: profile.indoorEnvironment,
            preferences: {
              dailyNotifications: profile.preferences.dailyNotifications,
              sustainabilityPriority: profile.preferences.sustainabilityPriority,
              budget: profile.preferences.budget,
            },
          },
        }),
      });

      const rawText = await res.text();
      let payload: unknown = null;
      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          throw new Error("Assistant service returned an unreadable response.");
        }
      }

      if (!res.ok) {
        const errMsg =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Unable to generate response.";
        throw new Error(errMsg);
      }

      const validated = assistantStructuredResponseSchema.safeParse(payload);
      if (!validated.success) {
        throw new Error("Assistant response did not match the expected structure.");
      }

      setResponse(validated.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d3b2e] text-emerald-100">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <DialogTitle>BreatheWise Intelligence</DialogTitle>
          </div>
          <DialogDescription>
            Context-aware guidance grounded in {airQuality.city} (AQI {airQuality.aqi} •{" "}
            {airQuality.category}) and your {profile.household.replace(/_/g, " ")} profile.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void askQuestion(question);
            }}
            className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <Input
              aria-label="Ask BreatheWise Intelligence"
              placeholder="Ask about jogging, kids' play, indoor air, or commuting today..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={600}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              <span>Ask</span>
            </Button>
          </form>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4b5e56]">
              Quick Questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void askQuestion(prompt)}
                  className="max-w-full min-h-[28px] rounded-full border border-[#d0ddd5] bg-[#f6f9f7] px-3 py-1.5 text-left text-xs font-medium whitespace-normal text-[#10201a] hover:bg-[#e8f1eb] cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {error}
            </div>
          )}

          {response && (
            <div className="space-y-3 rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2ebe5] pb-2.5">
                <Badge variant={response.isFallback ? "slate" : "emerald"}>
                  {response.providerUsed}
                </Badge>
                <span className="text-xs text-[#4b5e56]">{response.dataSourceAndTimestamp}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Situation Assessment
                </h3>
                <p className="mt-1 text-sm text-[#10201a]">{response.situationAssessment}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  What This Means For You
                </h3>
                <p className="mt-1 text-sm text-[#10201a]">{response.whatThisMeansForYou}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Recommended Actions
                </h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-[#10201a]">
                  {response.recommendedActions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3 border border-[#e3ece6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#30443c]">
                    Why These Actions Matter
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#4b5e56]">
                    {response.whyTheseActionsMatter}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-[#e3ece6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#30443c]">
                    Estimated Impact
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#4b5e56]">
                    {response.estimatedImpact}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold">Important Precautions: </span>
                  {response.importantPrecautions}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
