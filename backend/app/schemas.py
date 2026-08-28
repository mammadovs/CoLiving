from pydantic import BaseModel, EmailStr, model_validator, Field
from typing import Optional, List
from datetime import datetime
from typing import Optional
from decimal import Decimal
from app.models import DistrictEnum, GenderEnum, ReligionEnum, UniversityEnum, SleepScheduleEnum, CleanlinessEnum, NoiseToleranceEnum, GuestFrequencyEnum, ScheduleEnum, PersonalityTypeEnum

# --- USER SCHEMAS ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    is_student: bool = True
    university: UniversityEnum = UniversityEnum.other
    profession: Optional[str] = None
    budget: Optional[Decimal] = None
    sleep_schedule: Optional[SleepScheduleEnum] = None
    cleanliness_level: Optional[CleanlinessEnum] = None
    religion: Optional[ReligionEnum] = None
    noise_tolerance: Optional[NoiseToleranceEnum] = None
    smoking_habit: bool = False
    drinks_alcohol: bool = False
    pet_friendly: bool = False
    guest_frequency: Optional[GuestFrequencyEnum] = None
    work_or_study_schedule: Optional[ScheduleEnum] = None
    personality_type: Optional[PersonalityTypeEnum] = None


    @model_validator(mode="after")
    def check_student_email_domain(self):
        if self.is_student:
            domain = self.email.split("@")[-1].lower()
            if not domain.endswith("edu.az"):
                raise ValueError(
                    "Students must register with a university email (must end in edu.az)"
                )
        return self

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profession: Optional[str] = None
    budget: Optional[Decimal] = None
    sleep_schedule: Optional[SleepScheduleEnum] = None
    cleanliness_level: Optional[CleanlinessEnum] = None
    religion: Optional[ReligionEnum] = None
    noise_tolerance: Optional[NoiseToleranceEnum] = None
    smoking_habit: Optional[bool] = None
    drinks_alcohol: Optional[bool] = None
    pet_friendly: Optional[bool] = None
    guest_frequency: Optional[GuestFrequencyEnum] = None
    work_or_study_schedule: Optional[ScheduleEnum] = None
    personality_type: Optional[PersonalityTypeEnum] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_student: bool
    university: UniversityEnum
    profession: Optional[str] = None
    budget: Optional[Decimal] = None
    sleep_schedule: Optional[SleepScheduleEnum] = None
    cleanliness_level: Optional[CleanlinessEnum] = None
    religion: Optional[ReligionEnum] = None
    noise_tolerance: Optional[NoiseToleranceEnum] = None
    smoking_habit: bool = False
    drinks_alcohol: bool = False
    pet_friendly: bool = False
    guest_frequency: Optional[GuestFrequencyEnum] = None
    work_or_study_schedule: Optional[ScheduleEnum] = None
    personality_type: Optional[PersonalityTypeEnum] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- LISTING SCHEMAS ---
class ListingImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price_per_person: Decimal = Field(gt=0)
    address: str
    district: DistrictEnum = DistrictEnum.other
    nearest_university: UniversityEnum = UniversityEnum.ada
    available_spots: int = Field(gt=0)
    phone_number: Optional[str] = None
    
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
    images: List[ListingImageResponse] = []

    class Config:
        from_attributes = True

class CompatibilityBreakdown(BaseModel):
    sleep_schedule: int
    cleanliness_level: int
    religion: int
    noise_tolerance: int
    smoking_habit: int
    drinks_alcohol: int
    pet_friendly: int
    guest_frequency: int
    work_or_study_schedule: int
    personality_type: int
    budget: int

class CompatibilityScoreResponse(BaseModel):
    user_id: int
    compared_with_user_id: int
    compatibility_score: int
    breakdown: CompatibilityBreakdown

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    other_user_id: int
    other_user_name: str
    last_message: str
    last_message_at: datetime
    unread_count: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None