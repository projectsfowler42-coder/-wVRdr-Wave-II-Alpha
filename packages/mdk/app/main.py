from __future__ import annotations

from fastapi import FastAPI

from app.build_info import get_build_info
from app.config import get_settings
from app.deploy.fingerprint import build_payload
from app.fire.run_fire import run_fire
from app.forge import build_forge_output
from app.models import ForgePacket, MarketSnapshot, PacketRequest
from app.sample_data import get_sample_history, get_sample_snapshot
from app.shadow.run_shadow import run_shadow

app = FastAPI(title=get_settings().app_name)


def _history_from_snapshot(snapshot: MarketSnapshot) -> list[float]:
    breadth_bias = (snapshot.breadth - 0.5) * 0.8
    vix_bias = max(-0.25, min(0.25, -snapshot.vix_change_pct / 40.0))
    rate_bias = max(-0.2, min(0.2, snapshot.rate_change_bps / 100.0))
    liquidity_bias = -snapshot.liquidity_stress * 0.35
    latest_move = max(-2.0, min(2.0, snapshot.price_change_pct))

    return [
        round((breadth_bias * 0.4) + (rate_bias * 0.3), 4),
        round((breadth_bias * 0.6) + (vix_bias * 0.4), 4),
        round((rate_bias * 0.5) + (liquidity_bias * 0.5), 4),
        round((vix_bias * 0.6) + (liquidity_bias * 0.4), 4),
        round((breadth_bias * 0.25) + (latest_move * 0.15), 4),
        round((rate_bias * 0.2) + (latest_move * 0.25), 4),
        round((liquidity_bias * 0.35) + (latest_move * 0.25), 4),
        round((vix_bias * 0.3) + (latest_move * 0.3), 4),
        round((breadth_bias * 0.15) + (liquidity_bias * 0.2) + (latest_move * 0.25), 4),
        round(latest_move, 4),
    ]


def build_packet(snapshot: MarketSnapshot, history: list[float] | None = None) -> ForgePacket:
    shadow_history = history or _history_from_snapshot(snapshot)
    shadow = run_shadow(shadow_history)
    fire = run_fire(snapshot)
    forge = build_forge_output(shadow, fire)

    return ForgePacket(
        ts=snapshot.timestamp,
        symbol=snapshot.symbol,
        shadow=shadow,
        fire=fire,
        forge=forge,
    )


@app.get("/health")
def health() -> dict[str, str]:
    settings = get_settings()
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


@app.get("/__build.json")
def get_build_payload() -> dict[str, str]:
    settings = get_settings()
    return build_payload(get_build_info(settings))


@app.get("/packet", response_model=ForgePacket)
def get_packet(symbol: str | None = None) -> ForgePacket:
    settings = get_settings()
    snapshot = get_sample_snapshot(symbol or settings.default_symbol)
    return build_packet(snapshot, history=get_sample_history())


@app.post("/packet", response_model=ForgePacket)
def post_packet(packet_request: PacketRequest) -> ForgePacket:
    snapshot = MarketSnapshot(**packet_request.model_dump(exclude={"history"}))
    return build_packet(snapshot, history=packet_request.history)
