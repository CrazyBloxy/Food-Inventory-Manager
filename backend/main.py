from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
import models

app = FastAPI(title="Food Inventory Manager API")

origins = [
    "http://localhost:5173/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get("/")
async def root_health_check():
    return {
        "status": "healthy",
        "system": "Food Pantry & Inventory Manager",
        "documentation": "/docs"
    }

@app.get("/users")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    try:
        # Construct an async SELECT query for the User table
        query = select(models.User)
        result = await db.execute(query)
        
        users = result.scalars().all()
        return {"status": "success", "data": users}
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to read users from database. Error: {str(e)}"
        )


@app.get("/categories")
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    try:
        # Construct an async SELECT query for the Category table
        query = select(models.Category)
        result = await db.execute(query)
        
        # Turn database records into a clean python list
        categories = result.scalars().all()
        return {"status": "success", "data": categories}
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to read categories from database. Verify seeding is done. Error: {str(e)}"
        )

@app.get("/inventory")
async def get_all_inventory(db: AsyncSession = Depends(get_db)):
    try:
        # Construct an async SELECT query for the Inventory table
        query = select(models.InventoryItem)
        result = await db.execute(query)
        
        items = result.scalars().all()
        return {"status": "success", "data": items}
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to read inventory from database. Error: {str(e)}"
        )

