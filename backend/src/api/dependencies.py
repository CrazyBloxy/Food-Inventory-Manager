from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.db.models import User
from src.core.security import decode_access_token, verify_pin_hash
from src.repositories.user_repo import UserRepository

# OAuth2 scheme looking for token in "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# AUTHENTICATION DEPENDENCY
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(int(user_id))
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return user


# ROLE-BASED ACCESS CONTROL DEPENDENCY
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.role_name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user

class VerifyPinDependency:
    """Dependency that requires a valid user PIN via X-PIN header for data modifications."""
    async def __call__(
        self,
        x_pin: str = Header(..., description="User PIN required for data modifications"),
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not x_pin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PIN is required for this action."
            )
        if not verify_pin_hash(x_pin, current_user.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect PIN."
            )
        return current_user

# Instantiate for easy injection in route handlers
require_pin = VerifyPinDependency()