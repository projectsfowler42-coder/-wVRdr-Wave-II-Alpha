# W³ Padded Room — Alpha R³ Integration

This compartment mirrors the Intelligence Repo W³ Padded Room doctrine inside Wave-II~Alpha without connecting it to production runtime paths.

Source: `projectsfowler42-coder/wave-rider-intelligence/padded-room/README.md`

## Purpose

The **[Padded Room]** is a walled-off development and simulation space for W³/MSP/Scythe/Algorilla work.

It may receive telemetry snapshots, market-state snapshots, rulebooks, historical data, simulated results, and audit records.

It may run simulations, replay decisions, mutate scenarios, test patches, and stress W³ logic.

It may not perform external actions, write to production state, bypass quarantine, or promote a play without replayable evidence.

```text
Telemetry in.
Simulated decisions only.
No external action out.
All results hashed.
All patches replayed.
All failures quarantined.
Only proven logic promoted.
```

## R³ Doctrine

```text
R¹ = Robust
R² = Resilient
R³ = Redundant
```

### R¹ — Robust

The system must survive bad inputs, bad guesses, bad scenarios, bad patches, stale telemetry, malformed rulebooks, and hostile states without silently lying.

Required behavior:

```text
- reject or quarantine corrupted inputs
- preserve source provenance
- keep W³ judgment binary: [Win] / [Loss]
- never relabel AcceptableLoss as Win
- never default into expansion states
- treat AllowedSmall as the normal ceiling of good prop behavior
```

### R² — Resilient

The system must degrade safely when something fails. Failure should reduce permission, increase quarantine pressure, and preserve auditability.

Required behavior:

```text
- uncertainty moves toward Mixed / Hostile / Forbidden
- missing provenance blocks promotion
- unexplained output drift blocks release
- rule-breach frequency triggers quarantine
- bad patches remain reversible
- failure remains useful MSP data
```

### R³ — Redundant

The system must avoid single hidden points of failure.

Required behavior:

```text
- duplicate critical safety checks at engine and DB boundaries
- store telemetry snapshots separately from production state
- preserve rulebook hashes, data hashes, config hashes, and code version hashes
- keep rollback paths for patches and migrations
- maintain separate padded, replay, quarantine, candidate, and production modes
```

## Validation Properties

The named R³ doctrine is Robust / Resilient / Redundant.

The validation properties are:

```text
Replayable
Reproducible
Reversible
```

Nothing is release-grade unless it is:

```text
Robust / Resilient / Redundant
and
Replayable / Reproducible / Reversible
```

## Room Modes

```text
padded_room  = walled-off development clone
replay       = exact snapshot replay
quarantine   = failed, contaminated, or suspicious logic/data
candidate    = passed padded tests but not released
production   = live app consumption only after release gate
```

## Environment Guardrails

Recommended environment variables:

```env
WVRDR_ENV=padded_room
WVRDR_EXTERNAL_ACTIONS_ENABLED=false
WVRDR_DB=msp_padded.sqlite
WVRDR_ALLOW_PROD_WRITE=false
WVRDR_REQUIRE_REPLAY_HASH=true
```

Required behavior:

```text
If WVRDR_ENV == padded_room:
  disable all external action outputs
  force padded DB
  block production writes
  convert action outputs into WouldAct records
```

## Data Law

Do not test against the production MSP database directly.

Recommended DB separation:

```text
msp_prod.sqlite        = production/state of record
msp_padded.sqlite      = development clone
msp_replay.sqlite      = deterministic replay runs
msp_quarantine.sqlite  = contaminated or suspicious results
```

Every simulation run should store:

```text
data_snapshot_id
market_data_hash
news_snapshot_hash
rulebook_hash
code_version_hash
sim_config_hash
timestamp
room_mode
```

No hash, no promotion.

## Release Gate

Nothing leaves the [Padded Room] unless it passes:

```text
1. Unit tests
2. DB migration test
3. Replay test
4. Stress sim test
5. Fuzzy drift test
6. Quarantine test
7. No-external-action safety test
8. Human review
```

Promotion path:

```text
Padded Room → Candidate → Release Gate → Wave-II~Alpha
```

Forbidden path:

```text
Padded Room → Production
```

## W³ / MSP / Scythe / Algorilla Roles

```text
W³ judges.
MSP stores.
Scythe harvests.
Algorilla hardens.
```

W³ remains binary:

```text
[Win] / [Loss]
```

`AcceptableLoss` is still `[Loss]`. It is survivable and expected, but it is not a win.

## Alpha integration law

This Alpha mirror is not permission to wire W³ into production runtime behavior.

```text
W³/MSP can be mirrored into Alpha.
W³/MSP can be displayed by Alpha.
W³/MSP can feed simulated decisions.
W³/MSP cannot bypass dormant posture.
W³/MSP cannot override safety gates.
```

## Safe-Room Law

```text
Nothing gets let loose until it has survived the padded room.
```

## Minimum Viable Padded Room

Build order:

```text
1. Separate padded DB
2. Read-only telemetry import
3. Simulation run table with snapshot hashes
4. Replay command
5. Quarantine command
6. Promotion gate
7. No-external-action environment guard
```

Suggested CLI surface:

```bash
msp room status
msp room import-telemetry --file snapshot.json
msp room replay --guess <guess_id>
msp room stress --guess <guess_id> --cycles 1000
msp room quarantine --result <result_id>
msp room promote --guess <guess_id>
```

## Doctrine Lock

```text
The [Padded Room] exists to make W³/MSP/Scythe/Algorilla Robust, Resilient, and Redundant.

Replayable, Reproducible, and Reversible are required validation properties.

Nothing leaves the [Padded Room] unless it is R³ and passes replay, stress, quarantine, and no-external-action checks.
```
