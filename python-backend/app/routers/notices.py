from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from app.schemas.schemas import NoticeCreate, NoticeUpdate, NoticeResponse, PaginationParams
from app.models.models import User
from app.core.database import get_collection
from app.core.security import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=dict)
async def get_notices(
    type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    is_pinned: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get active notices"""
    try:
        notices_collection = get_collection("notices")
        
        query = {
            "is_active": True,
            "start_date": {"$lte": datetime.utcnow()},
            "$or": [
                {"end_date": None},
                {"end_date": {"$gte": datetime.utcnow()}}
            ],
            "$or": [
                {"target_audience": "all"},
                {"target_audience": "users"}
            ]
        }
        
        if type:
            query["type"] = type
        if priority:
            query["priority"] = priority
        if is_pinned is not None:
            query["is_pinned"] = is_pinned
        
        skip = (page - 1) * limit
        
        notices_cursor = notices_collection.find(query).sort("priority", -1).sort("created_at", -1).skip(skip).limit(limit)
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
        logger.error(f"Get notices error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching notices"
        )

@router.get("/{notice_id}", response_model=dict)
async def get_notice(
    notice_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get single notice"""
    try:
        if not ObjectId.is_valid(notice_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notice ID"
            )
        
        notices_collection = get_collection("notices")
        
        notice = await notices_collection.find_one({
            "_id": ObjectId(notice_id),
            "is_active": True
        })
        
        if not notice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notice not found"
            )
        
        # Add view
        await notices_collection.update_one(
            {"_id": ObjectId(notice_id)},
            {
                "$addToSet": {
                    "views": {
                        "user_id": current_user.id,
                        "viewed_at": datetime.utcnow()
                    }
                }
            }
        )
        
        notice["id"] = str(notice["_id"])
        notice["created_by"] = str(notice["created_by"])
        notice["view_count"] = len(notice.get("views", []))
        
        return {
            "success": True,
            "notice": notice
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get notice error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error while fetching notice"
        )
