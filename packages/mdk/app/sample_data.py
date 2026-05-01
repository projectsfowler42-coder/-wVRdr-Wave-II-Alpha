from __future__ import annotations

from datetime import datetime, timezone

from app.models import MarketSnapshot


def get_sample_snapshot(symbol: str = "SPY") -> MarketSnapshot:
    return MarketSnapshot(
        timestamp=datetime.now(timezone.utc),
        symbol=symbol,
        price_change_pct=-0.84,
        vix_change_pct=6.25,
        breadth=0.38,
        liquidity_stress=0.67,
        rate_change_bps=-4.0,
    )


def get_sample_history() -> list[float]:
    return [
        -0.12,
        0.18,
        0.34,
        -0.41,
        -0.26,
        0.09,
        -0.55,
        -0.22,
        0.14,
        -0.84,
    ]
