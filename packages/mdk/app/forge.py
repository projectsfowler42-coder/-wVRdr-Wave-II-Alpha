from __future__ import annotations

from app.models import FireOutput, ForgeOutput, ShadowOutput


def build_forge_output(shadow: ShadowOutput, fire: FireOutput) -> ForgeOutput:
    if fire.bearish > 0.6 or fire.fragility > 0.65:
        posture = "defensive_watch"
    elif fire.bullish > 0.55 and shadow.regime == "trend_up":
        posture = "constructive_watch"
    elif fire.novelty > 0.75 and fire.contradiction > 0.0:
        posture = "high_alert"
    else:
        posture = "observe"

    fire_agreement = max(fire.bullish, fire.bearish)
    confidence = (shadow.confidence * 0.45) + (fire_agreement * 0.35) + ((1 - fire.novelty) * 0.20)

    if posture == "defensive_watch":
        invalidation = "Risk eases only if breadth improves and volatility cools."
    elif posture == "constructive_watch":
        invalidation = "Constructive bias fails if breadth rolls over or fragility rises."
    elif posture == "high_alert":
        invalidation = "Novelty remains unresolved until live state stops contradicting itself."
    else:
        invalidation = "Wait for a cleaner directional edge or lower novelty."

    return ForgeOutput(
        posture=posture,
        confidence=round(max(0.0, min(1.0, confidence)), 4),
        invalidation=invalidation,
    )
