# R3 Truth-Bridge Device Proof

Wave-II Alpha keeps the MDK truth bridge loopback-only and read-only. This document defines the optional trusted-device HMAC gate added for the local bridge.

## Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| `MONITOR_ONLY` | `WVRDR_DEVICE_HMAC_SECRET` is not set | Bridge accepts local requests and reports that device proof is not configured. |
| `HMAC_REQUIRED` | `WVRDR_DEVICE_HMAC_SECRET` is set | Bridge rejects protected requests unless signed device-proof headers are present. |

## Protected endpoints

When `HMAC_REQUIRED`, the bridge protects:

- `/api/truth`
- `/api/snapshot`
- `/api/cockpit/hero-gauges`
- `/api/telemetry/five-things`
- `/api/operator/intent`

Health remains readable so the UI can display whether the bridge is in monitor-only or HMAC-required mode.

## Headers

A trusted local client must send:

```text
X-wVRdr-Device-Id: <trusted-device-id>
X-wVRdr-Nonce: <random nonce, at least 16 characters>
X-wVRdr-Timestamp: <RFC3339 UTC timestamp>
X-wVRdr-Fingerprint: <hex HMAC-SHA256 signature>
```

## Canonical message

The HMAC signs this exact newline-delimited message:

```text
METHOD
PATH
TIMESTAMP
NONCE
DEVICE_ID
```

Example for `GET /api/snapshot`:

```text
GET
/api/snapshot
2026-05-02T15:00:00Z
nonce-1234567890abcd
samsung-s22-ultra-local
```

The signature is:

```text
hex(hmac_sha256(WVRDR_DEVICE_HMAC_SECRET, canonical_message))
```

## Freshness window

The timestamp must be within +/- 120 seconds of bridge time.

## Boundary

This gate proves a trusted local client, not permission to trade.

It does not enable:

- Schwab OAuth
- credential storage
- broker transport
- order routing
- raw broker-row export
- fake LIVE promotion

Those remain separately locked.