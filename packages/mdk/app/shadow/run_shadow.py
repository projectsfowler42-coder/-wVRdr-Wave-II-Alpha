from __future__ import annotations

from app.models import ShadowOutput
from app.shadow.analogs import find_top_analogs
from app.shadow.features import classify_regime, compute_shadow_features


def run_shadow(history: list[float]) -> ShadowOutput:
    features = compute_shadow_features(history)
    analogs = find_top_analogs(features)
    avg_similarity = sum(candidate.similarity for candidate in analogs) / len(analogs)

    return ShadowOutput(
        regime=classify_regime(features),
        top_analogs=analogs,
        confidence=round(avg_similarity, 4),
    )
