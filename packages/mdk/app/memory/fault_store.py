from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

from app.deploy.probe import BuildProbeResult
from app.memory.db import connect_db, init_db

PREFIX = "build_truth:"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _json(value: Any) -> str:
    return json.dumps(value, sort_keys=True)


def _fault_key(field_name: str, expected_value: Any, actual_value: Any) -> str:
    return f"{PREFIX}{field_name}:{expected_value!s}:{actual_value!s}"


def _resolve_old_rows(conn, active_keys: set[str]) -> None:
    rows = conn.execute(
        "SELECT id, fault_key FROM faults WHERE status = 'open' AND fault_key LIKE ?",
        (f"{PREFIX}%",),
    ).fetchall()
    for row in rows:
        if str(row["fault_key"]) in active_keys:
            continue
        conn.execute("UPDATE faults SET status = ? WHERE id = ?", ("resolved", int(row["id"])))


def record_build_probe(db_path: str | Path, result: BuildProbeResult) -> dict[str, Any]:
    init_db(db_path)
    conn = connect_db(db_path)
    now = _utc_now()
    try:
        cursor = conn.execute(
            "INSERT INTO probe_runs (created_at, probe_kind, ok, target_url, expected_json, actual_json, mismatches_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (now, "build_truth", 1 if result.ok else 0, result.url, _json(result.expected), _json(result.actual), _json(result.mismatches)),
        )
        run_id = int(cursor.lastrowid)
        active_keys: set[str] = set()
        ids: list[int] = []

        for field_name, mismatch in result.mismatches.items():
            expected_value = mismatch.get("expected")
            actual_value = mismatch.get("actual")
            key = _fault_key(field_name, expected_value, actual_value)
            active_keys.add(key)
            evidence = {
                "field": field_name,
                "expected": expected_value,
                "actual": actual_value,
                "target_url": result.url,
                "run_id": run_id,
            }
            existing = conn.execute("SELECT id, occurrences FROM faults WHERE fault_key = ?", (key,)).fetchone()
            if existing is None:
                cursor = conn.execute(
                    "INSERT INTO faults (fault_key, title, status, severity, first_seen, last_seen, occurrences, latest_evidence_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (key, f"Build mismatch on {field_name}", "open", "high", now, now, 1, _json(evidence)),
                )
                fault_id = int(cursor.lastrowid)
            else:
                fault_id = int(existing["id"])
                conn.execute(
                    "UPDATE faults SET last_seen = ?, occurrences = ?, latest_evidence_json = ?, status = ? WHERE id = ?",
                    (now, int(existing["occurrences"]) + 1, _json(evidence), "open", fault_id),
                )
            conn.execute(
                "INSERT OR REPLACE INTO run_faults (run_id, fault_id, field_name, expected_value, actual_value) VALUES (?, ?, ?, ?, ?)",
                (run_id, fault_id, field_name, str(expected_value), str(actual_value)),
            )
            ids.append(fault_id)

        _resolve_old_rows(conn, active_keys)
        conn.commit()
        return {"run_id": run_id, "fault_ids": ids, "fault_count": len(ids)}
    finally:
        conn.close()
