# Data Privacy & Minimization

## Principle of Data Minimization

BreatheWise AI avoids collecting sensitive personal data:
- **No** names, emails, phone numbers, government IDs, street addresses, or medical records are requested.
- **Location**: Only city name (and optional broad neighborhood/locality) is used to fetch city-scale air quality.
- **Storage**: Household profile, checklist completions, and streak count are stored exclusively in the user's browser `localStorage` (`breathewise_profile_v1`, `breathewise_checklist_v1`, `breathewise_streak_v1`, `breathewise_data_mode_v1`) and can be wiped anytime via **Settings → Reset All Local Data**.
- **AI Requests**: When the user asks a question in **BreatheWise Intelligence**, only the current question and generalized household/lifestyle context (never personal identity) are sent to `/api/assistant`. When `AI_PROVIDER=none`, nothing leaves the application server.
- **Community Module**: Displays aggregate, non-personal city patterns and shareable advisories; zero individual household records are stored or exposed.

