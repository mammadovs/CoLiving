from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from typing import List
from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

# Mesaj göndərmək
@router.post(
    "/",
    response_model=schemas.MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message",
    description="Sends a message from the logged-in user to another user. Cannot send a message to yourself."
)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )

    if message.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send a message to yourself"
        )

    new_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


# İki istifadəçi arasındakı bütün mesajları görmək (conversation history)
@router.get(
    "/conversation/{other_user_id}",
    response_model=List[schemas.MessageResponse],
    summary="Get conversation history",
    description="Returns the full message history between the logged-in user and the specified user, ordered chronologically. Marks any unread incoming messages as read."
)
def get_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = db.query(models.Message).filter(
        or_(
            and_(models.Message.sender_id == current_user.id, models.Message.receiver_id == other_user_id),
            and_(models.Message.sender_id == other_user_id, models.Message.receiver_id == current_user.id)
        )
    ).order_by(models.Message.created_at.asc()).all()

    # Oxunmamış mesajları "oxundu" kimi işarələyirik (qarşı tərəfdən gələnləri)
    db.query(models.Message).filter(
        models.Message.sender_id == other_user_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages


# Bütün söhbətlərin siyahısı (kim ilə danışmışam)
@router.get(
    "/conversations",
    response_model=List[schemas.ConversationSummary],
    summary="List all conversations",
    description="Returns an inbox-style summary of every conversation the logged-in user is part of, including the other participant, last message preview, timestamp, and unread count."
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Bu istifadəçinin iştirak etdiyi bütün mesajları tapırıq
    all_messages = db.query(models.Message).filter(
        or_(
            models.Message.sender_id == current_user.id,
            models.Message.receiver_id == current_user.id
        )
    ).order_by(models.Message.created_at.desc()).all()

    conversations = {}
    for msg in all_messages:
        other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id

        if other_id not in conversations:
            other_user = db.query(models.User).filter(models.User.id == other_id).first()
            unread = db.query(models.Message).filter(
                models.Message.sender_id == other_id,
                models.Message.receiver_id == current_user.id,
                models.Message.is_read == False
            ).count()

            conversations[other_id] = schemas.ConversationSummary(
                other_user_id=other_id,
                other_user_name=other_user.full_name if other_user else "Unknown",
                last_message=msg.content,
                last_message_at=msg.created_at,
                unread_count=unread
            )

    return list(conversations.values())