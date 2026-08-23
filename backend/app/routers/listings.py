# routers/listings.py
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user
from app.models import GenderEnum, ReligionEnum, UniversityEnum, DistrictEnum
import os
import shutil
import uuid
from fastapi import UploadFile, File

router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)
UPLOAD_DIR = "static/listing_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Elana şəkil əlavə etmək (yalnız sahibi)
@router.post(
    "/{listing_id}/images",
    response_model=schemas.ListingImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an image for a listing",
    description="Uploads an image file and attaches it to the specified listing. Only the listing's owner can add images."
)
def upload_listing_image(
    listing_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    if listing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add images to this listing")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/static/listing_images/{unique_filename}"

    new_image = models.ListingImage(listing_id=listing_id, image_url=image_url)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image

# Elan yaratmaq (unchanged)
@router.post(
    "/",
    response_model=schemas.ListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new listing",
    description="Creates a new roommate/apartment listing owned by the logged-in user. Requires authentication."
)
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
        phone_number=listing.phone_number,
        preferred_gender=listing.preferred_gender,
        smoking_allowed=listing.smoking_allowed,
        alcohol_allowed=listing.alcohol_allowed,
        religion_preference=listing.religion_preference,
        has_wifi=listing.has_wifi,
        is_furnished=listing.is_furnished,
        is_active=listing.is_active
    )
    
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
@router.get(
    "/",
    response_model=List[schemas.ListingResponse],
    summary="Search and filter listings",
    description="Returns active listings, optionally filtered by university, district, price range, gender preference, smoking/alcohol allowed, religion preference, wifi, furnished status, and minimum available spots. Supports pagination (max 100 per page)."
)
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

# Bir elanı ID ilə görmək
@router.get(
    "/{listing_id}",
    response_model=schemas.ListingResponse,
    summary="Get a single listing",
    description="Returns full details of one listing by its ID. Publicly accessible, no authentication required."
)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    return listing


# Elanı yeniləmək (yalnız sahibi edə bilər)
@router.put(
    "/{listing_id}",
    response_model=schemas.ListingResponse,
    summary="Update a listing",
    description="Replaces all fields of an existing listing. Only the listing's owner can perform this action; other authenticated users will receive a 403 error."
)
def update_listing(
    listing_id: int,
    updated_listing: schemas.ListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing_query = db.query(models.Listing).filter(models.Listing.id == listing_id)
    listing = listing_query.first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this listing"
        )

    listing_query.update(updated_listing.model_dump(), synchronize_session=False)
    db.commit()

    return listing_query.first()


# Elanı silmək (yalnız sahibi edə bilər)
@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a listing",
    description="Permanently deletes a listing. Only the listing's owner can perform this action; other authenticated users will receive a 403 error."
)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing_query = db.query(models.Listing).filter(models.Listing.id == listing_id)
    listing = listing_query.first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this listing"
        )

    listing_query.delete(synchronize_session=False)
    db.commit()