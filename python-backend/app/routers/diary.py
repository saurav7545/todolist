from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import DiaryCreate, DiaryUpdate, DiaryResponse, PaginationParams
from app.models.models import User
from app.core.database import get_collection
from app.core.security import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=dict)
async def get_diary_entries(
    mood: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get diary entries for authenticated user"""
    try:
        diary_collection = get_collection("diary")
        
        query = {"user_id": current_user.id}
        
        if mood:
            query["mood"] = mood
        
        if start_date and end_date:
            query["date"] = {
                "$gte": datetime.fromisoformat(start_date),
                "$lte": datetime.fromisoformat(end_date)
            }
        
        skip = (page - 1) * limit
        
        entries_cursor = diary_collection.find(query).sort("date", -1).skip(skip).limit(limit)
        entries = await entries_cursor.to_list(length=limit)
        
        total = await diary_collection.count_documents(query)
        
        for entry in entries:
            entry["id"] = str(entry["_id"])
            entry["user_id"] = str(entry["user_id"])
        
        return {
            "success": True,
            "entries": entries,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get diary entries error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching diary entries"
        )

@router.post("/", response_model=dict)
async def create_diary_entry(
    diary_data: DiaryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new diary entry"""
    try:
        diary_collection = get_collection("diary")
        
        diary_dict = diary_data.dict()
        diary_dict["user_id"] = current_user.id
        diary_dict["word_count"] = len(diary_data.content.split())
        diary_dict["reading_time"] = max(1, diary_dict["word_count"] // 200)  # 200 words per minute
        diary_dict["last_modified"] = datetime.utcnow()
        diary_dict["created_at"] = datetime.utcnow()
        diary_dict["updated_at"] = datetime.utcnow()
        
        if not diary_dict.get("date"):
            diary_dict["date"] = datetime.utcnow()
        
        result = await diary_collection.insert_one(diary_dict)
        
        created_entry = await diary_collection.find_one({"_id": result.inserted_id})
        created_entry["id"] = str(created_entry["_id"])
        created_entry["user_id"] = str(created_entry["user_id"])
        
        return {
            "success": True,
            "message": "Diary entry created successfully",
            "entry": created_entry
        }
        
    except Exception as e:
        logger.error(f"Create diary entry error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating diary entry"
        )

@router.put("/{entry_id}", response_model=dict)
async def update_diary_entry(
    entry_id: str,
    entry_update: DiaryUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update diary entry"""
    try:
        if not ObjectId.is_valid(entry_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid entry ID"
            )
        
        diary_collection = get_collection("diary")
        
        existing_entry = await diary_collection.find_one({
            "_id": ObjectId(entry_id),
            "user_id": current_user.id
        })
        
        if not existing_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diary entry not found"
            )
        
        update_data = {k: v for k, v in entry_update.dict().items() if v is not None}
        
        if "content" in update_data:
            update_data["word_count"] = len(update_data["content"].split())
            update_data["reading_time"] = max(1, update_data["word_count"] // 200)
        
        update_data["last_modified"] = datetime.utcnow()
        update_data["updated_at"] = datetime.utcnow()
        
        await diary_collection.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": update_data}
        )
        
        updated_entry = await diary_collection.find_one({"_id": ObjectId(entry_id)})
        updated_entry["id"] = str(updated_entry["_id"])
        updated_entry["user_id"] = str(updated_entry["user_id"])
        
        return {
            "success": True,
            "message": "Diary entry updated successfully",
            "entry": updated_entry
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update diary entry error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while updating diary entry"
        )

@router.delete("/{entry_id}", response_model=dict)
async def delete_diary_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete diary entry"""
    try:
        if not ObjectId.is_valid(entry_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid entry ID"
            )
        
        diary_collection = get_collection("diary")
        
        result = await diary_collection.delete_one({
            "_id": ObjectId(entry_id),
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diary entry not found"
            )
        
        return {
            "success": True,
            "message": "Diary entry deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete diary entry error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while deleting diary entry"
        )
