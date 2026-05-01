from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.memory.db import connect_db, init_db


def list_recent_probe_runs(db_path: str | Path, limit: int = 20) -> list[dict[str, Any]]:
    init_db(db_path)
    conn = connect_db(db_path)
    try:
        rows = conn.execute(
            "SELECT id, created_at, probe_kind, ok, target_url, expected_json, actual_json, mismatches_json FROM probe_runs ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [
            {
                "id": int(row["id"]),
                "created_at": row["created_at"],
                "probe_kind": row["probe_kind"],
                "ok": bool(row["ok"]),
                "target_url": row["target_url"],
                "expected": json.loads(row["expected_json"]),
                "actual": json.loads(row["actual_json"]),
                "mismatches": json.loads(row["mismatches_json"]),
            }
            for row in rows
        ]
    finally:
        conn.close()


def list_open_faults(db_path: str | Path, limit: int = 50) -> list[dict[str, Any]]:
    init_db(db_path)
    conn = connect_db(db_path)
    try:
        rows = conn.execute(
            "SELECT id, fault_key, title, status, severity, first_seen, last_seen, occurrences, latest_evidence_json FROM faults WHERE status = 'open' ORDER BY last_seen DESC, id DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [
            {
                "id": int(row["id"]),
                "fault_key": row["fault_key"],
                "title": row["title"],
                "status": row["status"],
                "severity": row["severity"],
                "first_seen": row["first_seen"],
                "last_seen": row["last_seen"],
                "occurrences": int(row["occurrences"]),
                "latest_evidence": json.loads(row["latest_evidence_json"]),
            }
            for row in rows
        ]
    finally:
        conn.close()
