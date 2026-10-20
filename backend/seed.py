import asyncio
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import engine, Base
from src.db.models import Role, User, Category
from src.core.security import get_password_hash, get_pin_hash

async def seed_database():
    print("Checking database connection and tables...")
    
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
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

        categories_data = ["Fruits", "Vegetables", "Grains", "Protein", "Dairy", "Others"]
        
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
            role_objs[r_name] = role.id

        # 2. Define dummy users and check/create them if missing
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
            print("\nDatabase already has all dummy accounts. Nothing to seed.")

if __name__ == "__main__":
    asyncio.run(seed_database())