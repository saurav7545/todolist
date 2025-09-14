from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import (
    NoticeCreate, NoticeUpdate, NoticeResponse, FeedbackUpdate,
    PaginationParams, UserCreate
)
from app.models.models import User
from app.core.database import get_collection
from app.core.security import get_current_admin_user, get_password_hash
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Notice Management
@router.get("/notices", response_model=dict)
async def get_all_notices(
    type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all notices (admin only)"""
    try:
        notices_collection = get_collection("notices")
        
        query = {}
        
        if type:
            query["type"] = type
        if priority:
            query["priority"] = priority
        if is_active is not None:
            query["is_active"] = is_active
        
        skip = (page - 1) * limit
        
        notices_cursor = notices_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        notices = await notices_cursor.to_list(length=limit)
        
        total = await notices_collection.count_documents(query)
        
        for notice in notices:
            notice["id"] = str(notice["_id"])
            notice["created_by"] = str(notice["created_by"])
            notice["view_count"] = len(notice.get("views", []))
        
        return {
            "success": True,
            "notices": notices,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get all notices error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching notices"
        )

@router.post("/notices", response_model=dict)
async def create_notice(
    notice_data: NoticeCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Create new notice (admin only)"""
    try:
        notices_collection = get_collection("notices")
        
        notice_dict = notice_data.dict()
        notice_dict["created_by"] = current_user.id
        notice_dict["created_at"] = datetime.utcnow()
        notice_dict["updated_at"] = datetime.utcnow()
        
        result = await notices_collection.insert_one(notice_dict)
        
        created_notice = await notices_collection.find_one({"_id": result.inserted_id})
        created_notice["id"] = str(created_notice["_id"])
        created_notice["created_by"] = str(created_notice["created_by"])
        
        return {
            "success": True,
            "message": "Notice created successfully",
            "notice": created_notice
        }
        
    except Exception as e:
        logger.error(f"Create notice error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating notice"
        )

@router.put("/notices/{notice_id}", response_model=dict)
async def update_notice(
    notice_id: str,
    notice_update: NoticeUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    """Update notice (admin only)"""
    try:
        if not ObjectId.is_valid(notice_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notice ID"
            )
        
        notices_collection = get_collection("notices")
        
        existing_notice = await notices_collection.find_one({"_id": ObjectId(notice_id)})
        
        if not existing_notice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notice not found"
            )
        
        update_data = {k: v for k, v in notice_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await notices_collection.update_one(
            {"_id": ObjectId(notice_id)},
            {"$set": update_data}
        )
        
        updated_notice = await notices_collection.find_one({"_id": ObjectId(notice_id)})
        updated_notice["id"] = str(updated_notice["_id"])
        updated_notice["created_by"] = str(updated_notice["created_by"])
        
        return {
            "success": True,
            "message": "Notice updated successfully",
            "notice": updated_notice
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update notice error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while updating notice"
        )

@router.delete("/notices/{notice_id}", response_model=dict)
async def delete_notice(
    notice_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete notice (admin only)"""
    try:
        if not ObjectId.is_valid(notice_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notice ID"
            )
        
        notices_collection = get_collection("notices")
        
        result = await notices_collection.delete_one({"_id": ObjectId(notice_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notice not found"
            )
        
        return {
            "success": True,
            "message": "Notice deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete notice error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while deleting notice"
        )

# Feedback Management
@router.get("/feedback", response_model=dict)
async def get_all_feedback(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all feedback (admin only)"""
    try:
        feedback_collection = get_collection("feedback")
        
        query = {}
        
        if type:
            query["type"] = type
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        
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
        logger.error(f"Get all feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching feedback"
        )

@router.put("/feedback/{feedback_id}/respond", response_model=dict)
async def respond_to_feedback(
    feedback_id: str,
    response_data: dict,
    current_user: User = Depends(get_current_admin_user)
):
    """Respond to feedback (admin only)"""
    try:
        if not ObjectId.is_valid(feedback_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid feedback ID"
            )
        
        feedback_collection = get_collection("feedback")
        
        existing_feedback = await feedback_collection.find_one({"_id": ObjectId(feedback_id)})
        
        if not existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        admin_response = {
            "message": response_data.get("message", ""),
            "responded_by": current_user.id,
            "responded_at": datetime.utcnow()
        }
        
        update_data = {
            "admin_response": admin_response,
            "status": response_data.get("status", "in-progress"),
            "updated_at": datetime.utcnow()
        }
        
        if response_data.get("status") == "resolved":
            update_data["resolved_at"] = datetime.utcnow()
        
        await feedback_collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Response added successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Respond to feedback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while responding to feedback"
        )

# User Management
@router.get("/users", response_model=dict)
async def get_all_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users (admin only)"""
    try:
        users_collection = get_collection("users")
        
        query = {}
        
        if role:
            query["role"] = role
        if is_active is not None:
            query["is_active"] = is_active
        
        skip = (page - 1) * limit
        
        users_cursor = users_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        users = await users_cursor.to_list(length=limit)
        
        total = await users_collection.count_documents(query)
        
        for user in users:
            user["id"] = str(user["_id"])
            # Remove password from response
            user.pop("password", None)
        
        return {
            "success": True,
            "users": users,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get all users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching users"
        )

@router.post("/users", response_model=dict)
async def create_admin_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Create new user (admin only)"""
    try:
        users_collection = get_collection("users")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            if existing_user["email"] == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Create new user
        user_dict = user_data.dict()
        user_dict["password"] = get_password_hash(user_data.password)
        user_dict["role"] = "admin"  # Admin can create other admins
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        
        result = await users_collection.insert_one(user_dict)
        
        created_user = await users_collection.find_one({"_id": result.inserted_id})
        created_user["id"] = str(created_user["_id"])
        created_user.pop("password", None)
        
        return {
            "success": True,
            "message": "User created successfully",
            "user": created_user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating user"
        )

# Statistics
@router.get("/stats", response_model=dict)
async def get_admin_stats(current_user: User = Depends(get_current_admin_user)):
    """Get admin statistics"""
    try:
        users_collection = get_collection("users")
        tasks_collection = get_collection("tasks")
        notes_collection = get_collection("notes")
        diary_collection = get_collection("diary")
        feedback_collection = get_collection("feedback")
        
        # Get counts
        total_users = await users_collection.count_documents({})
        total_tasks = await tasks_collection.count_documents({})
        total_notes = await notes_collection.count_documents({})
        total_diary_entries = await diary_collection.count_documents({})
        total_feedback = await feedback_collection.count_documents({})
        pending_feedback = await feedback_collection.count_documents({"status": "open"})
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_tasks": total_tasks,
                "total_notes": total_notes,
                "total_diary_entries": total_diary_entries,
                "total_feedback": total_feedback,
                "pending_feedback": pending_feedback
            }
        }
        
    except Exception as e:
        logger.error(f"Get admin stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching statistics"
        )
