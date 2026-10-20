from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_db, get_current_user
from src.core.security import verify_password, create_access_token
from src.db.models import User
from src.repositories.user_repo import UserRepository

router = APIRouter(tags=["Authentication"])


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user credentials (username and password) 
    and return a JWT access token. 
    (Exempt from audit logging).
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(form_data.username)
    
    # Verify user exists and password matches
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Ensure account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
        
    # Generate JWT access token with user ID embedded in the 'sub' claim
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Retrieve details and role mapping for the currently logged-in user."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role.role_name if current_user.role else None,
        "is_active": current_user.is_active
    }