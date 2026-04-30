from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class MarketSnapshot(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    symbol: str = Field(default="SPY")
    price_change_pct: float = Field(default=0.0, description="Current price move in percent.")
    vix_change_pct: float = Field(default=0.0, description="VIX move in percent.")
    breadth: float = Field(default=0.5, ge=0.0, le=1.0, description="Market breadth on a 0..1 scale.")
    liquidity_stress: float = Field(default=0.0, ge=0.0, le=1.0)
    rate_change_bps: float = Field(default=0.0, description="Approximate rates move in basis points.")


class PacketRequest(MarketSnapshot):
    history: list[float] | None = Field(default=None, min_length=1)


class AnalogCandidate(BaseModel):
    label: str
    distance: float
    similarity: float = Field(ge=0.0, le=1.0)


class ShadowOutput(BaseModel):
    regime: str
    top_analogs: list[AnalogCandidate]
    confidence: float = Field(ge=0.0, le=1.0)


class FireOutput(BaseModel):
    bullish: float = Field(ge=0.0, le=1.0)
    bearish: float = Field(ge=0.0, le=1.0)
    novelty: float = Field(ge=0.0, le=1.0)
    fragility: float = Field(ge=0.0, le=1.0)
    contradiction: float = Field(ge=0.0, le=1.0)


class ForgeOutput(BaseModel):
    posture: Literal[
        "observe",
        "constructive_watch",
        "defensive_watch",
        "high_alert",
    ]
    confidence: float = Field(ge=0.0, le=1.0)
    invalidation: str


class ForgePacket(BaseModel):
    ts: datetime
    symbol: str
    shadow: ShadowOutput
    fire: FireOutput
    forge: ForgeOutput
