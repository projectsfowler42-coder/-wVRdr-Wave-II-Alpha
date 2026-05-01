from __future__ import annotations

from pathlib import Path
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS probe_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    probe_kind TEXT NOT NULL,
    ok INTEGER NOT NULL,
    target_url TEXT NOT NULL,
    expected_json TEXT NOT NULL,
    actual_json TEXT NOT NULL,
    mismatches_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fault_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    severity TEXT NOT NULL,
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    occurrences INTEGER NOT NULL DEFAULT 1,
    latest_evidence_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS run_faults (
    run_id INTEGER NOT NULL,
    fault_id INTEGER NOT NULL,
    field_name TEXT NOT NULL,
    expected_value TEXT,
    actual_value TEXT,
    PRIMARY KEY (run_id, fault_id, field_name),
    FOREIGN KEY (run_id) REFERENCES probe_runs(id),
    FOREIGN KEY (fault_id) REFERENCES faults(id)
);
"""


def connect_db(db_path: str | Path) -> sqlite3.Connection:
    path = Path(db_path)
    if path.parent and str(path.parent) != ".":
        path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(db_path: str | Path) -> None:
    conn = connect_db(db_path)
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
