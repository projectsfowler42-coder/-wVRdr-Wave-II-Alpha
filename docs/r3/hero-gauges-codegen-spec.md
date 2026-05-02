# Hero Gauges Liquid Glass Codegen Spec

Purpose: give an AI code generator a precise build target for the Cockpit Hero Gauges surface and the MDK Truth Bridge endpoint that feeds it.

This spec is for Wave-II~Alpha. It must not create execution paths, broker transport, credential storage, OAuth, order routing, raw private-row storage, or direct Sarlaac/MSP access.

## Current repo context

The repo already contains a safe read-only Hero Gauges contract from PR #32:

- `packages/mdk/cmd/truth-bridge/hero_gauges.go`
- `packages/mdk/cmd/truth-bridge/main.go`
- `apps/cockpit/src/components/HeroGauge.tsx`
- `apps/cockpit/src/components/HeroGaugesPanel.tsx`
- `apps/cockpit/src/services/waveApi.ts`
- `apps/cockpit/src/hooks/useWaveSnapshot.ts`
- `apps/cockpit/src/styles.css`

The code generator must modify or extend those files instead of creating a separate `/cockpit` endpoint or a duplicate dashboard stack.

## Non-negotiable corrections to the draft code

Do not paste the generic backend sample as-is.

Required corrections:

1. Use the existing endpoint: `/api/cockpit/hero-gauges`.
2. Do not add unauthenticated `/cockpit`.
3. Do not use `Access-Control-Allow-Origin: *`.
4. Keep the bridge bound to `127.0.0.1:8089` only.
5. Keep the existing local-origin CORS allowlist.
6. Preserve the existing optional device proof/HMAC gate.
7. Do not simulate fake live market state and call it live.
8. Derive Hero Gauges from the existing Truth Bridge envelope.
9. Keep `executionEligible=false` unless the existing truth envelope proves eligibility.
10. Do not create client-side prediction or interpretation logic.

## Doctrine lock

- Cockpit shows truth.
- MDK validates, routes, stores, guards, and certifies truth.
- Hero Gauges are a read-only telemetry surface.
- Hero Gauges do not execute.
- Hero Gauges do not certify.
- Hero Gauges do not browse raw Sarlaac/MSP.
- Hero Gauges do not force-clear stale truth.
- Stale state clears only after verified fresh data arrives.

Required labels:

- REGIME
- VECTORS
- THREATS
- PORTFOLIO
- Truth Bridge
- Truth Spine
- READ ONLY
- execution locked

Forbidden labels:

- direct execution
- guaranteed win
- prediction
- perfect setup
- cannot lose
- live trading enabled

## Backend target

Path:

```text
packages/mdk/cmd/truth-bridge/hero_gauges.go
```

Endpoint:

```text
GET /api/cockpit/hero-gauges
```

Security posture:

```text
listen address: 127.0.0.1:8089 only
CORS: local origins only
method: GET / OPTIONS only
device proof: preserve existing requireDeviceProof() behavior
execution: no external actions
```

Data contract:

```go
type HeroGaugeValue struct {
    Value int    `json:"value"`
    Label string `json:"label"`
}

type HeroGaugeState struct {
    Schema            string         `json:"schema"`
    Regime            HeroGaugeValue `json:"regime"`
    Vectors           HeroGaugeValue `json:"vectors"`
    Threats           HeroGaugeValue `json:"threats"`
    Portfolio         HeroGaugeValue `json:"portfolio"`
    Timestamp         string         `json:"timestamp"`
    TruthClass        string         `json:"truthClass"`
    ExecutionEligible bool           `json:"executionEligible"`
    Source            string         `json:"source"`
}
```

Schema value:

```text
wvrdr.alpha.hero_gauges.v1
```

Backend rules:

- Clamp all gauge values to 0–100.
- Return JSON through the existing `writeJSON` helper.
- Build state from `buildTruthEnvelope()`.
- Use the existing `AlphaTruthResponse` as source-of-truth input.
- Never invent broker holdings or market data.
- Never mark fake demo data as live.
- If data is placeholder or derived from dormant bridge state, label it as DORMANT, READ ONLY, DEGRADED, STALE, FAILED, LOCKED, or VERIFIED as appropriate.
- `ExecutionEligible` must mirror the existing truth envelope, not UI optimism.

Backend acceptance checks:

```bash
pnpm run build
pnpm run typecheck
pnpm run check:local-proof
```

If Go commands are available in the environment:

```bash
go test ./packages/mdk/...
go build ./packages/mdk/cmd/truth-bridge/...
```

## Frontend target

Paths:

```text
apps/cockpit/src/components/HeroGauge.tsx
apps/cockpit/src/components/HeroGaugesPanel.tsx
apps/cockpit/src/services/waveApi.ts
apps/cockpit/src/styles.css
```

Preferred architecture:

- Keep `HeroGauge.tsx` as the single gauge card.
- Keep `HeroGaugesPanel.tsx` as the four-gauge rack.
- Fetch through the existing Cockpit/Wave API service layer.
- Do not bypass the service layer with ad-hoc `fetch()` calls inside visual components.
- Do not use direct `http://127.0.0.1:8089` inside the visual component if an existing API helper exists.

Frontend TypeScript contract:

```ts
export type HeroGaugeValue = {
  value: number;
  label: string;
};

export type HeroGaugeState = {
  schema?: string;
  regime: HeroGaugeValue;
  vectors: HeroGaugeValue;
  threats: HeroGaugeValue;
  portfolio: HeroGaugeValue;
  timestamp?: string;
  truthClass?: string;
  executionEligible?: boolean;
  source?: string;
};
```

Visual target: Liquid Glass Hero Gauges

