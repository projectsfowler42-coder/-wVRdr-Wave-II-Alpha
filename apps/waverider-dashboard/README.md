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

`mdk:static` runs source, snapshot, status, and documentation guards that do not require a browser.

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

## Release rule

This dashboard must remain blocked from release until all items in `MDK_RELEASE_CHECKLIST.md` are satisfied.
