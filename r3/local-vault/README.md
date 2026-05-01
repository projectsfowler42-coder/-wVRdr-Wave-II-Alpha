# R³ Local Vault

## Purpose

Keep broker-confirmed trades, holdings, PDFs, account exports, and user-specific financial rows on the trusted device instead of inside the public app repository.

The app/repo may receive only:

- schemas
- redacted examples
- source manifests
- checksums / fingerprints
- aggregate or derived non-sensitive state
- explicit user-approved exports

## Security rule

Raw user financial data must live under local-only ignored paths, such as:

```text
r3/local-vault/data/
r3/local-vault/private/
.local/
private/
```

These paths are blocked by `.gitignore`.

## MDK Security Sentinel role

MDK Security Sentinel inspects candidate files before commit/import and classifies them as:

- `PASS` — safe source/code/config
- `WATCH` — review needed
- `BLOCK` — likely private/sensitive; do not commit
- `BREACH` — confirmed account/broker/secret material; quarantine locally

## Safe pattern

1. Raw broker data stays local.
2. Local vault normalizes it into SQLite/DuckDB/private Parquet.
3. R³ consumes local records through typed contracts.
4. Repo receives only redacted manifests or source status.
5. Any promotion to app-visible state must pass MDK and R³ gates.

## Uploaded control-room ZIP review

The uploaded `wvrdr_control_room_2026-05-02.zip` contains a `trades_confirmed_seed.csv` with broker-confirmed trades/holdings. That file is not suitable for direct commit into the public repo.

Allowed to commit:

- schema shape
- scanner
- local-vault design
- redacted templates

Not allowed to commit:

- raw broker confirmation rows
- exact quantities/prices/net amounts from private account records
- source PDF names if they expose private broker confirmations
