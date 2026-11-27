export interface CityPreset {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  winterNote: string;
}

export const SUPPORTED_CITIES: CityPreset[] = [
  {
    name: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    winterNote:
      "Frequent winter thermal inversion traps morning & evening PM2.5 near arterial roads.",
  },
  {
    name: "Delhi",
    state: "Delhi NCR",
    latitude: 28.6139,
    longitude: 77.209,
    winterNote: "Severe winter smog episodes driven by low wind speed, traffic, and regional haze.",
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    winterNote:
      "Coastal breezes moderate afternoon air, while construction dust and traffic peak mornings.",
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    winterNote:
      "Generally moderate baseline with localized corridor congestion spikes at peak hours.",
  },
  {
    name: "Asansol",
    state: "West Bengal",
    latitude: 23.6739,
    longitude: 86.9524,
    winterNote: "Industrial belt & highway dust elevate winter PM10 and PM2.5 during calm nights.",
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    winterNote:
      "Sea-breeze dispersion helps afternoons; calm winter mornings can still hold localized particulates.",
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    winterNote: "Cool winter nights slow dispersion along outer ring and transit corridors.",
  },
  {
    name: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    winterNote: "Valley topography traps morning haze; midday ventilation usually improves.",
  },
];

export function findCityPreset(cityName: string): CityPreset | undefined {
  const normalized = cityName.trim().toLowerCase();
  return SUPPORTED_CITIES.find((c) => c.name.toLowerCase() === normalized);
}
