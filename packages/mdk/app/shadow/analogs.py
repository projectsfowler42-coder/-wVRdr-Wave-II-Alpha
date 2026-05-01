from __future__ import annotations

from math import sqrt

from app.models import AnalogCandidate

ANALOG_LIBRARY: dict[str, dict[str, float]] = {
    "trend_expansion": {
        "mean_return": 0.22,
        "volatility": 0.14,
        "drawdown": 0.09,
        "latest_return": 0.31,
    },
    "range_compression": {
        "mean_return": 0.01,
        "volatility": 0.11,
        "drawdown": 0.18,
        "latest_return": 0.02,
    },
    "stress_shock": {
        "mean_return": -0.19,
        "volatility": 0.42,
        "drawdown": 1.25,
        "latest_return": -0.73,
    },
    "deflation_bid": {
        "mean_return": -0.08,
        "volatility": 0.24,
        "drawdown": 0.37,
        "latest_return": -0.16,
    },
}


def _distance(a: dict[str, float], b: dict[str, float]) -> float:
    keys = sorted(set(a) & set(b))
    return sqrt(sum((a[key] - b[key]) ** 2 for key in keys))


def find_top_analogs(features: dict[str, float], limit: int = 3) -> list[AnalogCandidate]:
    ranked: list[AnalogCandidate] = []
    for label, template in ANALOG_LIBRARY.items():
        distance = _distance(features, template)
        similarity = max(0.0, min(1.0, 1.0 / (1.0 + distance)))
        ranked.append(AnalogCandidate(label=label, distance=round(distance, 4), similarity=round(similarity, 4)))

    ranked.sort(key=lambda candidate: candidate.distance)
    return ranked[:limit]
