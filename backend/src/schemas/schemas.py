from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from typing import Optional, List


# ROLES & USERS SCHEMAS
class RoleResponse(BaseModel):
    id: int
    role_name: str
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    password: str
    pin: str
    role_id: int

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    password: str

class PINVerify(BaseModel):
    pin: str

class UserResponse(BaseModel):
    id: int
    username: str
    role_id: int
    is_active: bool
    created_at: datetime
    role: Optional[RoleResponse] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# CATEGORIES & INVENTORY SCHEMAS
class CategoryResponse(BaseModel):
    id: int
    category_name: str
    model_config = ConfigDict(from_attributes=True)

class InventoryCreate(BaseModel):
    item_name: str
    amount: int = Field(ge=0, description="Amount must be 0 or greater")
    category_id: int
    expiration_date: date

class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    amount: Optional[int] = Field(default=None, ge=0)
    category_id: Optional[int] = None
    expiration_date: Optional[date] = None

class InventoryResponse(BaseModel):
    id: int
    item_name: str
    amount: int
    category_id: int
    expiration_date: date
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ORDERS & ORDER ITEMS SCHEMAS
class OrderItemCreate(BaseModel):
    item_id: int
    quantity_taken: int = Field(gt=0, description="Quantity must be greater than 0")

class OrderCreate(BaseModel):
    pin: str 
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    item_id: int
    quantity_taken: int
    item: Optional[InventoryResponse] = None

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    order_items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# AUDIT LOG SCHEMAS
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_role: str
    action_type: str
    target_table: str
    record_id: int
    old_value: Optional[dict] = None
    new_value: dict
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)