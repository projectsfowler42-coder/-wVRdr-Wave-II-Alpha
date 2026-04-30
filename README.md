# ~wVRdr~ Wave-II~Alpha

GitHub slug: `-wVRdr-Wave-II-Alpha`

~wVRdr~ Wave-II~Alpha is the public Alpha scaffold for marrying the Wave-I cockpit/PWA with MDK-9000's truth spine.

The `~Alpha` suffix is the diminutive: a small, controlled scaffold for proving market-truth plumbing before Wave-II live transport.

## Current posture

- local-only truth bridge
- MDK quarantine / Truth Spine preservation
- WAL/audit posture preserved
- dormant Schwab socket only
- no credentials
- no OAuth
- no live Schwab transport
- no live orders
- no fake LIVE
- broker execution locked
- `executionEligible` remains false in dormant mode
- split-back path preserved

## Phase 3 local run proof

Install packages:

```bash
pnpm install --no-frozen-lockfile
```

Terminal 1 — start local truth bridge:

```bash
pnpm dev:bridge
```

Expected bridge:

```text
http://127.0.0.1:8089
mode: READ_ONLY_DORMANT
```

Terminal 2 — run local proof checks:

```bash
pnpm check:local-proof
```

Terminal 3 — start cockpit:

```bash
pnpm dev:cockpit
```

The cockpit reads:

```text
VITE_API_BASE_URL=http://127.0.0.1:8089
```

and displays the local dormant truth snapshot from:

```text
GET /api/snapshot
```

## Direct endpoint checks

```bash
curl http://127.0.0.1:8089/health
curl http://127.0.0.1:8089/api/health
curl http://127.0.0.1:8089/api/truth
curl http://127.0.0.1:8089/api/snapshot
curl -X POST -H 'Content-Type: application/json' -d '{"kind":"manual_probe"}' http://127.0.0.1:8089/api/operator/intent
```

Expected Phase 3 posture:

```text
/health returns ok
/api/health returns READ_ONLY_DORMANT
/api/truth returns schema wvrdr.alpha.truth.v1
/api/snapshot returns schema wvrdr.alpha.cockpit.snapshot.v1
Dormant Schwab remains DEGRADED / UNRESOLVED or FAILED
executionEligible remains false
networkEnabled remains false
credentialsUsed remains false
operator intent returns recorded_no_execution
```

## Non-negotiables

Do not add any of the following in Alpha Phase 3:

- credentials
- OAuth
- live Schwab transport
- live orders
- fake LIVE
- broker execution
- repo rename
- visibility change

## Doctrine

Market truth → regime state → opportunity classification → wallet permission → position sizing → execution/non-execution → audit trail → learning loop.
