from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import users, listings, auth, messages
from app.database import engine
from app import models
from fastapi.responses import JSONResponse

app = FastAPI(
    title="CoLiving API",
    description="Backend API for CoLiving — a platform connecting university students in Baku with compatible roommates and shared housing listings.",
    version="1.0.0"
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our end. Please try again later."}
    )

origins = [
    "http://localhost:3000",   # React default
    "http://localhost:5173",   # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Bütün routerləri qoşuruq
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(auth.router)
app.include_router(messages.router)

@app.get("/")
def root():
    return {"message": "CoLiving API işləyir!"}