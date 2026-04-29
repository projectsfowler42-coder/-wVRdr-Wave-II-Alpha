export type CockpitMode = 'DEMO' | 'READ_ONLY_LIVE' | 'OPERATOR_COMMAND' | 'DEGRADED' | 'LOCKED';

export type HealthResponse = {
  ok?: boolean;
  status?: string;
  mode?: CockpitMode | string;
  last_updated?: string;
  truth_spine?: string;
  message?: string;
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

export type SnapshotResult = {
  snapshot: WaveSnapshot | null;
  health: HealthResponse | null;
  degraded: boolean;
  stale: boolean;
  error: string | null;
  loadedAt: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const READ_TOKEN = import.meta.env.VITE_PUBLIC_READ_TOKEN as string | undefined;

function requireApiBase(): string {
  if (!API_BASE || API_BASE.trim().length === 0) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }
  return API_BASE.replace(/\/$/, '');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = requireApiBase();
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (READ_TOKEN) headers.set('Authorization', `Bearer ${READ_TOKEN}`);

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/api/health');
}

export async function getSnapshot(): Promise<WaveSnapshot> {
  return requestJson<WaveSnapshot>('/api/snapshot');
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
