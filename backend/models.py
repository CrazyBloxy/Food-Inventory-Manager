from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
from database import Base

# ROLES TABLE
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(30), unique=True, nullable=False)

# USERS TABLE
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    pin_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# CATEGORIES TABLE
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)

# INVENTORY TABLE
class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(150), nullable=False)
    amount = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    expiration_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        CheckConstraint("amount >= 0", name="check_amount_positive"),
    )

# ORDERS TABLE
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# ORDER ITEMS TABLE
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("inventory.id", ondelete="RESTRICT"), nullable=False)
    quantity_taken = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity_taken > 0", name="check_quantity_taken_positive"),
    )

# AUDIT LOGS TABLE
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_role = Column(String(30), nullable=False)
    action_type = Column(String(50), nullable=False)
    target_table = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=False)
    old_value = Column(JSONB, nullable=True, default=None)
    new_value = Column(JSONB, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
