from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils import hash_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
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
        profession=user.profession
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user