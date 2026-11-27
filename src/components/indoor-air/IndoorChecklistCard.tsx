"use client";

import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROOM_CHECKLIST_INITIAL = [
  {
    room: "Kitchen",
    items: [
      { id: "room-k1", text: "Turn on exhaust fan or open kitchen vent 2 minutes before cooking" },
      { id: "room-k2", text: "Keep lids on boiling/simmering pots to reduce aerosol & fuel waste" },
    ],
  },
  {
    room: "Living Room",
    items: [
      { id: "room-l1", text: "Damp-mop hard floors rather than dry broom sweeping" },
      {
        id: "room-l2",
        text: "Eliminate incense sticks, dhoop, candles, and indoor mosquito coils",
      },
    ],
  },
  {
    room: "Bedroom",
    items: [
      { id: "room-b1", text: "Seal window frame drafts during evening/night smog episodes" },
      {
        id: "room-b2",
        text: "Wash pillowcases & curtains regularly to limit settled particulate dust",
      },
    ],
  },
];

/**
 * Interactive room-by-room indoor air hygiene checklist for Kitchen, Living Room, and Bedroom.
 */
export function IndoorChecklistCard() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room-by-Room Indoor Air Checklist</CardTitle>
        <CardDescription>Practical steps across Kitchen, Living Room, and Bedroom.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {ROOM_CHECKLIST_INITIAL.map((group) => (
          <div key={group.room} className="rounded-2xl border border-[#dce5df] bg-[#f8fbf9] p-4">
            <h3 className="font-bold text-[#10201a]">{group.room}</h3>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => {
                const isDone = Boolean(checked[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggle(item.id)}
                    className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isDone
                        ? "border-emerald-300 bg-emerald-50 text-[#30443c] line-through"
                        : "border-[#dce5df] bg-white text-[#10201a]"
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                    ) : (
                      <Square
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#4b5e56]"
                        aria-hidden="true"
                      />
                    )}
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
