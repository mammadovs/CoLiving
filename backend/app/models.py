from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    any = "any"

class DistrictEnum(str, enum.Enum):
    nasimi = "Nasimi"
    yasamal = "Yasamal"
    sabail = "Sabail"
    narimanov = "Narimanov"
    nizami = "Nizami"
    khatai = "Khatai"
    binagadi = "Binagadi"
    qaradagh = "Qaradagh"
    sabunchu = "Sabunchu"
    surakhani = "Surakhani"
    other = "Other"

class ReligionEnum(str, enum.Enum):
    muslim = "muslim"
    christian = "christian"
    secular = "secular"  # və ya fərqi yoxdur / dini baxımdan neytral
    other = "other"

class UniversityEnum(str, enum.Enum):
    ada = "ADA University"
    bdu = "BDU"
    adnsu = "ADNSU"
    atu = "ATU"
    khazar = "Khazar University"
    other = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_student = Column(Boolean, default=True)
    university = Column(String, default=UniversityEnum.other, nullable=False)
    profession = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String)
    price_per_person = Column(DECIMAL, nullable=False)
    address = Column(String, nullable=False)
    district = Column(String, default=DistrictEnum.other, nullable=False)
    nearest_university = Column(String, default=UniversityEnum.ada, nullable=False)
    available_spots = Column(Integer, nullable=False)
    
    # Filtrlər
    preferred_gender = Column(String, default=GenderEnum.any, nullable=False)
    smoking_allowed = Column(Boolean, default=False)
    alcohol_allowed = Column(Boolean, default=False)
    religion_preference = Column(String, default=ReligionEnum.secular, nullable=False)
    
    # Detallar
    has_wifi = Column(Boolean, default=True)
    is_furnished = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    # Əlaqə
    owner = relationship("User")