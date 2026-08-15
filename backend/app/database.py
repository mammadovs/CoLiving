from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL bağlantı linki (öz məlumatlarına uyğun dəyişəcəksən: username, password, host, port, dbname)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/CoLiving"

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