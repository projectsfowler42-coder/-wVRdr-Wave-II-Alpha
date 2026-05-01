# Phase 4 — R³ Sentinel Gate

Wave-II~Alpha is the active build target.

Wave-I and MDK-9000 are treated as completed source systems, done enough to move into Wave-II~Alpha integration. This phase does not re-copy or redesign either source system.

## Purpose

Phase 4 establishes the gate before R³ hardening:

```text
Security Sentinel first
R³ hardening second
```

The goal is to avoid hardening bad assumptions, unreviewed narrative material, fake telemetry, or unproven source claims into the Alpha organism.

## R³ definition

```text
Robust    = fails closed, validates shape, refuses weak truth
Resilient = survives degraded/stale/failure state without inventing LIVE truth
Redundant = preserves local audit/provenance paths before any future external persistence
```

## Current system posture

```text
No credentials
No OAuth
No live Schwab transport
No live orders
No fake LIVE
No broker execution
Dormant Schwab remains DEGRADED / UNRESOLVED
executionEligible remains false
```

## Gate 0 — Security Sentinel

Before adding any R³ hardening, Alpha must prove:

```text
Go checks pass
Wave-I package checks pass
Cockpit checks pass
Local bridge proof passes
No fake LIVE labels are introduced
No operator-intent path executes anything
No Non-Zero / Scuttlebutt item can promote itself into executable truth
```

## Gate 1 — Non-Zero quarantine discipline

Non-Zero Scuttlebutt and Devil's Advocate review may enter Alpha only as:

```text
collection
review
challenge
post-event pattern memory
operator context
```

Forbidden:

```text
execution trigger
position sizing input
wallet permission input
broker route input
LIVE truth promotion
```

## Gate 2 — Five Things You Should Know discipline

FTySK may be implemented only from currently proven Alpha state.

Allowed first signals:

```text
Truth Bridge status
Dormant Schwab socket state
networkEnabled flag
credentialsUsed flag
executionEligible gate
quarantine count
```

Forbidden first signals:

```text
fake Net Liquidity
fake Credit Spreads
fake BKLN/JAAA ratio
fake Zeitgeist score
fake Schwab sync
invented LIVE data
```

## Stop condition

Phase 4 is not complete until CI proves the sentinel gate and the R³ hardening does not weaken the dormant posture.
