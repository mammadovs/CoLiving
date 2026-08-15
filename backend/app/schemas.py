from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models import GenderEnum, ReligionEnum, UniversityEnum

# --- USER SCHEMAS ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    is_student: bool = True
    university: UniversityEnum = UniversityEnum.other
    profession: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_student: bool
    university: UniversityEnum
    profession: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- LISTING SCHEMAS ---

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price_per_person: Decimal
    address: str
    nearest_university: UniversityEnum = UniversityEnum.ada
    available_spots: int
    
    # Filtrlər
    preferred_gender: GenderEnum = GenderEnum.any
    smoking_allowed: bool = False
    alcohol_allowed: bool = False
    religion_preference: ReligionEnum = ReligionEnum.secular
    
    # Detallar
    has_wifi: bool = True
    is_furnished: bool = True
    is_active: bool = True

class ListingResponse(ListingCreate):
    id: int
    user_id: int # Bu 'owner_id' əvəzinə models.py-da 'user_id' yazmısan

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None