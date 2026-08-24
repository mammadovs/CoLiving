from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    any = "any"

class SleepScheduleEnum(str, enum.Enum):
    early_bird = "early_bird"
    night_owl = "night_owl"
    flexible = "flexible"

class CleanlinessEnum(str, enum.Enum):
    very_tidy = "very_tidy"
    average = "average"
    relaxed = "relaxed"

class NoiseToleranceEnum(str, enum.Enum):
    quiet = "quiet"
    moderate = "moderate" 
    loud_ok = "loud_ok"

class GuestFrequencyEnum(str, enum.Enum):
    rarely = "rarely"
    sometimes = "sometimes"
    often = "often"

class ScheduleEnum(str, enum.Enum):
    mostly_home = "mostly_home"
    mostly_out = "mostly_out"
    mixed = "mixed"

class PersonalityTypeEnum(str, enum.Enum):
    introvert = "introvert"
    extrovert = "extrovert"
    ambivert = "ambivert"

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
    budget = Column(DECIMAL, nullable=True)
    sleep_schedule = Column(String, nullable=True)
    cleanliness_level = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    noise_tolerance = Column(String, nullable=True)
    smoking_habit = Column(Boolean, default=False)
    drinks_alcohol = Column(Boolean, default=False)
    pet_friendly = Column(Boolean, default=False)
    guest_frequency = Column(String, nullable=True)
    work_or_study_schedule = Column(String, nullable=True)
    personality_type = Column(String, nullable=True)

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
    phone_number = Column(String, nullable=True)
    
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
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    image_url = Column(String, nullable=False)

    listing = relationship("Listing", back_populates="images")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
