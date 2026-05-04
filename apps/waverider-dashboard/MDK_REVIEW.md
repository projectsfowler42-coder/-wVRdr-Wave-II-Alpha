# MDK Review — WaveRider Dashboard App

## MDK Verdict

**Verdict:** `WATCH / NOT_RELEASE_READY`

The dashboard is a valid visual prototype and is now in the correct Wave-II repo location, but it is not yet a release-ready app surface. It should be treated as a UI artifact under MDK inspection, not as a certified Cockpit/MDK production page.

Current artifact path:

```text
apps/waverider-dashboard/
```

Current implementation file:

```text
apps/waverider-dashboard/src/App.tsx
```

---

## 1. What This Code Currently Is

This is a single-file React/Vite visual prototype that proves:

- Wave-I color tokens can be embedded directly in the dashboard.
- A light liquid-glass visual system can be expressed with plain CSS and SVG.
- The top hero gauge layout can be built without a charting library.
- The app can exist as a standalone workspace package under Wave-II.

This is **not yet** a production-grade $250k-equivalent application surface.

---

## 2. MDK Line/Block Review

### Imports

```tsx
import React from "react";
import { ... } from "lucide-react";
```

**Verdict:** `PASS / WATCH`

- `lucide-react` is acceptable for the current prototype.
- Icon imports are explicit and tree-shakeable.
- `React` is used for `React.ReactNode`, so it is not dead code.

**Optimization:** Move shared UI icons behind a `ui/icons.ts` export later so app surfaces do not directly sprawl icon dependencies.

---

### `WR` Color Token Object

**Verdict:** `PASS / NEEDS_PROMOTION`

The exact Wave-I color wheel values are embedded and usable.

**Problem:** Tokens are local to `App.tsx`, so other Wave-II surfaces cannot safely reuse them.

**$250k app target:**

```text
packages/design-system/src/tokens/waveIColors.ts
```

Export typed semantic tokens:

```ts
export const waveIColors = { ... } as const;
export type WaveIColor = keyof typeof waveIColors;
```

Then layer semantic state tokens:

```ts
export const semanticStateColors = {
  live: waveIColors.aquaGreen,
  degraded: waveIColors.gold,
  stale: waveIColors.fantaOrange,
  failed: waveIColors.emberRed,
  breach: waveIColors.khorneRed,
  quarantine: waveIColors.purple,
} as const;
```

**Free path:** Extract `WR` to:

```text
apps/waverider-dashboard/src/tokens.ts
```

No package required yet.

---

### `HeroSpec` Type

**Verdict:** `WATCH`

This is a useful local view model, but it mixes display labels, values, and colors without provenance.

**Problem:** In production, every number needs truth state and data origin.

Current:

```ts
mainValue: number;
secondaryValue: number;
```

Target:

```ts
type TruthClass = "LIVE" | "DEGRADED" | "STALE" | "FAILED";

type DashboardMetric = {
  value: number;
  label: string;
  truthClass: TruthClass;
  sourceId: string;
  capturedAt: string;
  confidence: number;
};
```

**$250k app target:** Every visible metric carries:

- `truthClass`
- `sourceId`
- `capturedAt`
- `confidence`
- `lineageHash`
- `staleAfterMs`

**Free path:** Add only `truthClass`, `sourceId`, and `capturedAt` now.

---

### `heroes`, `miniMetrics`, `deltaRows`, `gateSteps`

**Verdict:** `WATCH`

They are currently hardcoded mock data.

**Problem:** Good for visual proof; bad for app truth. The UI can accidentally look live while showing static values.

**MDK rule:** Mock data must never visually imply `LIVE`.

**Required patch:** Add a visible data mode banner:

```text
DATA MODE: MOCK / VISUAL PROTOTYPE
```

or attach truth states to each metric.

**$250k app target:** Replace static arrays with a data provider layer:

```text
src/data/dashboardSnapshot.ts
src/contracts/dashboardSnapshot.contract.ts
src/adapters/mockDashboardAdapter.ts
src/adapters/truthBridgeDashboardAdapter.ts
```

**Free path:** Keep mock arrays, but rename them clearly:

```ts
mockHeroMetrics
mockMiniMetrics
```

