import { describe, expect, it } from "vitest";
import { calculateIndianAqi, describePollutant, getAqiCategory } from "@/lib/aqi";

describe("Indian NAQI calculation & categorization", () => {
  it("categorizes AQI breakpoints accurately per CPCB standard", () => {
    expect(getAqiCategory(25)).toBe("Good");
    expect(getAqiCategory(50)).toBe("Good");
    expect(getAqiCategory(51)).toBe("Satisfactory");
    expect(getAqiCategory(100)).toBe("Satisfactory");
    expect(getAqiCategory(150)).toBe("Moderate");
    expect(getAqiCategory(250)).toBe("Poor");
    expect(getAqiCategory(350)).toBe("Very Poor");
    expect(getAqiCategory(450)).toBe("Severe");
  });

  it("computes PM2.5 and PM10 sub-indices and chooses the highest pollutant driver", () => {
    const good = calculateIndianAqi({ pm25: 15, pm10: 30 });
    expect(good.category).toBe("Good");
    expect(good.aqi).toBeLessThanOrEqual(50);

    const poor = calculateIndianAqi({ pm25: 105, pm10: 180 });
    expect(poor.category).toBe("Poor");
    expect(poor.mainPollutant).toBe("PM2.5");

    const dustDriven = calculateIndianAqi({ pm25: 40, pm10: 320 });
    expect(dustDriven.mainPollutant).toBe("PM10");
    expect(dustDriven.category).toBe("Poor");
  });

  it("handles missing or negative pollutant values safely without NaN", () => {
    const res = calculateIndianAqi({ pm25: null, pm10: null, no2: -5 });
    expect(res.aqi).toBe(0);
    expect(res.category).toBe("Good");
    expect(describePollutant("PM2.5", null)).toContain("Unavailable");
  });
});
