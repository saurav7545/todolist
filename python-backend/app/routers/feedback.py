from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import FeedbackCreate, FeedbackUpdate, FeedbackResponse, PaginationParams
from app.models.models import User
from app.core.database import get_collection
from app.core.security import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=dict)
async def get_feedback(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get feedback for authenticated user"""
    try:
        feedback_collection = get_collection("feedback")
        
        query = {"user_id": current_user.id}
        
        if type:
            query["type"] = type
        if status:
            query["status"] = status
        
        skip = (page - 1) * limit
        
        feedback_cursor = feedback_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        feedback = await feedback_cursor.to_list(length=limit)
        
        total = await feedback_collection.count_documents(query)
        
        for item in feedback:
            item["id"] = str(item["_id"])
            item["user_id"] = str(item["user_id"])
        
        return {
            "success": True,
            "feedback": feedback,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching feedback"
        )

@router.post("/", response_model=dict)
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new feedback"""
    try:
        feedback_collection = get_collection("feedback")
        
        feedback_dict = feedback_data.dict()
        feedback_dict["user_id"] = current_user.id
        feedback_dict["created_at"] = datetime.utcnow()
        feedback_dict["updated_at"] = datetime.utcnow()
        
        result = await feedback_collection.insert_one(feedback_dict)
        
        created_feedback = await feedback_collection.find_one({"_id": result.inserted_id})
        created_feedback["id"] = str(created_feedback["_id"])
        created_feedback["user_id"] = str(created_feedback["user_id"])
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "feedback": created_feedback
        }
        
    except Exception as e:
        logger.error(f"Create feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating feedback"
        )

@router.put("/{feedback_id}", response_model=dict)
async def update_feedback(
    feedback_id: str,
    feedback_update: FeedbackUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update feedback"""
    try:
        if not ObjectId.is_valid(feedback_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid feedback ID"
            )
        
        feedback_collection = get_collection("feedback")
        
        existing_feedback = await feedback_collection.find_one({
            "_id": ObjectId(feedback_id),
            "user_id": current_user.id
        })
        
        if not existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        update_data = {k: v for k, v in feedback_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await feedback_collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": update_data}
        )
        
        updated_feedback = await feedback_collection.find_one({"_id": ObjectId(feedback_id)})
        updated_feedback["id"] = str(updated_feedback["_id"])
        updated_feedback["user_id"] = str(updated_feedback["user_id"])
        
        return {
            "success": True,
            "message": "Feedback updated successfully",
            "feedback": updated_feedback
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while updating feedback"
        )

@router.delete("/{feedback_id}", response_model=dict)
async def delete_feedback(
    feedback_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete feedback"""
    try:
        if not ObjectId.is_valid(feedback_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid feedback ID"
            )
        
        feedback_collection = get_collection("feedback")
        
        result = await feedback_collection.delete_one({
            "_id": ObjectId(feedback_id),
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        return {
            "success": True,
            "message": "Feedback deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while deleting feedback"
        )
