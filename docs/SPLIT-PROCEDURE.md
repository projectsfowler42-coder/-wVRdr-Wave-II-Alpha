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

## Before pushing split output

MDK checks:

```bash
cd split-output/MDK-9000_wVRdr
go test ./...
go vet ./...
go build ./tools/wvdr-cli/...
```

Wave-I checks:

```bash
cd split-output/wVRdr_Wave-I_Build/artifacts/wave-i
pnpm install
pnpm typecheck
pnpm test
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

Phase 1 is not complete until all of these pass after packages are populated:

```text
go test ./packages/mdk/...
go vet ./packages/mdk/...
go build ./packages/mdk/tools/wvdr-cli/...
go build -o bin/truth-bridge ./packages/mdk/cmd/truth-bridge
pnpm --filter @workspace/wave-i typecheck
pnpm --filter @workspace/wave-i test
pnpm --filter @workspace/wave-i build
bash tools/split.sh
```
