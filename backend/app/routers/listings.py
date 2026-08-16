# routers/listings.py
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user
from app.models import GenderEnum, ReligionEnum, UniversityEnum, DistrictEnum

router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)

# Elan yaratmaq (unchanged)
@router.post("/", response_model=schemas.ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: schemas.ListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_listing = models.Listing(
        user_id=current_user.id,
        title=listing.title,
        description=listing.description,
        price_per_person=listing.price_per_person,
        address=listing.address,
        district=listing.district,
        nearest_university=listing.nearest_university,
        available_spots=listing.available_spots,
        preferred_gender=listing.preferred_gender,
        smoking_allowed=listing.smoking_allowed,
        alcohol_allowed=listing.alcohol_allowed,
        religion_preference=listing.religion_preference,
        has_wifi=listing.has_wifi,
        is_furnished=listing.is_furnished,
        is_active=listing.is_active
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing


# Elanları filtr/axtarışla görmək
@router.get("/", response_model=List[schemas.ListingResponse])
def get_listings(
    skip: int = 0,
    limit: int = Query(default=10, le=100),
    nearest_university: Optional[UniversityEnum] = None,
    district: Optional[DistrictEnum] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    preferred_gender: Optional[GenderEnum] = None,
    smoking_allowed: Optional[bool] = None,
    alcohol_allowed: Optional[bool] = None,
    religion_preference: Optional[ReligionEnum] = None,
    has_wifi: Optional[bool] = None,
    is_furnished: Optional[bool] = None,
    min_available_spots: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Listing).filter(models.Listing.is_active == True)

    if nearest_university:
        query = query.filter(models.Listing.nearest_university == nearest_university.value)

    if district:
        query = query.filter(models.Listing.district == district.value)

    if min_price is not None:
        query = query.filter(models.Listing.price_per_person >= min_price)

    if max_price is not None:
        query = query.filter(models.Listing.price_per_person <= max_price)

    if preferred_gender:
        query = query.filter(models.Listing.preferred_gender == preferred_gender.value)

    if smoking_allowed is not None:
        query = query.filter(models.Listing.smoking_allowed == smoking_allowed)

    if alcohol_allowed is not None:
        query = query.filter(models.Listing.alcohol_allowed == alcohol_allowed)

    if religion_preference:
        query = query.filter(models.Listing.religion_preference == religion_preference.value)

    if has_wifi is not None:
        query = query.filter(models.Listing.has_wifi == has_wifi)

    if is_furnished is not None:
        query = query.filter(models.Listing.is_furnished == is_furnished)

    if min_available_spots is not None:
        query = query.filter(models.Listing.available_spots >= min_available_spots)

    listings = query.offset(skip).limit(limit).all()
    return listings