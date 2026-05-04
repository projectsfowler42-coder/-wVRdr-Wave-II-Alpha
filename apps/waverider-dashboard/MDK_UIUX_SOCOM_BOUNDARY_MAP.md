# MDK UI/UX SOCom Boundary Map

Project: `~wVRdr~`

Surface: `apps/waverider-dashboard`

Status: `VISUAL_PROTOTYPE / MOCK / WATCH_NOT_RELEASE_READY`

Created from the 2026-05-05 repo-read pass across the accessible `~wVRdr~` repositories.

---

## 0. Executive lock

The `MDK UI/UX SOCom` is the surface-integration authority.

It does not own every MDK subsystem. It maps them, reads their output, displays their truth, and prevents the UI from implying capability that the owning subsystem has not produced.

```text
Dial 811 before digging.
```

Before any frontend surface, component, button, badge, metric, panel, prompt box, gauge, or cockpit view is changed, identify the MDK owner beneath it.

The UI may display owner truth.

The UI may not fabricate, mutate, promote, execute, or bypass owner truth.

---

## 1. Source of authority for this map

This map is grounded in the accessible repo read, not memory alone.

### Repos read

```text
projectsfowler42-coder/-wVRdr-Wave-II-Alpha
projectsfowler42-coder/MDK-9000_wVRdr
projectsfowler42-coder/wave-rider-intelligence
projectsfowler42-coder/wVRdr_Wave-I_Build
projectsfowler42-coder/wVRdr-anomaly-lab
```

### Freshness rules

```text
1. Prefer merged main over closed/unmerged branch.
2. Prefer newer timestamp only inside the same ownership lane.
3. Prefer executable source/config over stale README prose.
4. Prefer MDK doctrine for gates and boundaries.
5. Prefer Intelligence repo for W3/MSP/Sarlaac/Prop/Algorilla ownership.
6. Prefer Wave-II Alpha for current UI shell/surface behavior.
7. Prefer Wave-I only for Wave-I cockpit/manual bridge legacy behavior.
8. Treat unmerged branches as quarantine/archaeology until explicitly revived.
```

---

## 2. Repo ownership map

### `MDK-9000_wVRdr`

Owns:

```text
governance
audit gates
Sentinel
suppression visibility
UIUX Squad doctrine/API
Prop Target Gap model
Batch Harvester protocol
source/app-intel intake rules
```

Important files:

```text
app/uiux_squad.py
app/routers/uiux.py
app/sentinel_policy.py
app/product_target.py
docs/mdk-batch-harvester-protocol.md
```

Current lock:

```text
250k is not doctrine.
Account size is caller-selected.
Prop Target Gap Model is generic.
```

UI/UX SOCom implication:

```text
Use MDK for gates, UIUX doctrine, audit posture, Sentinel findings, and boundary rules.
Do not use MDK UI routes as execution authority.
```

---

### `wave-rider-intelligence`

Owns:

```text
W3 / Wiff-Win
MSP / Mouseion Sarlaac Pit
Scythe
Sarlaac
Prop Group
Algorilla
display-safe projection/card-pack contracts
```

Important files:

```text
README.md
docs/cockpit-card-pack.md
```

Important branch archaeology:

```text
static-cockpit-export-41
```

Current main lock:

```text
Cockpit Card Pack is canonical display-safe projection shape.
Cards are display-safe.
Actions are labels and modes, not execution commands.
The cockpit renders what MDK permits.
It does not reach around MDK to read source systems directly.
```

UI/UX SOCom implication:

```text
UI consumes display-safe projection/card output.
UI does not browse raw MSP/Sarlaac.
UI does not certify Algorilla.
UI does not judge W3 Win/Loss.
```

---

### `-wVRdr-Wave-II-Alpha`

Owns:

```text
current app shell
Cockpit UI
MDK page
FTySK page
Holo-Deck page
Settings page
apps/waverider-dashboard visual prototype
dashboard/package gates
UI surfaces only
```

Important files:

```text
apps/cockpit/src/App.tsx
apps/cockpit/src/components/MdkRoutingHubPage.tsx
apps/cockpit/src/components/HoloDeckPage.tsx
apps/cockpit/src/components/SettingsPage.tsx
apps/waverider-dashboard/package.json
apps/waverider-dashboard/MDK_VISUAL_CONTRACT.md
apps/waverider-dashboard/MDK_RELEASE_CHECKLIST.md
apps/waverider-dashboard/src/contracts/dashboardSnapshot.ts
apps/waverider-dashboard/src/contracts/snapshotGuard.ts
apps/waverider-dashboard/src/contracts/adapterReadiness.ts
apps/waverider-dashboard/src/adapters/dashboardSnapshotAdapter.ts
```

