# Visible Bridge Security State

Wave-II Alpha now exposes bridge/security posture directly in the cockpit UI.

## Purpose

The operator should not need to inspect GitHub Actions, logs, or hidden repo machinery to know whether the cockpit is running in a trusted state.

The visible state panel surfaces:

- device proof mode
- whether proof is configured
- bridge mode
- truth class
- freshness
- execution state
- API state
- source

## Expected operator states

| State | Meaning |
| --- | --- |
| `MONITOR_ONLY` | HMAC secret is not configured; local bridge accepts loopback requests for Alpha development. |
| `HMAC_REQUIRED` | HMAC secret is configured; protected endpoints require signed trusted-device headers. |
| `STALE_RESCUE` / `STALE` | Data should not be treated as current. |
| `DEGRADED` | API, bridge, snapshot, or truth path is not fully verified. |
| `READ_ONLY_DORMANT` | Bridge is alive but execution remains locked. |
| `EXECUTION_LOCKED` | No broker orders or direct execution are permitted. |

## Boundary

This is a visibility patch only.

It does not add:

- broker transport
- Schwab OAuth
- credential storage
- order routing
- raw private-row storage
- fake LIVE promotion

The cockpit remains a read-only telemetry and operator-review surface.