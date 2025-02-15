from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str
    debug: bool
    llama_cloud_api_key: str
    groq_api_key: str
    google_api_key: str
    google_application_credentials: str 
    google_cloud_project: str
    api_v1_str: str
    
    class Config:
        env_file = "././.env"
        
        
settings = Settings()