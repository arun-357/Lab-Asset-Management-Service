from pydantic import AnyUrl, validator
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lab Asset Manager"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # DB
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./dev.db"  # override with env for mysql
    TEST_SQLALCHEMY_DATABASE_URI: str = "mysql+pymysql://asset_test:asset_test_pwd@localhost/asset_management_test"

    # Auth
    SECRET_KEY: str = "base64key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: Optional[List[str]] = None

    class Config:
        env_file = ".env"

settings = Settings()
