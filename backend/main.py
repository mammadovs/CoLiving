from fastapi import FastAPI
from app.routers import users, listings, auth
from app.database import engine
from app import models
from app.routers import users, listings, auth, messages

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoLiving API")

# Bütün routerləri qoşuruq
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(messages.router)
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "CoLiving API işləyir!"}