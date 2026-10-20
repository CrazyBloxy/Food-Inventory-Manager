from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic_settings import BaseSettings, SettingsConfigDict

class SecuritySettings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

security_settings = SecuritySettings()

# Passlib configuration for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# PASSWORD & PIN HASHING
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_pin_hash(pin: str) -> str:
    return pwd_context.hash(pin)

def verify_pin_hash(plain_pin: str, hashed_pin: str) -> bool:
    return pwd_context.verify(plain_pin, hashed_pin)

# Aliases to support both naming conventions across route files
hash_password = get_password_hash
hash_pin = get_pin_hash


# JWT TOKEN HANDLER
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=security_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, security_settings.SECRET_KEY, algorithm=security_settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, security_settings.SECRET_KEY, algorithms=[security_settings.ALGORITHM])
    except JWTError:
        return None