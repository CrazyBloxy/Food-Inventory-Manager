from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.db.models import InventoryItem, Category
from src.schemas.schemas import InventoryCreate, InventoryUpdate


class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # CATEGORY OPERATIONS
    async def get_all_categories(self) -> Sequence[Category]:
        """Retrieve all available inventory categories."""
        stmt = select(Category)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_category_by_id(self, category_id: int) -> Optional[Category]:
        """Fetch a category by its ID."""
        stmt = select(Category).where(Category.id == category_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    # INVENTORY OPERATIONS
    async def get_by_id(self, item_id: int) -> Optional[InventoryItem]:
        """Fetch a single inventory item by ID, eagerly loading its category."""
        stmt = (
            select(InventoryItem)
            .options(selectinload(InventoryItem.category))
            .where(InventoryItem.id == item_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        category_id: Optional[int] = None
    ) -> Sequence[InventoryItem]:
        """Retrieve a paginated list of inventory items, optionally filtered by category."""
        stmt = select(InventoryItem).options(selectinload(InventoryItem.category))
        
        if category_id is not None:
            stmt = stmt.where(InventoryItem.category_id == category_id)
            
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, item_data: InventoryCreate) -> InventoryItem:
        """Create a new inventory item."""
        db_item = InventoryItem(
            item_name=item_data.item_name,
            amount=item_data.amount,
            category_id=item_data.category_id,
            expiration_date=item_data.expiration_date
        )
        self.db.add(db_item)
        await self.db.flush()
        await self.db.refresh(db_item, ["category"])
        return db_item

    async def update(self, item: InventoryItem, update_data: InventoryUpdate) -> InventoryItem:
        """Update existing inventory item fields."""
        if update_data.item_name is not None:
            item.item_name = update_data.item_name
        if update_data.amount is not None:
            item.amount = update_data.amount
        if update_data.category_id is not None:
            item.category_id = update_data.category_id
        if update_data.expiration_date is not None:
            item.expiration_date = update_data.expiration_date

        await self.db.flush()
        await self.db.refresh(item, ["category"])
        return item

    async def update_stock(self, item: InventoryItem, quantity_change: int) -> InventoryItem:
        """Adjust stock levels up or down (used during orders or manual adjustments)."""
        item.amount += quantity_change
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def delete(self, item: InventoryItem) -> None:
        """Permanently delete an inventory item."""
        await self.db.delete(item)
        await self.db.flush()