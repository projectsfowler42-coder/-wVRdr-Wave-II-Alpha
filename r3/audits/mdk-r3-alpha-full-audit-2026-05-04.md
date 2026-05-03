# MDK R3 Full Repo Audit — Wave-II Alpha — 2026-05-04

## Purpose

Summon MDK Sentinel to R3 the closed Wave-II~Alpha UI shell.

This PR exists to force a real pull_request gate against the closed Alpha main state.

## Required gate

```text
node scripts/mdk-security-sentinel.mjs .
```

## Scope

```text
Cockpit surface
MDK surface
FTySK surface
Holo-Deck surface
Settings sovereignty/audit surface
Alpha routing
Alpha docs
Alpha local-proof and R3 support files
```

## Doctrine lock

```text
Alpha is closed.
MDK inspects Alpha without reopening Alpha scope.
This PR should not be merged unless the MDK R3 Alpha Gate passes.
```
