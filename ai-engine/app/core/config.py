import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    MODEL_CACHE_DIR: str = "./models"
    DATA_OUTPUT_DIR: str = "./output"

    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

os.makedirs(settings.MODEL_CACHE_DIR, exist_ok=True)
os.makedirs(settings.DATA_OUTPUT_DIR, exist_ok=True)
