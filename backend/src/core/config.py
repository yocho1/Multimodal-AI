import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Configuration
    PROJECT_NAME: str = "Multimodal AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 60 minutes * 24 hours * 8 days = 8 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./multimodal.db")
    
    # Vector Database
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # Model Configurations
    IMAGE_MODEL_NAME: str = "google/vit-base-patch16-224-in21k"  # More widely available
    TEXT_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"  # Lighter, faster
    EMBEDDING_DIM: int = 768
    
    # Redis for caching and Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # File Upload
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/jpg"]
    
    class Config:
        case_sensitive = True

settings = Settings()