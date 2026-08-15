from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils import verify_password
from app.oauth2 import create_access_token

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # İstifadəçini email (username sahəsi kimi gəlir) vasitəsilə axtarırıq
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yanlış e-poçt və ya şifrə"
        )
        
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yanlış e-poçt və ya şifrə"
        )
        
    # Token yaradırıq
    access_token = create_access_token(data={"user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}