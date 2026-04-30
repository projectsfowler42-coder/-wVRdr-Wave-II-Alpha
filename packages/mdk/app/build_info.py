from __future__ import annotations

from datetime import datetime, timezone
import os

from pydantic import BaseModel

from app.config import Settings

_RUNTIME_STARTED_AT = datetime.now(timezone.utc).isoformat()


class BuildInfo(BaseModel):
    app: str
    env: str
    version: str
    commit: str
    branch: str
    built_at: str
    build_source: str


def _clean_env(name: str) -> str | None:
    value = os.getenv(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


def _resolve_build_metadata() -> tuple[str, str, str, str, str]:
    version = _clean_env("MDK_VERSION") or "0.1.0"
    commit = _clean_env("MDK_GIT_SHA") or "dev"
    branch = _clean_env("MDK_GIT_BRANCH") or "main"
    built_at = _clean_env("MDK_BUILD_TIME")
    declared_source = _clean_env("MDK_BUILD_SOURCE")

    if built_at is not None:
        build_source = declared_source or "build_metadata"
        return version, commit, branch, built_at, build_source

    build_source = declared_source or "runtime_fallback"
    return version, commit, branch, _RUNTIME_STARTED_AT, build_source


def get_build_info(settings: Settings) -> BuildInfo:
    version, commit, branch, built_at, build_source = _resolve_build_metadata()
    return BuildInfo(
        app=settings.app_name,
        env=settings.app_env,
        version=version,
        commit=commit,
        branch=branch,
        built_at=built_at,
        build_source=build_source,
    )
