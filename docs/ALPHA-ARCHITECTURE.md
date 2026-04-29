# wVRdr Wave-II Alpha Architecture

## Purpose

This repo is a public scaffold for joining the Wave-I cockpit/PWA with the MDK-9000 truth spine.

Alpha is a local integration harness. It proves that MDK telemetry can reach the Wave-I surface without changing the meaning of truth states.

## Directory structure

```text
-wVRdr-Wave-II-Alpha/
├── packages/
│   ├── wave-i/
│   └── mdk/
│       └── cmd/truth-bridge/main.go
├── tools/split.sh
├── docs/
├── pnpm-workspace.yaml
└── go.work
```

## Truth bridge

Path:

```text
packages/mdk/cmd/truth-bridge/main.go
```

Loopback endpoint:

```text
127.0.0.1:8089
```

Routes:

```text
GET /health
GET /api/truth
```

The bridge calls the current MDK entry point:

```go
fetcher.ParallelRaceFetcher()
```

Current MDK contract:

- `ParallelRaceFetcher()` takes no arguments.
- It returns one `fetcher.Telemetry` map.
- `fetcher.Telemetry` is `map[string]interface{}`.

## Response envelope

```json
{
  "schema": "wvrdr.alpha.truth.v1",
  "fetchedAt": "<utc timestamp>",
  "source": "SCHWAB",
  "status": "DEGRADED",
  "truthClass": "UNRESOLVED",
  "executionEligible": false,
  "weaknesses": [],
  "data": {}
}
```

## Eligibility rule

`executionEligible` is true only if all conditions are true:

```text
source == SCHWAB
status == LIVE
truthClass == RAW_MARKET
weaknesses == 0
```

With the dormant Schwab socket, this should remain false.

## Wave-I client

Paths:

```text
packages/wave-i/src/lib/alpha-types.ts
packages/wave-i/src/lib/alpha-bridge.ts
```

Feature flag:

```text
VITE_ALPHA_BRIDGE_URL=http://127.0.0.1:8089
```

If unset, the client returns conservative STALE_RESCUE and Wave-I behavior remains unchanged.

## Phase 1 constraints

1. No fake LIVE.
2. No credentials in this phase.
3. MDK truth spine remains authoritative.
4. Wave-I App.tsx remains untouched in Phase 1.
5. The split-back path is preserved.
6. Security and audit gates are not bypassed.
7. Dormant Schwab socket remains DEGRADED / UNRESOLVED until real Wave-II transport is verified.
