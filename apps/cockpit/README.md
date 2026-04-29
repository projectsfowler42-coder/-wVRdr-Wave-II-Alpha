# wVRdr~ Wave-I Cockpit

This is the real frontend cockpit mounted inside `~Alpha`.

Base44 is no longer a runtime dependency. The prior Base44 build is only a visual scaffold reference.

## Run locally

```bash
cd apps/cockpit
npm install
npm run dev
```

## Build

```bash
cd apps/cockpit
npm run build
```

## Environment

Create `.env.local` from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_PUBLIC_READ_TOKEN=
```

## Required backend endpoints

- `GET /api/health`
- `GET /api/snapshot`
- `POST /api/operator/intent`

## Hard rules

- No Base44 runtime.
- No hidden mock fallback.
- No invented portfolio values.
- No duplicated backend calculations in the UI.
- If the API fails, show degraded state.
- If data is stale, show stale warning.
- If data is missing or unverified, show explicit warning.
- Backend calculations remain outside the UI.
- The UI only displays backend state and captures operator intent.

## Layout zones

1. Top system/status bar
2. Regime and 5 Things panel
3. Buckets and portfolio panel
4. Actions/audit/quarantine panel

## Doctrine

Market truth → regime state → opportunity classification → wallet permission → position sizing → execution/non-execution → audit trail → learning loop.
