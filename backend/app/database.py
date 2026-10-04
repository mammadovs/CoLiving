from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

# SQLite üçün multi-threading dəstəyi (check_same_thread: False), digər bazalar üçün standart engine
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Hər bir sorğu (request) üçün yeni verilənlər bazası sessiyası yaratmaq üçün
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellərin miras alacağı baza sinif (Base)
Base = declarative_base()

# FastAPI-də hər sorğudan sonra bazanı bağlamaq (dependency) üçün istifadə olunan köməkçi funksiya
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
