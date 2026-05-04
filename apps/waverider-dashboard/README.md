# WaveRider Dashboard

## MDK status

```text
VISUAL_PROTOTYPE
MOCK
WATCH_NOT_RELEASE_READY
```

This app is a guarded visual prototype for the WaveRider dashboard surface. It is not live-data certified, not broker connected, not private-data connected, and not execution eligible.

## Current gate stack

```bash
pnpm --filter @workspace/waverider-dashboard mdk:static
pnpm --filter @workspace/waverider-dashboard mdk:gate
```

`mdk:static` runs these no-browser guards:

```text
mdk:status
mdk:source
mdk:snapshot
mdk:docs
mdk:uiux
mdk:visual
```

`mdk:uiux` enforces `MDK_UIUX_SOCOM_BOUNDARY_MAP.md` as a first-class dashboard boundary contract. It checks the 811 utility-map rule, repo ownership references, MDK basement map, posture locks, freshness rules, forbidden implication locks, and button authority labels.

`mdk:gate` runs typecheck, build, then the static MDK guards.

## Data path

```text
DashboardSnapshotAdapter
→ adapter boundary guard
→ snapshot contract guard
→ React dashboard render
```

Current adapter:

```text
mock-dashboard-snapshot-adapter
```

Scaffolded future adapters:

```text
local-dashboard-snapshot-adapter
truth-bridge-dashboard-snapshot-adapter
```

All adapters must keep these capabilities false unless MDK certification explicitly changes them:

```text
canUsePrivateData: false
canUseBrokerConnection: false
canUseExecutionAuthority: false
```

## UI/UX SOCom boundary

The dashboard is governed by:

```text
MDK_UIUX_SOCOM_BOUNDARY_MAP.md
```

Current dashboard authority:

```text
DISPLAY_ONLY
VISUAL_PROTOTYPE
MOCK
WATCH_NOT_RELEASE_READY
```

The UI may display owner truth. It may not fabricate, mutate, promote, execute, or bypass owner truth.

## Release rule

This dashboard must remain blocked from release until all items in `MDK_RELEASE_CHECKLIST.md` are satisfied.
