export const MOCK_OPEN_METEO_RESPONSE = {
  latitude: 22.5726,
  longitude: 88.3639,
  hourly: {
    time: [
      new Date(Date.now() - 3600_000).toISOString(),
      new Date().toISOString(),
      new Date(Date.now() + 3600_000).toISOString(),
    ],
    pm2_5: [95, 102, 88],
    pm10: [170, 190, 165],
    nitrogen_dioxide: [55, 62, 50],
    ozone: [40, 44, 48],
  },
};

export const MOCK_OPENAI_CHAT_RESPONSE = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          situationAssessment: "Kolkata is currently experiencing Poor air quality (AQI 241).",
          whatThisMeansForYou: "Avoid outdoor jogging and take closed public transit today.",
          recommendedActions: [
            "Move cardio indoors away from street windows.",
            "Take metro or AC bus instead of cycling.",
            "Keep kitchen exhaust running while cooking.",
          ],
          whyTheseActionsMatter: "Lower minute ventilation cuts fine particle deposition.",
          estimatedImpact: "Reduces daily particulate exposure and keeps commute CO2 low.",
          importantPrecautions: "Informational guidance only; consult a doctor if symptomatic.",
        }),
      },
    },
  ],
};
