# src/api/v1/audit.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_db
from src.db.models import User
from src.repositories.audit_repo import AuditLogRepository

router = APIRouter(tags=["Audit Logs"])

@router.get("")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    audit_repo = AuditLogRepository(db)
    user_role = current_user.role.role_name

    # Admin sees everything; Employee & Inventory Manager see only their peer role logs
    if user_role == "Admin":
        roles_filter = None  # No filter = see all logs
    else:
        roles_filter = [user_role]

    return await audit_repo.get_by_roles(allowed_roles=roles_filter, skip=skip, limit=limit)