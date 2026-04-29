# wVRdr Wave-II Alpha Split Procedure

Use this procedure to reconstruct the origin repo shapes from a populated Alpha monorepo.

## Automated split

From the Alpha repo root:

```bash
bash tools/split.sh
```

Outputs:

```text
split-output/
├── MDK-9000_wVRdr/
└── wVRdr_Wave-I_Build/
    └── artifacts/wave-i/
```

The script is non-destructive. It writes only to `split-output/`.

## Phase 1 integrity checks

Run from the Alpha repo root:

```bash
go test ./...
go vet ./...
go build ./packages/mdk/cmd/truth-bridge
pnpm install
pnpm --filter @workspace/wave-i typecheck
pnpm --filter @workspace/wave-i build
```

## Runtime truth-bridge proof

Run the bridge locally:

```bash
go run ./packages/mdk/cmd/truth-bridge
```

Then verify:

```bash
curl http://127.0.0.1:8089/health
curl http://127.0.0.1:8089/api/truth
```

Expected Phase 1 posture:

```text
/health returns ok
/api/truth returns schema wvrdr.alpha.truth.v1
Dormant Schwab remains DEGRADED / UNRESOLVED or FAILED
executionEligible remains false
No credentials
No OAuth
No live orders
No fake LIVE
```

## Before pushing split output

MDK checks:

```bash
cd split-output/MDK-9000_wVRdr
go test ./...
go vet ./...
go build ./cmd/truth-bridge
```

Wave-I checks:

```bash
cd split-output/wVRdr_Wave-I_Build/artifacts/wave-i
pnpm install
pnpm typecheck
pnpm build
```

## Files that belong only in Alpha

Do not push these back into the origin repos unless explicitly promoting Alpha structure:

```text
go.work
pnpm-workspace.yaml
tools/split.sh
docs/ALPHA-ARCHITECTURE.md
docs/SPLIT-PROCEDURE.md
packages/mdk/cmd/truth-bridge/main.go
packages/wave-i/src/lib/alpha-types.ts
packages/wave-i/src/lib/alpha-bridge.ts
```

## Stop condition for Phase 1

Phase 1 is not complete until the Phase 1 integrity checks pass and the runtime truth-bridge proof confirms conservative dormant posture.
