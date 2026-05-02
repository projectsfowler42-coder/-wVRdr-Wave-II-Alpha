# R³ Preview Shell

## Purpose

Base44 is no longer treated as the authoritative UI layer. This preview shell gives R³ its own repo-owned front-end control surface for viewer design, source-status inspection, and safe-mode UX.

## Scope

This is a static, read-only preview shell.

It can:

- display R³ status
- parse repo-safe manifest JSON
- reject unsafe/local vault manifests in the browser
- poll a repo-safe JSON endpoint or static file
- show audit events
- provide a design-control surface for R³ UI/UX work
- install as a standalone mobile web app shell when served over an eligible origin

It cannot:

- read raw broker rows
- store account data
- call Schwab
- transmit orders
- promote fake/degraded data to LIVE
- bypass MDK Security Sentinel

## Run locally

From repo root after checkout:

```bash
python3 -m http.server 4173 -d r3-preview
```

Then open:

```text
http://localhost:4173
```

## Installable preview mode

The preview shell includes:

- `manifest.webmanifest`
- mobile theme metadata
- standalone display mode
- ivory background and theme color
- SVG app icon using the wVRdr wave mark

A service worker is intentionally not required yet. The preview shell must remain read-only and repo-safe before offline caching is added.

## Intended data path

```text
trusted local device
→ local vault manifest
→ repo-safe projection
→ R³ preview shell
```

The preview shell should only ingest manifests with:

```json
{
  "deviceScope": "REPO_SAFE_PROJECTION",
  "exportPolicy": {
    "rawRowsMayLeaveDevice": false,
    "containsLocalPaths": false,
    "containsRawFileProbes": false
  }
}
```

## Design doctrine

- light, warm, tactical UI
- no vertical chaos as the system matures
- visible status badges
- hard separation between private/local and repo/app-safe material
- SAFE_MODE always visible
- break-glass state must be scoped, time-boxed, and auditable
- every visible data state must disclose whether it is loaded, degraded, blocked, or simulated
