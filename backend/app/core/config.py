from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    supabase_anon_key: str
    gemini_api_key: str
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_redirect_uri: str = "http://localhost:8000/api/gmail/callback"
    frontend_url: str = "http://localhost:3000"
    secret_key: str = "changeme-use-strong-secret-in-production"

    class Config:
        env_file = ".env"


settings = Settings()
