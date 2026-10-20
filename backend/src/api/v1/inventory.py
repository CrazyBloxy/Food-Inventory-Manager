from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.api.dependencies import get_db, RoleChecker, require_pin
from src.db.models import User
from src.schemas.schemas import (
    InventoryCreate, 
    InventoryUpdate, 
    InventoryResponse, 
    CategoryResponse
)
from src.repositories.inventory_repo import InventoryRepository
from src.repositories.audit_repo import AuditLogRepository

router = APIRouter(tags=["Inventory"])

# Role permissions
require_employee = RoleChecker(allowed_roles=["Employee", "Inventory Manager", "Admin"])
require_manager = RoleChecker(allowed_roles=["Inventory Manager", "Admin"])


@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    current_user: User = Depends(require_employee),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all available inventory categories."""
    repo = InventoryRepository(db)
    return await repo.get_all_categories()


@router.get("", response_model=List[InventoryResponse])
async def list_inventory_items(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    current_user: User = Depends(require_employee),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a paginated list of inventory items, optionally filtered by category."""
    repo = InventoryRepository(db)
    return await repo.get_all(skip=skip, limit=limit, category_id=category_id)


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: int,
    current_user: User = Depends(require_employee),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific inventory item by its ID."""
    repo = InventoryRepository(db)
    item = await repo.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return item


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item_data: InventoryCreate,
    current_user: User = Depends(require_manager),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new inventory item. 
    Restricted to Inventory Managers/Admins, requires PIN header, and logs the audit event.
    """
    repo = InventoryRepository(db)
    audit_repo = AuditLogRepository(db)

    # Validate that category exists if provided
    if item_data.category_id:
        category = await repo.get_category_by_id(item_data.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID"
            )

    new_item = await repo.create(item_data)

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="CREATE_INVENTORY",
        target_table="inventory_items",
        record_id=new_item.id,
        new_value={"item_name": new_item.item_name, "amount": new_item.amount}
    )

    return new_item


@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: int,
    update_data: InventoryUpdate,
    current_user: User = Depends(require_manager),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing inventory item. 
    Restricted to Inventory Managers/Admins, requires PIN header, and logs the audit event.
    """
    repo = InventoryRepository(db)
    audit_repo = AuditLogRepository(db)

    item = await repo.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )

    # Capture old values for audit logging diff
    old_values = {
        "item_name": item.item_name,
        "amount": item.amount,
        "category_id": item.category_id
    }

    updated_item = await repo.update(item, update_data)

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="UPDATE_INVENTORY",
        target_table="inventory_items",
        record_id=updated_item.id,
        old_value=old_values,
        new_value={
            "item_name": updated_item.item_name,
            "amount": updated_item.amount,
            "category_id": updated_item.category_id
        }
    )

    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory_item(
    item_id: int,
    current_user: User = Depends(require_manager),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an inventory item. 
    Restricted to Inventory Managers/Admins, requires PIN header, and logs the audit event.
    """
    repo = InventoryRepository(db)
    audit_repo = AuditLogRepository(db)

    item = await repo.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )

    old_values = {
        "item_name": item.item_name,
        "amount": item.amount
    }

    await repo.delete(item)

    # Record immutable audit log
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="DELETE_INVENTORY",
        target_table="inventory_items",
        record_id=item_id,
        old_value=old_values,
        new_value=None
    )

    return None