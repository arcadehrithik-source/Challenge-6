import { Clock, Coins, Leaf, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";

const URGENCY_VARIANT: Record<Recommendation["urgency"], "red" | "orange" | "amber" | "emerald"> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "emerald",
};

export function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={URGENCY_VARIANT[item.urgency]}>
              {item.urgency.toUpperCase()} PRIORITY
            </Badge>
            <Badge variant="default">{item.category}</Badge>
          </div>
          <span className="text-xs font-medium text-[#4b5e56]">
            Difficulty: <strong className="text-[#10201a]">{item.difficulty}</strong>
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-[#10201a]">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#2d4038]">{item.whatToDo}</p>

        <div className="mt-4 grid gap-2.5 rounded-xl bg-[#f7faf8] p-3.5 text-xs text-[#30443c] sm:grid-cols-2">
          <div>
            <span className="font-semibold text-[#10201a]">Why it matters: </span>
            {item.whyItMatters}
          </div>
          <div>
            <span className="font-semibold text-[#10201a]">Expected benefit: </span>
            {item.expectedBenefit}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#4b5e56]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>When: {item.whenToDoIt}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Cost: {item.estimatedCost}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Impact: {item.environmentalImpact}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Basis: {item.supportingData}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
