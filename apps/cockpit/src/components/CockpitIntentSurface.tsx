import { useState } from 'react';
import { sendOperatorIntent, type HealthResponse } from '../services/waveApi';

type IntentTile = {
  id: string;
  title: string;
  operatorIntent: string;
  description: string;
  routeHint: string;
  longPressIntent?: string;
};

type CockpitIntentSurfaceProps = {
  currentPage?: string;
  bridgeStatus?: string;
  health?: HealthResponse | null;
};

const TILES: IntentTile[] = [
  {
    id: 'data_scrape',
    title: 'Data Scrape',
    operatorIntent: 'local_only_telemetry_pull_intent',
    description: 'Request a local telemetry pull. Logs intent only; no external action output.',
    routeHint: 'MDK / Data Hound',
  },
  {
    id: 'new_guess',
    title: 'New Guess',
    operatorIntent: 'open_holo_deck_guess_builder',
    description: 'Open Holo-Deck Guess Builder with current projected market state.',
    routeHint: 'Holo-Deck / Guess Builder',
  },
  {
    id: 'quarantine',
    title: 'Quarantine',
    operatorIntent: 'flag_current_surface_for_mdk_review',
    description: 'Flag current session/data surface for MDK quarantine review.',
    routeHint: 'MDK / Anomaly Lab',
  },
  {
    id: 'scythe_check',
    title: 'Scythe Check',
    operatorIntent: 'open_latest_scythe_harvest',
    description: 'Show last harvested lesson and Stupidity Reduced trail.',
    routeHint: 'MDK / Scythe',
  },
  {
    id: 'rulebook',
    title: 'Rulebook',
    operatorIntent: 'open_active_hard_limit_overlay',
    longPressIntent: 'open_holo_deck_rulebook_constraints',
    description: 'Tap for active hard limits. Long-press route is Rulebook & Constraints.',
    routeHint: 'Holo-Deck / Rulebook & Constraints',
  },
  {
    id: 'truth_audit',
    title: 'Truth Audit',
    operatorIntent: 'manual_run_seven_gate_marshall_audit_intent',
    description: 'Create a 7-Gate Marshall Audit intent. Does not bypass gates.',
    routeHint: 'MDK / Audit Gates',
  },
  {
    id: 'truth_recheck',
    title: 'Truth Recheck',
    operatorIntent: 'request_bridge_freshness_check',
    description: 'Re-ping bridge. STALE_RESCUE clears only after verified fresh data arrives.',
    routeHint: 'MDK / Truth Spine',
  },
];

function bridgeStatusFromHealth(health: HealthResponse | null | undefined, fallback?: string): string {
  return health?.status ?? health?.truth_spine ?? fallback ?? 'unknown';
}

export function CockpitIntentSurface({
  currentPage = 'Cockpit',
  bridgeStatus,
  health,
}: CockpitIntentSurfaceProps) {
  const [lastResult, setLastResult] = useState<string>('idle');
  const [busyTile, setBusyTile] = useState<string | null>(null);
  const resolvedBridgeStatus = bridgeStatusFromHealth(health, bridgeStatus);

  async function pressTile(tile: IntentTile, operatorIntent = tile.operatorIntent): Promise<void> {
    setBusyTile(tile.id);
    try {
      const result = await sendOperatorIntent({
        kind: 'cockpit_7_tile_intent',
        tile_pressed: tile.id,
        current_page: currentPage,
        operator_intent: operatorIntent,
        bridge_status: resolvedBridgeStatus,
        execution_allowed: false,
        result: 'intent_record_requested',
      });
      setLastResult(result.status ?? result.id ?? 'intent logged');
    } catch (err) {
      setLastResult(err instanceof Error ? err.message : 'intent log failed');
    } finally {
      setBusyTile(null);
    }
  }

  return (
    <section className="intent-surface-panel" aria-label="7-Tile Intent Surface">
      <div className="intent-surface-head">
        <div>
          <p className="eyebrow">Cockpit Overlay</p>
          <h2>7-Tile Intent Surface</h2>
        </div>
        <div className="intent-surface-meta">
          <span>execution_allowed=false</span>
          <small>last={lastResult}</small>
        </div>
      </div>

      <div className="intent-tile-grid">
        {TILES.map((tile) => (
          <button
            className="intent-tile"
            type="button"
            key={tile.id}
            onClick={() => void pressTile(tile)}
            onContextMenu={(event) => {
              if (!tile.longPressIntent) return;
              event.preventDefault();
              void pressTile(tile, tile.longPressIntent);
            }}
            aria-label={`${tile.title}: ${tile.description}`}
          >
            <span>{tile.title}</span>
            <strong>{busyTile === tile.id ? 'LOGGING' : tile.routeHint}</strong>
            <small>{tile.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
