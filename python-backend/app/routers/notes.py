from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse, PaginationParams
from app.models.models import User
from app.core.database import get_collection
from app.core.security import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=dict)
async def get_notes(
    subject: Optional[str] = Query(None),
    is_pinned: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get all notes for authenticated user"""
    try:
        notes_collection = get_collection("notes")
        
        query = {"user_id": current_user.id}
        
        if subject:
            query["subject"] = {"$regex": subject, "$options": "i"}
        if is_pinned is not None:
            query["is_pinned"] = is_pinned
        
        skip = (page - 1) * limit
        
        notes_cursor = notes_collection.find(query).sort("is_pinned", -1).sort("updated_at", -1).skip(skip).limit(limit)
        notes = await notes_cursor.to_list(length=limit)
        
        total = await notes_collection.count_documents(query)
        
        for note in notes:
            note["id"] = str(note["_id"])
            note["user_id"] = str(note["user_id"])
        
        return {
            "success": True,
            "notes": notes,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get notes error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching notes"
        )

@router.post("/", response_model=dict)
async def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new note"""
    try:
        notes_collection = get_collection("notes")
        
        note_dict = note_data.dict()
        note_dict["user_id"] = current_user.id
        note_dict["word_count"] = len(note_data.content.split())
        note_dict["last_modified"] = datetime.utcnow()
        note_dict["created_at"] = datetime.utcnow()
        note_dict["updated_at"] = datetime.utcnow()
        
        result = await notes_collection.insert_one(note_dict)
        
        created_note = await notes_collection.find_one({"_id": result.inserted_id})
        created_note["id"] = str(created_note["_id"])
        created_note["user_id"] = str(created_note["user_id"])
        
        return {
            "success": True,
            "message": "Note created successfully",
            "note": created_note
        }
        
    except Exception as e:
        logger.error(f"Create note error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating note"
        )

@router.put("/{note_id}", response_model=dict)
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update note"""
    try:
        if not ObjectId.is_valid(note_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid note ID"
            )
        
        notes_collection = get_collection("notes")
        
        existing_note = await notes_collection.find_one({
            "_id": ObjectId(note_id),
            "user_id": current_user.id
        })
        
        if not existing_note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        update_data = {k: v for k, v in note_update.dict().items() if v is not None}
        
        if "content" in update_data:
            update_data["word_count"] = len(update_data["content"].split())
        
        update_data["last_modified"] = datetime.utcnow()
        update_data["updated_at"] = datetime.utcnow()
        
        await notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": update_data}
        )
        
        updated_note = await notes_collection.find_one({"_id": ObjectId(note_id)})
        updated_note["id"] = str(updated_note["_id"])
        updated_note["user_id"] = str(updated_note["user_id"])
        
        return {
            "success": True,
            "message": "Note updated successfully",
            "note": updated_note
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update note error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while updating note"
        )

@router.delete("/{note_id}", response_model=dict)
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete note"""
    try:
        if not ObjectId.is_valid(note_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid note ID"
            )
        
        notes_collection = get_collection("notes")
        
        result = await notes_collection.delete_one({
            "_id": ObjectId(note_id),
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        return {
            "success": True,
            "message": "Note deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete note error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while deleting note"
        )
