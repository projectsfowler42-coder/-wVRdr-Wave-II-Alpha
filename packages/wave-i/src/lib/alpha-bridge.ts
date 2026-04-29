/**
 * Thin client for the ~wVRdr~ Wave-II~Alpha Truth Bridge.
 *
 * Feature-flagged via VITE_ALPHA_BRIDGE_URL. If unset, Wave-I behavior remains
 * unchanged and this client returns conservative STALE_RESCUE envelopes.
 *
 * Phase 1 invariants:
 * - never claims LIVE from fallback
 * - conservative truth mapping: doubt degrades, never promotes
 * - 3500ms AbortController timeout
 * - never throws to UI callers
 */

import { TruthClass } from "@/contracts/truth.contract";
import type { TelemetricTileData } from "@/components/hud/TelemetricTile";
import type { AlphaStatus, AlphaTruthClass, AlphaTruthEnvelope } from "./alpha-types";
import { isAlphaTruthEnvelope } from "./alpha-types";

export type { AlphaTruthEnvelope } from "./alpha-types";

const ALPHA_BRIDGE_URL = (import.meta.env["VITE_ALPHA_BRIDGE_URL"] as string | undefined) ?? "";
const FETCH_TIMEOUT_MS = 3500;
const ALPHA_ENABLED = ALPHA_BRIDGE_URL.trim().length > 0;

export function mapAlphaToWaveITruthClass(
  truthClass: AlphaTruthClass,
  status: AlphaStatus,
  source: string,
  executionEligible: boolean,
): TruthClass {
  if (executionEligible && source === "SCHWAB" && status === "LIVE" && truthClass === "RAW_MARKET") {
    return TruthClass.LIVE;
  }

  switch (truthClass) {
    case "DEGRADED":
    case "UNRESOLVED":
      return TruthClass.DEGRADED;
    case "STALE":
    case "STALE_RESCUE":
      return TruthClass.STALE;
    case "FAILED":
    case "QUARANTINED":
      return TruthClass.FAILED;
    default:
      return TruthClass.DEGRADED;
  }
}

function staleRescueFallback(reason: string): AlphaTruthEnvelope {
  return {
    schema: "wvrdr.alpha.truth.v1",
    fetchedAt: new Date().toISOString(),
    source: "STALE_RESCUE",
    status: "STALE",
    truthClass: "STALE_RESCUE",
    executionEligible: false,
    weaknesses: [{ reason: "ALPHA_BRIDGE_UNAVAILABLE", detail: reason }],
    data: {},
  };
}

export async function fetchAlphaTruth(): Promise<AlphaTruthEnvelope> {
  if (!ALPHA_ENABLED) {
    return staleRescueFallback("VITE_ALPHA_BRIDGE_URL not configured");
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${ALPHA_BRIDGE_URL}/api/truth`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return staleRescueFallback(`HTTP_${response.status}`);
    }

    const raw: unknown = await response.json();
    if (!isAlphaTruthEnvelope(raw)) {
      return staleRescueFallback("SCHEMA_MISMATCH");
    }

    return raw;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return staleRescueFallback("FETCH_TIMEOUT");
    }
    return staleRescueFallback("FETCH_ERROR");
  } finally {
    window.clearTimeout(timer);
  }
}

export function alphaTruthToTileData(
  envelope: AlphaTruthEnvelope,
  ticker: string,
  previous?: TelemetricTileData,
): TelemetricTileData {
  const mappedTruthClass = mapAlphaToWaveITruthClass(
    envelope.truthClass,
    envelope.status,
    envelope.source,
    envelope.executionEligible,
  );

  const tickerData = envelope.data[ticker] as Record<string, unknown> | undefined;
  const rawPrice =
    (tickerData?.["lastPrice"] as number | undefined) ??
    (tickerData?.["price"] as number | undefined) ??
    (envelope.data["price"] as number | undefined);

  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : previous?.value ?? 0;
  const previousValue = previous?.value ?? 0;
  const movement = price - previousValue;
  const movementPercent = previousValue === 0 ? "0.00%" : `${((movement / previousValue) * 100).toFixed(2)}%`;

  const fetchedAtMs = new Date(envelope.fetchedAt).getTime();
  const timestamp = Number.isFinite(fetchedAtMs) ? fetchedAtMs : Date.now();

  return {
    value: price,
    sourceId: `ALPHA_${envelope.source}_${ticker}`,
    timestamp,
    truthClass: mappedTruthClass,
    movementPercent,
    isPositive: movement >= 0,
    staleRescue: envelope.truthClass === "STALE_RESCUE" || envelope.status === "STALE",
  };
}

export const isAlphaBridgeEnabled = (): boolean => ALPHA_ENABLED;
