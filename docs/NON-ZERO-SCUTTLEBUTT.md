# Non-Zero Scuttlebutt Layer

This document defines the ~wVRdr~ Wave-II~Alpha narrative-intelligence intake layer for GeoPol and Zeitgeist.

## Purpose

The Non-Zero Scuttlebutt layer collects weak, informal, contradictory, and post-event narrative material that may later explain market movement patterns.

It is not a trade signal.
It is not an execution trigger.
It is not authoritative truth.
It is a structured event-memory and challenge layer.

## Source doctrine

Two historical/intelligence ideas shape this layer:

1. Navy Scuttlebutt
   - Informal talk, rumor, operator chatter, field impressions, unofficial situational awareness.
   - Useful because early pattern fragments often appear before formal narrative consensus.
   - Dangerous because it can be wrong, emotional, circular, or planted.

2. Devil's Advocate / Ifcha Mistabra style review
   - Every dominant interpretation gets challenged.
   - The question is not only "is this true?" but also "what if the opposite is true?"
   - This prevents single-story lock-in and reduces groupthink.

## Non-Zero event definition

A Non-Zero event is any narrative item that has some plausible market relevance but is not yet clean enough to become a trusted signal.

Examples:

- sudden geopolitical rumor
- shipping disruption chatter
- defense escalation narrative
- central-bank whisper cycle
- policy leak claim
- unusual community consensus shift
- repeated disagreement between official narrative and market behavior
- post-event explanation that may become a future pattern marker

## Required classification

Every Non-Zero item must be recorded with:

```text
id
observedAt
sourceType
sourceLabel
region
topic
summary
claimedDirection
confidence
contradictions
marketWindow
relatedTickers
truthClass
status
reviewNotes
```

## Truth classes

```text
SCUTTLEBUTT_UNVERIFIED
NARRATIVE_CONFIRMED
NARRATIVE_CONTRADICTED
POST_EVENT_EXPLANATION
PATTERN_CANDIDATE
QUARANTINED
```

Default truth class:

```text
SCUTTLEBUTT_UNVERIFIED
```

## Status values

```text
COLLECTED
UNDER_REVIEW
CHALLENGED
DISPROVEN
ARCHIVED
PROMOTED_TO_PATTERN_CANDIDATE
```

Default status:

```text
COLLECTED
```

## Challenge questions

Each item must be challenged with:

```text
What if this is wrong?
What if the opposite is true?
Who benefits if this story spreads?
Is this leading market behavior or explaining it after the fact?
What market instruments should have reacted if this mattered?
Did they react?
Did they react before, during, or after the story became visible?
Is this causal, coincident, or decorative narrative?
```

## Market use

Allowed use:

```text
GeoPol context
Zeitgeist context
post-event pattern review
volatility explanation
future pattern library
operator awareness
```

Forbidden use:

```text
automatic execution
position sizing
broker routing
LIVE truth promotion
wallet permission
```

## Doctrine

The layer exists because chaos often has narrative fingerprints.

Most items will be late, wrong, noisy, or incomplete.
Some items may become pattern markers after enough repeats.

The goal is not prophecy.
The goal is memory, challenge, comparison, and better recognition of repeated chaos structures.
