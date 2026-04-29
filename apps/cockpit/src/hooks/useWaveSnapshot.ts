import { useCallback, useEffect, useMemo, useState } from 'react';
import { getHealth, getSnapshot, isSnapshotStale, type HealthResponse, type WaveSnapshot } from '../services/waveApi';

export type UseWaveSnapshotState = {
  snapshot: WaveSnapshot | null;
  health: HealthResponse | null;
  loading: boolean;
  degraded: boolean;
  stale: boolean;
  error: string | null;
  loadedAt: string | null;
  refresh: () => Promise<void>;
};

export function useWaveSnapshot(pollMs = 60000): UseWaveSnapshotState {
  const [snapshot, setSnapshot] = useState<WaveSnapshot | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthResult, snapshotResult] = await Promise.all([getHealth(), getSnapshot()]);
      setHealth(healthResult);
      setSnapshot(snapshotResult);
      setLoadedAt(new Date().toISOString());
    } catch (err) {
      setHealth(null);
      setSnapshot(null);
      setLoadedAt(null);
      setError(err instanceof Error ? err.message : 'Wave-I API unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, refresh]);

  const stale = useMemo(() => isSnapshotStale(snapshot), [snapshot]);
  const degraded = Boolean(error) || !snapshot || !health || stale;

  return {
    snapshot,
    health,
    loading,
    degraded,
    stale,
    error,
    loadedAt,
    refresh
  };
}