Layout:

- 2x2 gauge grid on desktop/tablet.
- Stable responsive stack on narrow mobile if needed.
- Four large cards only: REGIME, VECTORS, THREATS, PORTFOLIO.
- No ticker crawl.
- No dense side panels inside the hero rack.

Card styling:

- ivory/bone-white glass surface
- soft translucent panels
- rounded 24–32px corners
- subtle white border
- soft inner highlight
- restrained glow
- no harsh neon flood
- no unreadable low-contrast text

Gauge styling:

- SVG semi-circle arc gauge
- faint grey track arc
- glowing value arc
- smooth transition when value changes
- monospaced numeric value
- label below number

Color mapping:

```ts
function gaugeAccent(value: number): string {
  if (value <= 40) return '#00FFFF';
  if (value <= 60) return '#FFD700';
  if (value <= 80) return '#FFA500';
  return '#FF69B4';
}
```

Typography:

- titles: uppercase sans-serif, bold
- values: monospaced, bold, stable width
- labels: sans-serif, compact, high-contrast
- recommended mono font: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace

Animation:

- Use CSS transition or Framer Motion.
- Animate arc fill only.
- Do not animate layout dimensions.
- Respect reduced-motion users where practical.
- Numeric display must not jitter.

Frontend acceptance checks:

```bash
pnpm run typecheck
pnpm run build
```

## Complete AI codegen prompt

Paste this into the code generator:

```text
ROLE: Senior React/TypeScript and Go engineer. You are working inside the existing Wave-II~Alpha monorepo.

TASK: Harden and polish the Cockpit Hero Gauges dashboard and the MDK Truth Bridge endpoint that feeds it. Match the Liquid Glass visual direction from the provided references: ivory/bone-white glass cards, soft translucent panels, glowing semi-circle gauges, monospaced values, and a clean 2x2 hero layout.

DO NOT create a new app. DO NOT create a new unrelated /cockpit endpoint. Use the existing files and endpoint.

EXISTING FILES TO MODIFY/EXTEND:
- packages/mdk/cmd/truth-bridge/hero_gauges.go
- packages/mdk/cmd/truth-bridge/main.go
- apps/cockpit/src/components/HeroGauge.tsx
- apps/cockpit/src/components/HeroGaugesPanel.tsx
- apps/cockpit/src/services/waveApi.ts
- apps/cockpit/src/hooks/useWaveSnapshot.ts
- apps/cockpit/src/styles.css

BACKEND CONTRACT:
Endpoint: GET /api/cockpit/hero-gauges
Listen address: 127.0.0.1:8089 only.
CORS: local origins only. Do not use Access-Control-Allow-Origin: *.
Device proof: preserve existing requireDeviceProof() behavior.
Source of truth: existing buildTruthEnvelope().
Do not simulate fake live market data and label it live.
Do not add broker transport, OAuth, credentials, order routing, background sync, or private-row storage.
Return schema: wvrdr.alpha.hero_gauges.v1.
Return payload:
{
  schema: string,
  regime: { value: number, label: string },
  vectors: { value: number, label: string },
  threats: { value: number, label: string },
  portfolio: { value: number, label: string },
  timestamp: string,
  truthClass: string,
  executionEligible: boolean,
  source: string
}
Clamp values to 0–100.
executionEligible must mirror the Truth Bridge envelope.

FRONTEND CONTRACT:
HeroGauge.tsx is the single-card component.
HeroGaugesPanel.tsx is the four-card rack.
Fetch through the existing service layer. Do not put raw bridge URLs inside the visual component.
Render exactly four hero gauges: REGIME, VECTORS, THREATS, PORTFOLIO.
Handle loading with: CONNECTING TO TRUTH-SPINE...
Handle failure with an explicit degraded/read-only state.
Do not invent client-side truth.
Do not create prediction labels.
Do not create execution buttons.

VISUAL REQUIREMENTS:
2x2 grid on desktop/tablet.
Stable mobile stacking if width requires.
Liquid Glass / glassmorphism:
- ivory/bone-white background
- translucent glass panels
- backdrop blur
- subtle white border
- rounded-3xl / 24–32px corners
- soft shadow
- controlled glow
Gauge:
- SVG semi-circle arc
- faint track arc
- animated fill arc
- value arc color mapping:
  0–40: #00FFFF
  41–60: #FFD700
  61–80: #FFA500
  81–100: #FF69B4
Typography:
- title uppercase sans-serif bold
- value large bold monospaced
- label compact sans-serif
- no numeric jitter

DOCTRINE:
Cockpit shows truth.
MDK validates and guards truth.
Hero Gauges are read-only telemetry.
They do not execute, certify, or browse raw Sarlaac/MSP.
Stale truth must remain stale until verified fresh data arrives.

TESTS / CHECKS:
Run:
pnpm run typecheck
pnpm run build
pnpm run check:local-proof
If Go is available:
go test ./packages/mdk/...
go build ./packages/mdk/cmd/truth-bridge/...

DELIVERABLE:
Modify only the necessary existing files. Provide a concise summary of changed files and how the implementation preserves the security and read-only doctrine.
```

## Review checklist

Reject the generated output if it does any of the following:

- adds `Access-Control-Allow-Origin: *`
- creates `/cockpit` instead of using `/api/cockpit/hero-gauges`
- removes `requireDeviceProof()`
- binds the bridge to anything other than loopback
- creates fake live market data without DORMANT/READ_ONLY labeling
- adds execution buttons
- stores credentials or private data
- puts raw Sarlaac/MSP access in Cockpit
- uses Prop Group as a standalone page
- uses “Sim” instead of “Holo-Deck”
- uses “Field” instead of “FTySK”