Current cockpit lock:

```text
Five top-level pages:
- Cockpit
- MDK
- FTySK
- Holo-Deck
- Settings
```

Current dashboard lock:

```text
VISUAL_PROTOTYPE
MOCK
WATCH_NOT_RELEASE_READY
adapter-gated
snapshot-gated
source-gated
docs-gated
visual-contract-gated
visual-source-gated
```

UI/UX SOCom implication:

```text
This repo owns the current visible app surfaces.
It may show truth state and route operator intent.
It may not invent broker, private-data, execution, edge, Algorilla, or source-complete claims.
```

---

### `wVRdr_Wave-I_Build`

Owns:

```text
older Wave-I cockpit/operator runtime
manual bridge
local quote truth states
Wave-I active runtime scope
explicit Data Refresh vs Harvest separation
```

Important files:

```text
artifacts/wave-i/src/data/sources/buckets.wave-i.json
artifacts/wave-i/src/lib/market.ts
```

Current operational lock:

```text
|M| MINT ETF wallet = activeWaveIScope true
|W| WHITE = activeWaveIScope false / quarantined
[B] BLUE = activeWaveIScope true
[G] GREEN = activeWaveIScope true
```

Quote truth-state lock:

```text
direct fresh quote = LIVE / RAW_MARKET
quarantined proxy = DEGRADED / UNRESOLVED
local cache = STALE / UNRESOLVED
missing/unusable = FAILED / FAILED
```

UI/UX SOCom implication:

```text
Use Wave-I only for Wave-I legacy/manual-bridge behavior.
Do not let stale README prose override executable source/config.
Do not import Wave-I active-scope claims into Wave-II without explicit ownership review.
```

---

### `wVRdr-anomaly-lab`

Owns:

```text
sanitized fake-data community review lab
generic funded-account rule classifier
public review packet/testing harness
```

Important files:

```text
community-review/lab/classifyRun.ts
community-review/lab/RUN_TESTS.md
```

Current lock:

```text
fake data only
self-contained
no private organism
no broker/API data
no proprietary strategy logic
```

UI/UX SOCom implication:

```text
Anomaly Lab can provide review-safe test logic and generic funded-account classification patterns.
It cannot be treated as production strategy, broker logic, or private application truth.
```

---

## 3. MDK basement map for UI/UX SOCom

| Basement | Owns | UI may display | UI must not do |
|---|---|---|---|
| Build Truth | build fingerprint, deployment identity | build status, mismatch warning | fake certified/release-ready state |
| Fault Memory | recurring/open/resolved faults | fault count, recurrence, blocking state | delete/resolve/suppress faults |
| Sentinel | source scan, fake-live/scope/credential findings | findings, blocked claims | waive findings silently |
| Browser Hounds | runtime route, console, failed request, screenshot evidence | probe state, screenshot gate | claim parity without probe |
| Truth Spigot | projection/adapter/lease readiness | readiness, lease, degraded/certified state | fetch live truth directly or bypass leases |
| Padded Room | quarantine/replay/isolation | replay result, quarantine state | make replay look live |
| Mouseion/Crawlers | source discovery, manifests, raw acquisition | source coverage/missing/source confidence | edit raw originals or claim complete data |
| W3/Scythe/Sarlaac/Algorilla | Win/Loss judgment, failure digestion, promotion | outcome state, miss type, promotion state | judge/promote/certify edges |
| Holo-Deck | scenario packets, sealed tests, replay outputs | packet state, sim-only results | execute or present sim as trade instruction |
| Broker/Execution | broker transport, credentials, order routing, private data | broker/execution disabled/enabled state if provided | store credentials, route orders, imply execution |
| UI/UX SOCom | visual truth mapping and surface contracts | all allowed owner states | become owner of owner truth |

---

## 4. Dashboard-specific authority

Surface:

```text
apps/waverider-dashboard
```

Current authority:

```text
DISPLAY_ONLY
VISUAL_PROTOTYPE
MOCK
WATCH_NOT_RELEASE_READY
```

Allowed UI claims:

```text
mock visual prototype
adapter guarded
snapshot guarded
source guarded
docs guarded
visual guarded
execution disabled
private data absent
broker absent
confidence 0 unless mock contract changes
```

Forbidden UI claims:

```text
LIVE
real-time
broker connected
private account connected
execution eligible
trade enabled
order staged
Algorilla certified
edge confirmed
source complete
projection certified
```

Required visible boundary:

```text
MOCK / VISUAL PROTOTYPE
no broker link
no private data
no trading authority
```

---

## 5. Button authority matrix

A button is a claim.

Allowed now:

