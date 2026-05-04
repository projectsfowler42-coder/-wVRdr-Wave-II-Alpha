# WaveRider Dashboard MDK Release Checklist

## Current release state

```text
BLOCKED
VISUAL_PROTOTYPE
MOCK
```

## Required before release eligibility

- [ ] `pnpm --filter @workspace/waverider-dashboard typecheck` passes.
- [ ] `pnpm --filter @workspace/waverider-dashboard build` passes.
- [ ] `pnpm --filter @workspace/waverider-dashboard mdk:static` passes.
- [ ] Screenshot review passes against the approved hero-gauge reference.
- [ ] The visible mock/live boundary remains present until real data is certified.
- [ ] No UI label claims LIVE, CONNECTED, ACTIVE, broker access, private-data access, or execution authority while in prototype state.
- [ ] Adapter boundary remains enforced before snapshot render.
- [ ] Snapshot guard remains enforced before render.
- [ ] Mobile fallback disables heavy SVG filters.
- [ ] Reduced-motion safeguard remains present.
- [ ] Real-data adapter contract is defined before any Truth Bridge fetch is enabled.
- [ ] MDK status is updated only after gate evidence exists.

## Explicit non-release conditions

Any of the following blocks release:

- `truthClass: LIVE` appears in mock snapshot data.
- `executionEligible: true` appears anywhere in this app.
- `brokerConnected: true` appears anywhere in this app.
- `privateData: true` appears anywhere in this app.
- UI text claims `DATA FEED: LIVE` during prototype state.
- UI text claims `API HEALTH: CONNECTED` during prototype state.
- UI text claims `MODEL STATUS: ACTIVE` during prototype state.
- Truth Bridge scaffold performs a network fetch before certification.
