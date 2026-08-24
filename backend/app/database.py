from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

# PostgreSQL bağlantı linki (öz məlumatlarına uyğun dəyişəcəksən: username, password, host, port, dbname)

# Engine yaradılması
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