```text
Inspect
Details
View Source
Show Fault
Refresh Mock
Review Snapshot
Open Evidence
Acknowledge State
Request Backend Review
```

Allowed only as disabled/blocked placeholders:

```text
Buy
Sell
Execute
Send Order
Connect Broker
Authorize Account
Promote Algorilla
Certify Edge
```

Forbidden active labels in this surface:

```text
Trade Now
Auto Trade
Live Signal
Model Active
Pass Probability
Guaranteed
Certain
API Connected
Broker Ready
```

---

## 6. Visual truth lexicon

| State | Meaning | Required UI treatment |
|---|---|---|
| MOCK | intentional prototype/fake/static data | always visible; cannot resemble live |
| LOCAL_ONLY | local file/cache/adapter only | show local-only; no external freshness claim |
| RAW_SOURCE | captured but not normalized | show raw/unprocessed |
| NORMALIZED_SOURCE | schema-shaped but not necessarily validated | show source/confidence/freshness |
| SIMULATED | replay/backtest/paper output | show SIM/PAPER/REPLAY |
| DEGRADED | fallback/partial/unresolved | show warning; not actionable |
| STALE | older than permitted freshness | show timestamp/freshness warning |
| FAILED | fetch/parse/probe/source failure | show failure, not blank success |
| QUARANTINED | captured but not promoted | visible quarantine badge |
| WATCH | interesting but not validated | watch-only; no action claim |
| EDGE_CANDIDATE | candidate only | needs gate evidence |
| EDGE_CONFIRMED | promotion gate passed | show evidence scope, not certainty |
| CERTIFIED | MDK gates passed for a scope | show certified scope only |
| LIVE | certified live data | only if owner subsystem returns live truth |

---

## 7. Freshest logic ledger

### Freshest merged/main truth

| Rank | Timestamp | Repo | Logic |
|---:|---|---|---|
| 1 | 2026-05-05 00:27:40 +10 | `-wVRdr-Wave-II-Alpha` | Dashboard MDK visual source guard wired into static gate |
| 2 | 2026-05-05 00:26:52 +10 | `wave-rider-intelligence` | Cockpit Card Pack merged: display-safe cards/actions |
| 3 | 2026-05-05 00:25:27 +10 | `MDK-9000_wVRdr` | Prop Target Gap made account-size generic |
| 4 | 2026-05-04 11:10:25Z | `wVRdr-anomaly-lab` | Community-review lab test harness merged |
| 5 | 2026-04-27 17:03:22Z | `wVRdr_Wave-I_Build` | Minimal backend merged; doctrine freshness from PR26/27/22 |

### Unmerged/closed archaeology

| Repo | Branch/PR | Status | Value | Treatment |
|---|---|---|---|---|
| `MDK-9000_wVRdr` | PR #41 `mdk-prop-target-gap-api-pr35-2026-05-05` | closed unmerged | API endpoint for generic Prop Target Gap | revive only if requested |
| `wave-rider-intelligence` | PR #41 `static-cockpit-export-41` | closed unmerged | static cockpit JSON export bridge | high-value candidate, not canonical |
| `wVRdr_Wave-I_Build` | PR #24 Pre-Wave-I Manual D3 bridge runtime | closed unmerged | manual D3 bridge archaeology | not main |
| `wVRdr-anomaly-lab` | PR #5 anomaly intel truth artifacts | closed unmerged | truth-envelope artifact idea | quarantine/archaeology |

---

## 8. Acceptance checklist for future dashboard patches

Every future patch to this dashboard must answer:

```text
1. What subsystem owns the truth under this UI element?
2. Is the UI reading, displaying, or mutating that truth?
3. Is the truth class visible?
4. Is freshness/capturedAt visible when relevant?
5. Is confidence earned or explicitly absent/zero?
6. Could a user mistake this for live/broker/execution capable?
7. Does this patch preserve no fake LIVE, no fake confidence, and no hidden broker behavior?
8. Does this patch preserve the visual contract?
9. Does the MDK static gate still run?
10. Is this merged-main logic or unmerged archaeology?
```

If any answer is unclear, the patch is `BLOCKED`.

---

## 9. Final lock

```text
UI/UX SOCom is anchored to actual repo files, not just doctrine prose.

It marries frontend surfaces to the right backend/infrastructure owner.
It displays owner truth faithfully.
It prevents cross-basement trespass.
It blocks beautiful lies.
It keeps every app surface readable, honest, and release-gated.
```

No dashboard or cockpit surface may imply:

```text
LIVE
broker connected
private data connected
execution eligible
Algorilla certified
edge confirmed
source complete
current/live quote truth
```

unless the owning subsystem produces that truth and the UI/UX SOCom surface contract allows that implication.