and show `MOCK` in the UI.

---

### `polar` and `arcPath`

**Verdict:** `PASS`

The SVG arc helpers are small, deterministic, and dependency-free.

**Optimization:** Add tests for path output and edge cases.

Risk cases:

- `value < 0`
- `value > 100`
- `NaN`
- empty/invalid dimensions

**Free path:** Add a clamp helper:

```ts
function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
```

Use it before calculating arc endpoints.

---

### `GlassCard`

**Verdict:** `PASS / WATCH`

The CSS variable approach is acceptable.

**Problem:** The card is visual-only and has no semantic role or accessibility label.

**$250k app target:** Shared card component with:

- title
- status
- truth class
- evidence link
- loading state
- error state
- keyboard affordances when clickable

**Free path:** Add optional `ariaLabel` and `data-truth-class` props.

---

### `HeroGauge`

**Verdict:** `WATCH`

This is the most important visual component and the current implementation is close enough for prototype. It uses SVG arcs, per-card gradients, and separate readouts.

**Problems:**

1. No value clamping.
2. No `aria-label`.
3. No accessible text summary.
4. Arc geometry is magic-number heavy.
5. No visual tick labels or scale context.
6. Inner and outer readouts are tied to one rigid layout.

**$250k app target:** Promote into:

```text
packages/design-system/src/components/HeroGauge/HeroGauge.tsx
```

with props:

```ts
type HeroGaugeProps = {
  title: string;
  primary: DashboardMetric;
  secondary: DashboardMetric;
  palette: GaugePalette;
  mode: "hero" | "compact";
  showTicks?: boolean;
};
```

**Free path:** Keep it in the app but split into:

```text
src/components/HeroGauge.tsx
src/lib/svgArc.ts
```

---

### `HeroCard`

**Verdict:** `WATCH`

The card correctly composes title + actionability + hero gauge.

**Problem:** The label `ACTIONABILITY` implies operational readiness, but the data is mock.

**Required MDK guard:** Add truth state beside `ACTIONABILITY`:

```text
MOCK / ACTIONABILITY
```

until live data exists.

---

### `MiniMetric`

**Verdict:** `WATCH`

Works visually. Needs source/truth metadata before it can be used as real telemetry.

**Optimization:** Convert icons from arbitrary component references into a small enum:

```ts
type MetricIcon = "activity" | "trend" | "alert" | "btc" | "fracture" | "gauge";
```

This makes mock payloads serializable later.

---

### `DeltaEngine`, `DecisionGates`, `ITB`, `PropLab`

**Verdict:** `WATCH / MOCK_ONLY`

These are visual shells, not engines.

**Problem:** Names imply operational logic but the code contains static visuals.

**MDK rule:** These modules must be labeled as visual shells until connected to engine outputs.

**$250k app target:** Each panel becomes a container wired to contract-validated state:

```text
DeltaEnginePanel      receives DeltaEngineSnapshot
DecisionGatesPanel    receives GateState[]
ITBPanel              receives ScatterProbeSnapshot
PropLabPanel          receives PropSimulationSummary
```

**Free path:** Keep the visual panels, but rename internal data:

```ts
mockDeltaRows
mockGateSteps
mockItbPoints
mockPropSummary
```

and add `MOCK` badge once.

---

### Inline `StyleBlock`

**Verdict:** `BLOCK_FOR_PRODUCTION`

The inline CSS is acceptable for a canvas/prototype, but not for a maintainable app surface.

**Problems:**

- Hard to diff.
- Hard to lint.
- Hard to reuse.
- No design-token governance.
- CSS and component logic are fused.
- Long string can hide syntax errors.

**$250k app target:** Split into:

```text
src/styles/base.css
src/styles/liquidGlass.css
src/styles/dashboard.css
src/styles/gauges.css
src/styles/responsive.css
```

or design-system CSS modules.

**Free path:** Move `StyleBlock` content to:

```text
apps/waverider-dashboard/src/styles.css
```

and import it from `main.tsx`.

---

### `backdrop-filter`, `filter`, shadows

**Verdict:** `WATCH`

The look is right directionally, but mobile performance risk is real.

**Risk:** Samsung S22 Ultra may handle it, but stacked blur + filters + SVG drop shadows can stutter.

