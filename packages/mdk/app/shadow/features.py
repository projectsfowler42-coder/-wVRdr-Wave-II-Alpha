from __future__ import annotations

from math import sqrt


def compute_shadow_features(history: list[float]) -> dict[str, float]:
    if not history:
        raise ValueError("history must not be empty")

    mean_return = sum(history) / len(history)
    variance = sum((value - mean_return) ** 2 for value in history) / len(history)
    volatility = sqrt(variance)

    cumulative = 0.0
    peak = float("-inf")
    drawdown = 0.0
    for value in history:
        cumulative += value
        peak = max(peak, cumulative)
        drawdown = min(drawdown, cumulative - peak)

    return {
        "mean_return": mean_return,
        "volatility": volatility,
        "drawdown": abs(drawdown),
        "latest_return": history[-1],
    }


def classify_regime(features: dict[str, float]) -> str:
    latest = features["latest_return"]
    volatility = features["volatility"]
    drawdown = features["drawdown"]

    if latest < -0.5 or (volatility > 0.35 and drawdown > 0.8):
        return "stress_risk_off"
    if latest > 0.25 and volatility < 0.25:
        return "trend_up"
    if latest < -0.2 and volatility < 0.3:
        return "trend_down"
    return "range"
