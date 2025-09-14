from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timedelta
from typing import Optional, List
from app.schemas.schemas import (
    TaskCreate, TaskUpdate, TaskResponse, TaskStats, PaginationParams
)
from app.models.models import Task, User
from app.core.database import get_collection
from app.core.security import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=dict)
async def get_tasks(
    status: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for authenticated user"""
    try:
        tasks_collection = get_collection("tasks")
        
        # Build query
        query = {"user_id": current_user.id}
        
        if status and status != "all":
            query["status"] = status
        if subject:
            query["subject"] = {"$regex": subject, "$options": "i"}
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get tasks
        tasks_cursor = tasks_collection.find(query).sort("due_date", 1).skip(skip).limit(limit)
        tasks = await tasks_cursor.to_list(length=limit)
        
        # Get total count
        total = await tasks_collection.count_documents(query)
        
        # Convert ObjectId to string
        for task in tasks:
            task["id"] = str(task["_id"])
            task["user_id"] = str(task["user_id"])
        
        return {
            "success": True,
            "tasks": tasks,
            "pagination": {
                "current": page,
                "pages": (total + limit - 1) // limit,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Get tasks error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching tasks"
        )

@router.get("/{task_id}", response_model=dict)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get single task"""
    try:
        if not ObjectId.is_valid(task_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID"
            )
        
        tasks_collection = get_collection("tasks")
        task = await tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": current_user.id
        })
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task["id"] = str(task["_id"])
        task["user_id"] = str(task["user_id"])
        
        return {
            "success": True,
            "task": task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching task"
        )

@router.post("/", response_model=dict)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new task"""
    try:
        tasks_collection = get_collection("tasks")
        
        task_dict = task_data.dict()
        task_dict["user_id"] = current_user.id
        task_dict["created_at"] = datetime.utcnow()
        task_dict["updated_at"] = datetime.utcnow()
        
        result = await tasks_collection.insert_one(task_dict)
        
        # Get created task
        created_task = await tasks_collection.find_one({"_id": result.inserted_id})
        created_task["id"] = str(created_task["_id"])
        created_task["user_id"] = str(created_task["user_id"])
        
        return {
            "success": True,
            "message": "Task created successfully",
            "task": created_task
        }
        
    except Exception as e:
        logger.error(f"Create task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while creating task"
        )

@router.put("/{task_id}", response_model=dict)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update task"""
    try:
        if not ObjectId.is_valid(task_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID"
            )
        
        tasks_collection = get_collection("tasks")
        
        # Check if task exists
        existing_task = await tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": current_user.id
        })
        
        if not existing_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Prepare update data
        update_data = {k: v for k, v in task_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update task
        await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
        # Get updated task
        updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
        updated_task["id"] = str(updated_task["_id"])
        updated_task["user_id"] = str(updated_task["user_id"])
        
        return {
            "success": True,
            "message": "Task updated successfully",
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while updating task"
        )

@router.delete("/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete task"""
    try:
        if not ObjectId.is_valid(task_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID"
            )
        
        tasks_collection = get_collection("tasks")
        
        result = await tasks_collection.delete_one({
            "_id": ObjectId(task_id),
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return {
            "success": True,
            "message": "Task deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while deleting task"
        )

@router.post("/{task_id}/start", response_model=dict)
async def start_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Start task session"""
    try:
        if not ObjectId.is_valid(task_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID"
            )
        
        tasks_collection = get_collection("tasks")
        sessions_collection = get_collection("sessions")
        
        # Get task
        task = await tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": current_user.id
        })
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        if task["status"] == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start a completed task"
            )
        
        # Update task status
        await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$set": {
                    "status": "in-progress",
                    "start_time": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create session
        session_data = {
            "user_id": current_user.id,
            "task_id": ObjectId(task_id),
            "subject": task["subject"],
            "session_id": str(ObjectId()),
            "start_time": datetime.utcnow(),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        session_result = await sessions_collection.insert_one(session_data)
        
        return {
            "success": True,
            "message": "Task started successfully",
            "session": {
                "id": str(session_result.inserted_id),
                "session_id": session_data["session_id"],
                "start_time": session_data["start_time"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Start task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while starting task"
        )

@router.post("/{task_id}/complete", response_model=dict)
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark task as completed"""
    try:
        if not ObjectId.is_valid(task_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task ID"
            )
        
        tasks_collection = get_collection("tasks")
        
        # Get task
        task = await tasks_collection.find_one({
            "_id": ObjectId(task_id),
            "user_id": current_user.id
        })
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        if task["status"] == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task is already completed"
            )
        
        # Update task
        update_data = {
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if task.get("start_time") and not task.get("end_time"):
            update_data["end_time"] = datetime.utcnow()
        
        await tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Task completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Complete task error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while completing task"
        )

@router.get("/stats/overview", response_model=dict)
async def get_task_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get task statistics"""
    try:
        tasks_collection = get_collection("tasks")
        
        # Build query
        query = {"user_id": current_user.id}
        
        if start_date and end_date:
            query["created_at"] = {
                "$gte": datetime.fromisoformat(start_date),
                "$lte": datetime.fromisoformat(end_date)
            }
        
        # Aggregate statistics
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "completed": {
                        "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                    },
                    "pending": {
                        "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                    },
                    "in_progress": {
                        "$sum": {"$cond": [{"$eq": ["$status", "in-progress"]}, 1, 0]}
                    },
                    "total_estimated_time": {"$sum": "$estimated_time"},
                    "total_actual_time": {"$sum": "$actual_time"}
                }
            }
        ]
        
        result = await tasks_collection.aggregate(pipeline).to_list(1)
        
        stats = result[0] if result else {
            "total": 0,
            "completed": 0,
            "pending": 0,
            "in_progress": 0,
            "total_estimated_time": 0,
            "total_actual_time": 0
        }
        
        # Remove _id field
        stats.pop("_id", None)
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Get stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching statistics"
        )
