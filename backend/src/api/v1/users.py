from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.api.dependencies import get_db, RoleChecker, require_pin
from src.db.models import User
from src.schemas.schemas import UserCreate, UserUpdate, UserResponse
from src.repositories.user_repo import UserRepository
from src.repositories.audit_repo import AuditLogRepository
from src.core.security import hash_password, hash_pin

router = APIRouter(tags=["Users"])

# Restrict all user management routes strictly to Admins
require_admin = RoleChecker(allowed_roles=["Admin"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a paginated list of all system users. Restricted to Admins."""
    user_repo = UserRepository(db)
    users = await user_repo.get_all(skip=skip, limit=limit)
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user account (Employee, Inventory Manager, or Admin). 
    Restricted to Admins, requires PIN header, and logs the audit event.
    """
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)

    # Check if username already exists
    existing_user = await user_repo.get_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )

    # Hash the password and PIN before storing
    hashed_pwd = hash_password(user_data.password)
    hashed_p = hash_pin(user_data.pin)

    new_user = await user_repo.create(
        user_data=user_data,
        hashed_password=hashed_pwd,
        hashed_pin=hashed_p
    )

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="CREATE_USER",
        target_table="users",
        record_id=new_user.id,
        new_value={"username": new_user.username, "role_id": new_user.role_id}
    )

    return new_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    update_data: UserUpdate,
    current_user: User = Depends(require_admin),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing user account's metadata, role, status, or credentials. 
    Restricted to Admins, requires PIN header, and logs the audit event.
    """
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)

    target_user = await user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Capture old values for audit logging diff
    old_values = {
        "username": target_user.username,
        "role_id": target_user.role_id,
        "is_active": target_user.is_active
    }

    # Handle optional password or pin updates if passed in request schema
    hashed_pwd = hash_password(update_data.password) if getattr(update_data, "password", None) else None
    hashed_p = hash_pin(update_data.pin) if getattr(update_data, "pin", None) else None

    updated_user = await user_repo.update(
        user=target_user,
        update_data=update_data,
        hashed_password=hashed_pwd,
        hashed_pin=hashed_p
    )

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="UPDATE_USER",
        target_table="users",
        record_id=updated_user.id,
        old_value=old_values,
        new_value={
            "username": updated_user.username,
            "role_id": updated_user.role_id,
            "is_active": updated_user.is_active
        }
    )

    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a user account. 
    Restricted to Admins, requires PIN header, and logs the audit event.
    """
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)

    target_user = await user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Prevent admin from accidentally deleting themselves
    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own active administrator account."
        )

    old_values = {
        "username": target_user.username,
        "role_id": target_user.role_id
    }

    await user_repo.delete(target_user)

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="DELETE_USER",
        target_table="users",
        record_id=user_id,
        old_value=old_values,
        new_value=None
    )

    return None