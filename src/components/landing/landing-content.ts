import { Activity, BarChart3, Bike, CloudFog, Compass, Home, Leaf, Users } from "lucide-react";

export const LANDING_NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#impact", label: "Impact" },
] as const;

export const PROBLEM_CARDS = [
  {
    icon: CloudFog,
    title: "Winter Smog Traps",
    description:
      "Temperature inversions pin morning and evening traffic and biomass smoke near street level, making dawn walks and school runs peak exposure hours.",
  },
  {
    icon: Home,
    title: "Hidden Indoor Spikes",
    description:
      "Cooking fumes, dry sweeping, incense, and poorly timed window opening can push indoor PM2.5 higher than outdoor street air.",
  },
  {
    icon: Bike,
    title: "Commute Inhalation",
    description:
      "Cyclists, walkers, and two-wheeler riders inhale 2–5x more particulates along congested corridors than inside sheltered transit.",
  },
  {
    icon: Users,
    title: "Household Vulnerability",
    description:
      "Children, senior citizens, students, and outdoor workers need tailored routines—not a single generic city AQI number.",
  },
] as const;

export const FEATURE_CARDS = [
  {
    icon: Activity,
    title: "Real-Time AQI Intelligence",
    description:
      "Live Open-Meteo pollutant feeds converted into transparent Indian NAQI (CPCB) categories with clear observed vs forecast vs demo labels.",
  },
  {
    icon: Compass,
    title: "Personalized Daily Routines",
    description:
      "Time-of-day plans tailored to your household, commute, cooking fuel, and budget—with clear reasoning behind every step.",
  },
  {
    icon: Home,
    title: "Indoor Air Guidance",
    description:
      "Practical ventilation windows, cooking exhaust habits, HEPA setup tips, and honest zero-cost actions when no purifier is available.",
  },
  {
    icon: Bike,
    title: "Smart Commute Assistant",
    description:
      "Compare walking, cycling, public transit, two-wheeler, and car across travel time, CO2 emissions, and modeled exposure.",
  },
  {
    icon: Leaf,
    title: "Sustainable Alternatives",
    description:
      "Connect healthier daily choices to lower neighborhood emissions through carpooling, transit shifts, and zero-idling habits.",
  },
  {
    icon: BarChart3,
    title: "Transparent Impact Tracker",
    description:
      "Track completed household actions, streaks, and estimated CO2 avoided with every baseline assumption openly explained.",
  },
] as const;

export const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Understand your environment",
    description:
      "Fetch live city pollutant levels (PM2.5, PM10, NO2, O3) or explore clearly labeled winter smog simulation scenarios.",
  },
  {
    step: "02",
    title: "Understand your lifestyle",
    description:
      "Share your household composition, commute mode, indoor ventilation, cooking fuel, and budget in a 60-second setup.",
  },
  {
    step: "03",
    title: "Generate personalized actions",
    description:
      "Receive prioritized recommendations explaining what to do, why it matters, when to act, and ask BreatheWise Intelligence anything.",
  },
  {
    step: "04",
    title: "Track your impact",
    description:
      "Check off daily clean-air and low-emission habits to see exposure-reduction wins and estimated CO2 avoided.",
  },
] as const;
