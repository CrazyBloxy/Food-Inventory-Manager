import asyncio
from datetime import date, timedelta
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import engine, Base
from src.db.models import Role, User, Category, InventoryItem
from src.core.security import get_password_hash, get_pin_hash

async def seed_database():
    print("Checking database connection and tables...")
    
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        # 1. Define roles and check/create them
        roles_data = ["Admin", "Inventory Manager", "Employee"]
        role_objs = {}

        for r_name in roles_data:
            result = await session.execute(select(Role).where(Role.role_name == r_name))
            role = result.scalars().first()
            if not role:
                role = Role(role_name=r_name)
                session.add(role)
                await session.flush()
                print(f"-> Created Role: {r_name}")
            else:
                print(f"-> Role already exists: {r_name}")
            role_objs[r_name] = role.id

        # 2. Define categories and check/create them (Populating category_objs)
        categories_data = ["Fruits", "Vegetables", "Grains", "Protein", "Dairy", "Others"]
        category_objs = {}
        
        for cat_name in categories_data:
            result = await session.execute(select(Category).where(Category.category_name == cat_name))
            category = result.scalars().first()
            if not category:
                category = Category(category_name=cat_name)
                session.add(category)
                await session.flush()
                print(f"-> Created Category: {cat_name}")
            else:
                print(f"-> Category already exists: {cat_name}")
            category_objs[cat_name] = category.id

        # 3. Define dummy users and check/create them if missing
        users_data = [
            {"username": "admin_user", "password": "password123", "pin": "1111", "role": "Admin"},
            {"username": "manager_user", "password": "password123", "pin": "2222", "role": "Inventory Manager"},
            {"username": "employee_user", "password": "password123", "pin": "3333", "role": "Employee"},
        ]

        created_count = 0
        for u_data in users_data:
            result = await session.execute(select(User).where(User.username == u_data["username"]))
            existing_user = result.scalars().first()
            
            if not existing_user:
                new_user = User(
                    username=u_data["username"],
                    password_hash=get_password_hash(u_data["password"]),
                    pin_hash=get_pin_hash(u_data["pin"]),
                    role_id=role_objs[u_data["role"]],
                    is_active=True
                )
                session.add(new_user)
                print(f"-> Created User: {u_data['username']} ({u_data['role']})")
                created_count += 1
            else:
                print(f"-> User already exists: {u_data['username']}")

        await session.commit()
        
        if created_count > 0:
            print(f"\nSuccessfully seeded {created_count} new dummy account(s)!")
        else:
            print("\nDatabase already has all dummy accounts.")

        # 4. Define inventory items and check/create them if missing
        inventory_data = [
            {"item_name": "Organic Bananas", "amount": 45, "category": "Fruits", "days_to_expire": 7},
            {"item_name": "Red Apples", "amount": 60, "category": "Fruits", "days_to_expire": 14},
            {"item_name": "Fresh Spinach", "amount": 25, "category": "Vegetables", "days_to_expire": 5},
            {"item_name": "Carrots (5lb bag)", "amount": 30, "category": "Vegetables", "days_to_expire": 21},
            {"item_name": "Brown Rice (10kg)", "amount": 15, "category": "Grains", "days_to_expire": 365},
            {"item_name": "Whole Wheat Bread", "amount": 20, "category": "Grains", "days_to_expire": 7},
            {"item_name": "Chicken Breast (kg)", "amount": 40, "category": "Protein", "days_to_expire": 4},
            {"item_name": "Canned Tuna", "amount": 80, "category": "Protein", "days_to_expire": 730},
            {"item_name": "Whole Milk (Gallon)", "amount": 18, "category": "Dairy", "days_to_expire": 10},
            {"item_name": "Cheddar Cheese Block", "amount": 25, "category": "Dairy", "days_to_expire": 45},
        ]

        created_items_count = 0
        for inv_data in inventory_data:
            result = await session.execute(select(InventoryItem).where(InventoryItem.item_name == inv_data["item_name"]))
            existing_item = result.scalars().first()
            
            if not existing_item:
                exp_date = date.today() + timedelta(days=inv_data["days_to_expire"])
                new_item = InventoryItem(
                    item_name=inv_data["item_name"],
                    amount=inv_data["amount"],
                    category_id=category_objs[inv_data["category"]],
                    expiration_date=exp_date
                )
                session.add(new_item)
                print(f"-> Created Inventory Item: {inv_data['item_name']} ({inv_data['category']})")
                created_items_count += 1
            else:
                print(f"-> Inventory Item already exists: {inv_data['item_name']}")

        # Final commit to save inventory items
        await session.commit()
        print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())