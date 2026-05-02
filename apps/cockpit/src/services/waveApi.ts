export type CockpitMode = 'DEMO' | 'READ_ONLY_LIVE' | 'OPERATOR_COMMAND' | 'DEGRADED' | 'LOCKED';

export type HealthResponse = {
  ok?: boolean;
  status?: string;
  mode?: CockpitMode | string;
  last_updated?: string;
  truth_spine?: string;
  message?: string;
  deviceProof?: {
    mode?: string;
    configured?: boolean;
    requiredWhenSet?: boolean;
    timestampSkewSecs?: number;
  };
};

export type WaveSnapshot = {
  system?: {
    name?: string;
    mode?: CockpitMode | string;
    health?: string;
    last_updated?: string;
    truth_spine?: string;
    stale?: boolean;
    warnings?: string[];
  };
  regime?: {
    label?: string;
    score?: number;
    confidence?: number;
    drivers?: string[];
    stale?: boolean;
    verified?: boolean;
  };
  buckets?: Record<string, unknown>;
  portfolio?: {
    positions?: Array<Record<string, unknown>>;
    warnings?: string[];
  };
  actions?: {
    urgent?: Array<Record<string, unknown>>;
    active?: Array<Record<string, unknown>>;
    completed?: Array<Record<string, unknown>>;
    blocked?: Array<Record<string, unknown>>;
  };
  audit?: {
    status?: string;
    recent?: Array<Record<string, unknown>>;
  };
  quarantine?: {
    count?: number;
    items?: Array<Record<string, unknown>>;
  };
};

export type HeroGaugeValue = {
  value: number;
  label: string;
};

export type HeroGaugeState = {
  schema?: string;
  regime: HeroGaugeValue;
  vectors: HeroGaugeValue;
  threats: HeroGaugeValue;
  portfolio: HeroGaugeValue;
  timestamp?: string;
  truthClass?: string;
  executionEligible?: boolean;
  source?: string;
};

export type SnapshotResult = {
  snapshot: WaveSnapshot | null;
  heroGauges: HeroGaugeState | null;
  health: HealthResponse | null;
  degraded: boolean;
  stale: boolean;
  error: string | null;
  loadedAt: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const READ_TOKEN = import.meta.env.VITE_PUBLIC_READ_TOKEN as string | undefined;
const DEVICE_ID = import.meta.env.VITE_WVRDR_DEVICE_ID as string | undefined;
const DEVICE_PROOF = import.meta.env.VITE_WVRDR_DEVICE_PROOF as string | undefined;
const REQUEST_TIMEOUT_MS = 3500;

function requireApiBase(): string {
  if (!API_BASE || API_BASE.trim().length === 0) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }
  return API_BASE.replace(/\/$/, '');
}

function abortErrorMessage(path: string): string {
  return `${path} stale-rescue timeout after ${REQUEST_TIMEOUT_MS}ms`;
}

function attachDeviceProofHeaders(headers: Headers): void {
  if (!DEVICE_ID || !DEVICE_PROOF) return;
  headers.set('X-wVRdr-Device-Id', DEVICE_ID);
  headers.set('X-wVRdr-Fingerprint', DEVICE_PROOF);
  headers.set('X-wVRdr-Nonce', crypto.randomUUID());
  headers.set('X-wVRdr-Timestamp', new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = requireApiBase();
  const headers = new Headers(init?.headers);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  headers.set('Accept', 'application/json');
  if (READ_TOKEN) headers.set('Authorization', `Bearer ${READ_TOKEN}`);
  attachDeviceProofHeaders(headers);

  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(abortErrorMessage(path));
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function getHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/api/health');
}

export async function getSnapshot(): Promise<WaveSnapshot> {
  return requestJson<WaveSnapshot>('/api/snapshot');
}

export async function getHeroGauges(): Promise<HeroGaugeState> {
  return requestJson<HeroGaugeState>('/api/cockpit/hero-gauges');
}

export async function sendOperatorIntent(intent: Record<string, unknown>): Promise<{ ok?: boolean; id?: string; status?: string }> {
  return requestJson('/api/operator/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...intent,
      source: 'apps/cockpit',
      created_at: new Date().toISOString()
    })
  });
}

export function isSnapshotStale(snapshot: WaveSnapshot | null, maxAgeMs = 5 * 60 * 1000): boolean {
  const lastUpdated = snapshot?.system?.last_updated;
  if (!lastUpdated) return true;
  const parsed = Date.parse(lastUpdated);
  if (Number.isNaN(parsed)) return true;
  return Date.now() - parsed > maxAgeMs || snapshot?.system?.stale === true || snapshot?.regime?.stale === true;
}