**Free optimization:** Add a low-effects mode using CSS custom property:

```css
@media (max-width: 720px) {
  .glass-card { backdrop-filter: blur(10px); }
  .hero-outer, .hero-inner { filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

**$250k app target:** Runtime performance probe using Playwright + device target profile.

---

## 3. Current Missing $250k-App Features

A $250k professional build does not just buy prettier UI. It buys governance, maintainability, traceability, testability, and deployment confidence.

Missing layers:

1. **Design system** — reusable tokens, cards, gauges, pills, panels.
2. **Data contracts** — typed schemas for each dashboard snapshot.
3. **Truth classes** — LIVE / DEGRADED / STALE / FAILED on every visible metric.
4. **Mock/live boundary** — UI must clearly say when it is mock.
5. **Data adapter layer** — mock adapter now, truth-bridge adapter later.
6. **Tests** — arc math, rendering smoke, data validation, accessibility smoke.
7. **Performance budget** — mobile blur/fps target.
8. **PWA shell** — manifest, service worker, offline/fallback behavior.
9. **Release gates** — typecheck, build, smoke, screenshot diff.
10. **MDK fault integration** — panel errors write fault records or display fault IDs.

---

## 4. Free Path to $250k-Equivalent Direction

### Phase A — No-cost hardening, immediate

Cost: `$0`

Do these first:

- Move inline CSS out of `App.tsx`.
- Split components into files.
- Rename mock data as mock data.
- Add visible `MOCK / VISUAL PROTOTYPE` truth state.
- Add clamp helper for gauge values.
- Add ARIA labels to gauges and cards.
- Add mobile low-effects CSS.
- Add typecheck/build commands to root documentation.

### Phase B — No-cost professional structure

Cost: `$0`

Create:

```text
apps/waverider-dashboard/src/
├── App.tsx
├── data/mockDashboardSnapshot.ts
├── contracts/dashboardSnapshot.ts
├── tokens/waveIColors.ts
├── lib/svgArc.ts
├── components/
│   ├── HeroGauge.tsx
│   ├── HeroCard.tsx
│   ├── GlassCard.tsx
│   ├── MiniMetric.tsx
│   ├── DeltaEnginePanel.tsx
│   ├── DecisionGatesPanel.tsx
│   ├── ITBPanel.tsx
│   └── PropLabPanel.tsx
└── styles/
    ├── base.css
    ├── liquidGlass.css
    ├── dashboard.css
    └── responsive.css
```

### Phase C — No-cost quality gates

Cost: `$0`

Use existing workspace tooling:

```bash
pnpm --filter @workspace/waverider-dashboard typecheck
pnpm --filter @workspace/waverider-dashboard build
```

Add later:

```bash
pnpm --filter @workspace/waverider-dashboard test
```

with simple smoke tests first.

### Phase D — No-cost MDK parity discipline

Cost: `$0`

Add a static MDK readiness file:

```text
apps/waverider-dashboard/MDK_STATUS.json
```

Example:

```json
{
  "surface": "waverider-dashboard",
  "releaseState": "VISUAL_PROTOTYPE",
  "truthClass": "MOCK",
  "executionEligible": false,
  "privateData": false,
  "brokerConnected": false
}
```

### Phase E — Free live-data bridge later

Cost: `$0`

Use local-first adapters:

1. Start with static mock adapter.
2. Add local JSON file adapter.
3. Add IndexedDB adapter.
4. Add truth-bridge HTTP adapter.
5. Add stale fallback.

No paid services required.

---

## 5. Final MDK Recommendation

Do not buy anything yet.

The next best move is not paying builders. It is converting the current one-file prototype into a modular, contract-aware, mock-safe app surface.

**Immediate MDK directive:**

```text
BLOCK production release.
ALLOW visual prototype iteration.
REQUIRE mock/live label before any demo.
REQUIRE component split before adding real data.
REQUIRE gauge clamp + accessibility pass before mobile testing.
```

**Free route:**

```text
1. Refactor structure.
2. Add truth metadata.
3. Add mock/live boundary.
4. Add build/typecheck gate.
5. Add screenshot diff later.
6. Only then wire data.
```
