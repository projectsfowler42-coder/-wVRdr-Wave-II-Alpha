# MDK Proper Run — Wave-II Alpha — 2026-05-04

## Purpose

This is the first proper MDK run after the Alpha MDK Sentinel invocation was merged.

It forces the current Wave-II Alpha `main` tree through the real Alpha MDK R3 gate from a fresh branch.

## Required gate

```text
node scripts/mdk-security-sentinel.mjs .
```

## Scope

```text
Full -wVRdr-Wave-II-Alpha repository
Cockpit surface
MDK surface
FTySK surface
Holo-Deck surface
Settings sovereignty/audit surface
Alpha routing
Alpha docs
Alpha local-proof and R3 support files
```

## Pass meaning

```text
PASS means no current BLOCK/BREACH under enforced gates.
PASS does not mean perfect.
WATCH remains work.
```

## Merge rule

```text
Do not merge unless the MDK R3 Alpha Gate passes.
```
