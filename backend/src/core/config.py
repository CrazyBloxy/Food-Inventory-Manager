from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Application Config
    PROJECT_NAME: str = "Food Pantry & Inventory Manager API"
    VERSION: str = "1.0.0"
    
    # Database Configuration
    DATABASE_URL: str
    
    # JWT Security Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Tells Pydantic to read variables from .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings singleton
settings = Settings()