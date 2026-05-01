from __future__ import annotations

from app.fire.shards import build_fire_shards
from app.models import FireOutput, MarketSnapshot


def run_fire(snapshot: MarketSnapshot) -> FireOutput:
    return build_fire_shards(snapshot)
