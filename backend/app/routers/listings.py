from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)

# Elan yaratmaq
@router.post("/", response_model=schemas.ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: schemas.ListingCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user) # Tokeni yoxlayıb istifadəçini tapır
):
    new_listing = models.Listing(
        user_id=current_user.id, # Avtomatik olaraq token sahibi olan istifadəçinin ID-si yazılır
        title=listing.title,
        description=listing.description,
        price_per_person=listing.price_per_person,
        address=listing.address,
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


# Bütün elanları görmək
@router.get("/", response_model=List[schemas.ListingResponse])
def get_listings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    listings = db.query(models.Listing).offset(skip).limit(limit).all()
    return listings