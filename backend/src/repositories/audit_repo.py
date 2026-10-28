from typing import Optional, Sequence, Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db.models import AuditLog


class AuditLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_log(
        self,
        user_id: Optional[int],
        user_role: str,
        action_type: str,
        target_table: str,
        record_id: int,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Create a new immutable audit log entry (ignoring login/logout actions)."""
        log_entry = AuditLog(
            user_id=user_id,
            user_role=user_role,
            action_type=action_type,
            target_table=target_table,
            record_id=record_id,
            old_value=old_value,
            new_value=new_value or {}
        )
        self.db.add(log_entry)
        await self.db.flush()
        return log_entry

    async def get_by_roles(
        self, 
        allowed_roles: Optional[List[str]] = None, 
        skip: int = 0, 
        limit: int = 100
        ) -> Sequence[AuditLog]:
        """Fetch audit logs filtered by target user roles. If allowed_roles is None, returns all logs."""
        stmt = select(AuditLog).order_by(AuditLog.timestamp.desc())
        
        # Filter logs matching only specific user roles
        if allowed_roles:
            stmt = stmt.where(AuditLog.user_role.in_(allowed_roles))
            
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()