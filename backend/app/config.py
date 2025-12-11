from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Anthropic
    # ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: str
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        # Buscar .env en el directorio backend/ (un nivel arriba de app/)
        env_file = str(Path(__file__).parent.parent / ".env")
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Obtiene la configuración (cacheada)"""
    return Settings()

def clear_settings_cache():
    """Limpia el caché de configuración (útil cuando se actualiza .env)"""
    get_settings.cache_clear()