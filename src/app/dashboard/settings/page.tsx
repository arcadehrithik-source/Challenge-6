"use client";

import Link from "next/link";
import { useBreatheWise } from "@/components/providers/BreatheWiseProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnumLabel } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, dataMode, switchDataMode, resetLocalSession } = useBreatheWise();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10201a]">Settings &amp; Profile</h1>
        <p className="text-sm text-[#4b5e56]">
          Manage your locally saved household profile, data source mode, and privacy controls.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Saved Household Profile</CardTitle>
            <CardDescription>
              Stored solely in your browser&apos;s localStorage—no server account or tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7faf8] p-4 text-xs">
              <div>
                <p className="text-[#4b5e56]">Location</p>
                <p className="font-semibold text-[#10201a]">
                  {profile.city}
                  {profile.locality ? `, ${profile.locality}` : ""}
                </p>
              </div>
              <div>
                <p className="text-[#4b5e56]">Household</p>
                <p className="font-semibold text-[#10201a]">{formatEnumLabel(profile.household)}</p>
              </div>
              <div>
                <p className="text-[#4b5e56]">Lifestyle</p>
                <p className="font-semibold text-[#10201a]">{formatEnumLabel(profile.lifestyle)}</p>
              </div>
              <div>
                <p className="text-[#4b5e56]">Commute</p>
                <p className="font-semibold text-[#10201a]">
                  {formatEnumLabel(profile.commute)} ({profile.commuteDistanceKm} km)
                </p>
              </div>
              <div>
                <p className="text-[#4b5e56]">HEPA Purifier</p>
                <p className="font-semibold text-[#10201a]">
                  {profile.indoorEnvironment.hasAirPurifier ? "Available" : "Not available"}
                </p>
              </div>
              <div>
                <p className="text-[#4b5e56]">Budget Preference</p>
                <p className="font-semibold text-[#10201a]">
                  {formatEnumLabel(profile.preferences.budget)}
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/onboarding">Edit Profile in Onboarding Wizard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Mode &amp; Local Privacy</CardTitle>
            <CardDescription>
              Switch between live Open-Meteo environmental data and Demonstration Mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#dce5df] p-4">
              <div>
                <p className="text-sm font-semibold text-[#10201a]">Air Quality Feed Mode</p>
                <p className="text-xs text-[#4b5e56]">
                  Live mode queries Open-Meteo; Demo mode simulates scenarios safely offline.
                </p>
              </div>
              <Badge variant={dataMode === "live" ? "emerald" : "amber"}>
                {dataMode === "live" ? "Live API" : "Demo Mode"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={dataMode === "live" ? "default" : "outline"}
                onClick={() => switchDataMode("live")}
              >
                Use Live API
              </Button>
              <Button
                variant={dataMode === "demo" ? "default" : "outline"}
                onClick={() => switchDataMode("demo")}
              >
                Use Demo Mode
              </Button>
            </div>

            <div className="border-t border-[#e5ede8] pt-4">
              <p className="text-xs text-[#4b5e56]">
                This prototype has no server-side user database or authentication. Clearing local
                data resets all saved preferences and checklist progress on this browser.
              </p>
              <Button variant="destructive" size="sm" className="mt-3" onClick={resetLocalSession}>
                Reset All Local Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
