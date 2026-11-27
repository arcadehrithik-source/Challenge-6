"use client";

import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AssistantStructuredResponse } from "@/lib/types";
import { AssistantResponseView, submitAssistantQuery } from "./AssistantResponseView";

const SAMPLE_PROMPTS = [
  "Is it safe to go jogging today?",
  "What should my family do during severe smog?",
  "How can I improve indoor air quality without spending much?",
  "Should I use my bicycle or take public transport today?",
  "What should my child do instead of playing outside?",
  "How can I reduce my household pollution footprint?",
];

/**
 * Interactive modal dialog for grounded AI air-quality Q&A with deterministic fallback support.
 */
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
      const result = await submitAssistantQuery({ question: trimmed, airQuality, profile });
      setResponse(result);
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

          {response && <AssistantResponseView response={response} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
