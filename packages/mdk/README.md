# packages/mdk

Mirror slot for `projectsfowler42-coder/MDK-9000_wVRdr`.

This package owns the broker/source/truth/audit spine:

- fetcher
- dormant Schwab socket
- quarantine
- Go-Marshall audit gate
- WAL/audit behavior

Phase 1 rule: copy MDK here without weakening quarantine, security audit, or no-fake-LIVE doctrine.

Expected source repo:

```text
https://github.com/projectsfowler42-coder/MDK-9000_wVRdr
```
