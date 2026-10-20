from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.api.dependencies import get_db, RoleChecker, require_pin
from src.db.models import User
from src.schemas.schemas import OrderCreate, OrderResponse
from src.repositories.order_repo import OrderRepository
from src.repositories.inventory_repo import InventoryRepository
from src.repositories.audit_repo import AuditLogRepository

router = APIRouter(tags=["Orders"])

# Restrict order creation and viewing to Employees and Admins/Managers if needed, 
# but specifically Employees handle distribution orders.
require_employee = RoleChecker(allowed_roles=["Employee", "Admin"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(require_employee),
    verified_user: User = Depends(require_pin),  # <-- Enforces mandatory X-PIN header verification
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new pantry distribution order. 
    Deducts stock from inventory items, records order details, and logs the audit event.
    """
    order_repo = OrderRepository(db)
    inventory_repo = InventoryRepository(db)
    audit_repo = AuditLogRepository(db)

    # 1. Validate stock levels for all items in the order before committing
    for item_detail in order_data.items:
        inv_item = await inventory_repo.get_by_id(item_detail.item_id)
        if not inv_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory item with ID {item_detail.item_id} not found."
            )
        if inv_item.amount < item_detail.quantity_taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for item '{inv_item.item_name}'. Available: {inv_item.amount}, Requested: {item_detail.quantity_taken}"
            )

    # 2. Deduct stock levels and create the order
    for item_detail in order_data.items:
        inv_item = await inventory_repo.get_by_id(item_detail.item_id)
        await inventory_repo.update_stock(inv_item, -item_detail.quantity_taken)

    new_order = await order_repo.create(user_id=current_user.id, order_data=order_data)

    # 3. Create an immutable audit log entry for this transaction
    await audit_repo.create_log(
        user_id=current_user.id,
        user_role=current_user.role.role_name,
        action_type="CREATE_ORDER",
        target_table="orders",
        record_id=new_order.id,
        new_value={"total_items": len(order_data.items)}
    )

    return new_order


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_employee),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve history of distribution orders."""
    order_repo = OrderRepository(db)
    orders = await order_repo.get_all(skip=skip, limit=limit)
    return orders