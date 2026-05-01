from __future__ import annotations

import hashlib
import json

from app.build_info import BuildInfo


def compute_build_fingerprint(build_info: BuildInfo) -> str:
    canonical = json.dumps(build_info.model_dump(), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]


def build_payload(build_info: BuildInfo) -> dict[str, str]:
    payload = build_info.model_dump()
    payload["fingerprint"] = compute_build_fingerprint(build_info)
    return payload
