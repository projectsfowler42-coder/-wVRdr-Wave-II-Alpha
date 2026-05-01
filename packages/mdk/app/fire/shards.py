from __future__ import annotations

from app.models import FireOutput, MarketSnapshot


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, round(value, 4)))


def build_fire_shards(snapshot: MarketSnapshot) -> FireOutput:
    bearish = 0.0
    bullish = 0.0

    if snapshot.price_change_pct < 0:
        bearish += min(abs(snapshot.price_change_pct) / 2.0, 0.45)
    else:
        bullish += min(snapshot.price_change_pct / 2.0, 0.45)

    if snapshot.vix_change_pct > 0:
        bearish += min(snapshot.vix_change_pct / 20.0, 0.3)
    else:
        bullish += min(abs(snapshot.vix_change_pct) / 20.0, 0.2)

    if snapshot.breadth < 0.45:
        bearish += (0.45 - snapshot.breadth)
    else:
        bullish += min(snapshot.breadth - 0.45, 0.25)

    fragility = _clamp((bearish * 0.6) + (snapshot.liquidity_stress * 0.4))
    novelty = _clamp((abs(snapshot.price_change_pct) / 3.0) + (abs(snapshot.rate_change_bps) / 40.0))
    contradiction_signal = abs(bullish - bearish) < 0.15 and novelty > 0.2
    contradiction = 1.0 if contradiction_signal else 0.0

    return FireOutput(
        bullish=_clamp(bullish),
        bearish=_clamp(bearish),
        novelty=novelty,
        fragility=fragility,
        contradiction=contradiction,
    )
