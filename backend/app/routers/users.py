from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils import hash_password
from app.oauth2 import get_current_user
from app.matching import calculate_compatibility

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get(
    "/{user_id}/compatibility",
    response_model=schemas.CompatibilityScoreResponse,
    summary="Get roommate compatibility score",
    description="Calculates a compatibility percentage between the logged-in user and the specified user, based on shared lifestyle preferences (sleep schedule, cleanliness, religion, budget, and more). Returns an overall score plus a per-field breakdown."
)
def get_compatibility_score(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot calculate compatibility with yourself"
        )

    result = calculate_compatibility(current_user, target_user)

    return {
        "user_id": current_user.id,
        "compared_with_user_id": target_user.id,
        "compatibility_score": result["compatibility_score"],
        "breakdown": result["breakdown"]
    }

@router.post(
    "/",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account. If is_student is true, the email must belong to a recognized university domain (ending in edu.az). Optional lifestyle/profile fields (budget, sleep schedule, cleanliness, religion, etc.) can be included to enable compatibility scoring."
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # E-poçt yoxlanışı
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-poçt ünvanı ilə artıq istifadəçi qeydiyyatdan keçib."
        )

    hashed_pwd = hash_password(user.password)
    
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        is_student=user.is_student,
        university=user.university,
        profession=user.profession,
        budget=user.budget,
        sleep_schedule=user.sleep_schedule,
        cleanliness_level=user.cleanliness_level,
        religion=user.religion,
        noise_tolerance=user.noise_tolerance,
        smoking_habit=user.smoking_habit,
        drinks_alcohol=user.drinks_alcohol,
        pet_friendly=user.pet_friendly,
        guest_frequency=user.guest_frequency,
        work_or_study_schedule=user.work_or_study_schedule,
        personality_type=user.personality_type
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user