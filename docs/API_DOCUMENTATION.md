# API Documentation

## 1. `GET /api/air-quality`
Fetches live Open-Meteo air quality data converted into the Indian NAQI (CPCB) scale, or returns a clearly labeled Demonstration Mode simulation when requested or when upstream feeds fail.

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `city` | string | No (default `Kolkata`) | 2–80 chars (`[a-zA-Z\s.,-]+`) |
| `locality` | string | No | Optional neighborhood label (`<= 100` chars) |
| `lat`, `lon` | number | No | Optional coordinates (`-90..90`, `-180..180`) |
| `mode` | `"live" \| "demo"` | No (default `"live"`) | Selects live API vs simulated demonstration mode |
| `scenario` | `"auto" \| "good" \| "moderate" \| "poor" \| "severe"` | No (default `"auto"`) | Simulation preset |

### Responses
- `200 OK`: Returns `AirQualitySnapshot` JSON with `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
- `400 Bad Request`: Zod validation failure with descriptive `details`.
- `429 Too Many Requests`: Rate limit exceeded (`45 req / 60s` per client identifier).

---

## 2. `POST /api/assistant`
Generates structured, context-aware air quality guidance using the configured LLM provider (`openai` or `gemini`) or the deterministic fallback engine (`AI_PROVIDER=none`).

### Request Body (`<= 16 KB`)
Validated against `assistantRequestSchema`:
- `question`: string (3–600 chars)
- `context`: `{ location, aqi, aqiCategory, pm25, pm10, dataMode, updatedAt, household, lifestyle, commute, commuteDistanceKm, indoorEnvironment, preferences }`

### Responses
- `200 OK`: `AssistantStructuredResponse` (`situationAssessment`, `whatThisMeansForYou`, `recommendedActions`, `whyTheseActionsMatter`, `estimatedImpact`, `importantPrecautions`, `dataSourceAndTimestamp`, `providerUsed`, `isFallback`).
- `400 Bad Request`: Invalid JSON or schema validation error.
- `413 Payload Too Large`: Request body exceeds `16,384` bytes.
- `429 Too Many Requests`: Rate limit exceeded (`12 req / 60s` per client identifier).

---

## 3. `GET /api/health`
Reports service status and whether an optional external LLM provider is configured without exposing keys.
