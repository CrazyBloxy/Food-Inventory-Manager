from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.db.models import User
from src.schemas.schemas import UserCreate, UserUpdate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch a single user by primary key, eagerly loading their assigned Role."""
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Fetch a user by username for authentication or uniqueness checks."""
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.username == username)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[User]:
        """Retrieve a paginated list of all users for Admin management screens."""
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, user_data: UserCreate, hashed_password: str, hashed_pin: str) -> User:
        """Create a new user account with hashed password and PIN."""
        db_user = User(
            username=user_data.username,
            password_hash=hashed_password,
            pin_hash=hashed_pin,
            role_id=user_data.role_id,
            is_active=True
        )
        self.db.add(db_user)
        await self.db.flush()
        await self.db.refresh(db_user, ["role"])
        return db_user

    async def update(
        self,
        user: User,
        update_data: UserUpdate,
        hashed_password: Optional[str] = None,
        hashed_pin: Optional[str] = None
    ) -> User:
        """Update existing user fields, role, active status, or credentials."""
        if update_data.username is not None:
            user.username = update_data.username
        if update_data.role_id is not None:
            user.role_id = update_data.role_id
        if update_data.is_active is not None:
            user.is_active = update_data.is_active
        if hashed_password is not None:
            user.password_hash = hashed_password
        if hashed_pin is not None:
            user.pin_hash = hashed_pin

        await self.db.flush()
        await self.db.refresh(user, ["role"])
        return user

    async def delete(self, user: User) -> None:
        """Permanently delete a user account from PostgreSQL."""
        await self.db.delete(user)
        await self.db.flush()