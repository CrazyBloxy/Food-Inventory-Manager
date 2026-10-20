from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.db.models import Order, OrderItem
from src.schemas.schemas import OrderCreate


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, order_id: int) -> Optional[Order]:
        """Fetch a specific order by ID, eagerly loading line items and associated inventory."""
        stmt = (
            select(Order)
            .options(
                selectinload(Order.order_items).selectinload(OrderItem.item)
            )
            .where(Order.id == order_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[Order]:
        """Retrieve a paginated list of all pantry distribution orders."""
        stmt = (
            select(Order)
            .options(
                selectinload(Order.order_items).selectinload(OrderItem.item)
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, user_id: int, order_data: OrderCreate) -> Order:
        """Create a new order header and insert all associated line items."""
        db_order = Order(user_id=user_id)
        self.db.add(db_order)
        await self.db.flush()  # Flushes to generate the db_order.id

        for item_data in order_data.items:
            db_order_item = OrderItem(
                order_id=db_order.id,
                item_id=item_data.item_id,
                quantity_taken=item_data.quantity_taken
            )
            self.db.add(db_order_item)

        await self.db.flush()
        await self.db.refresh(db_order, ["order_items"])
        return db_order