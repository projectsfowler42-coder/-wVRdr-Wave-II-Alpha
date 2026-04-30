from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MDK-9000_wVRdr"
    app_env: str = "dev"
    default_symbol: str = "SPY"

    model_config = SettingsConfigDict(env_prefix="MDK_", env_file=".env", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
