import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assistantStructuredResponseSchema } from "@/lib/schemas";
import type { AirQualitySnapshot, AssistantStructuredResponse, UserProfile } from "@/lib/types";

/**
 * Calls `/api/assistant` with grounded environmental + profile context and validates the response schema.
 */
export async function submitAssistantQuery(params: {
  question: string;
  airQuality: AirQualitySnapshot;
  profile: UserProfile;
}): Promise<AssistantStructuredResponse> {
  const { question, airQuality, profile } = params;
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      context: {
        location: profile.locality ? `${airQuality.city}, ${profile.locality}` : airQuality.city,
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

  return validated.data;
}

/**
 * Renders the structured 7-part assistant answer card including source telemetry and non-medical precautions.
 */
export function AssistantResponseView({ response }: { response: AssistantStructuredResponse }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2ebe5] pb-2.5">
        <Badge variant={response.isFallback ? "slate" : "emerald"}>{response.providerUsed}</Badge>
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
        <div className="rounded-xl border border-[#e3ece6] bg-white p-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#30443c]">
            Why These Actions Matter
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#4b5e56]">
            {response.whyTheseActionsMatter}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3ece6] bg-white p-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#30443c]">
            Estimated Impact
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#4b5e56]">{response.estimatedImpact}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <span className="font-semibold">Important Precautions: </span>
          {response.importantPrecautions}
        </div>
      </div>
    </div>
  );
}
