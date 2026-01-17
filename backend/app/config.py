"""
应用配置管理
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用配置类"""
    
    # Supabase 配置
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # JWT 配置
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Google Gemini API
    gemini_api_key: str
    
    # 应用配置
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://newspulse-ai.vercel.app"
    api_prefix: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """将 CORS 配置字符串转换为列表"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
