from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1 import auth, inventory, orders, users, audit

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

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(audit.router, prefix="/api/v1/audit-logs", tags=["Audit Logs"])