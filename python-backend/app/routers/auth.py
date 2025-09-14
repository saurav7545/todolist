from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token, PasswordChange, 
    UserUpdate, BaseResponse
)
from app.models.models import User
from app.core.database import get_collection
from app.core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, verify_token, get_current_user
)
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
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
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        
        result = await users_collection.insert_one(user_dict)
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(result.inserted_id)})
        refresh_token = create_refresh_token(data={"sub": str(result.inserted_id)})
        
        # Get created user
        created_user = await users_collection.find_one({"_id": result.inserted_id})
        
        return {
            "success": True,
            "message": "User registered successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(created_user["_id"]),
                "username": created_user["username"],
                "email": created_user["email"],
                "first_name": created_user["first_name"],
                "last_name": created_user["last_name"],
                "role": created_user["role"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error during registration"
        )

@router.post("/login", response_model=dict)
async def login_user(login_data: UserLogin):
    """Login user"""
    try:
        users_collection = get_collection("users")
        
        # Find user by email
        user_data = await users_collection.find_one({"email": login_data.email})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Verify password
        if not verify_password(login_data.password, user_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await users_collection.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(user_data["_id"])})
        refresh_token = create_refresh_token(data={"sub": str(user_data["_id"])})
        
        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user_data["_id"]),
                "username": user_data["username"],
                "email": user_data["email"],
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "role": user_data["role"],
                "preferences": user_data.get("preferences", {}),
                "study_stats": user_data.get("study_stats", {})
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error during login"
        )

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    try:
        return {
            "success": True,
            "user": {
                "id": str(current_user.id),
                "username": current_user.username,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "role": current_user.role,
                "preferences": current_user.preferences,
                "study_stats": current_user.study_stats,
                "last_login": current_user.last_login,
                "created_at": current_user.created_at
            }
        }
    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )

@router.put("/profile", response_model=dict)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        users_collection = get_collection("users")
        
        update_data = {}
        if user_update.first_name is not None:
            update_data["first_name"] = user_update.first_name
        if user_update.last_name is not None:
            update_data["last_name"] = user_update.last_name
        if user_update.preferences is not None:
            update_data["preferences"] = user_update.preferences.dict()
        
        update_data["updated_at"] = datetime.utcnow()
        
        await users_collection.update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await users_collection.find_one({"_id": current_user.id})
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": str(updated_user["_id"]),
                "username": updated_user["username"],
                "email": updated_user["email"],
                "first_name": updated_user["first_name"],
                "last_name": updated_user["last_name"],
                "preferences": updated_user.get("preferences", {})
            }
        }
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error during profile update"
        )

@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    try:
        users_collection = get_collection("users")
        
        # Get user with password
        user_data = await users_collection.find_one({"_id": current_user.id})
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not verify_password(password_data.current_password, user_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        new_password_hash = get_password_hash(password_data.new_password)
        await users_collection.update_one(
            {"_id": current_user.id},
            {
                "$set": {
                    "password": new_password_hash,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error during password change"
        )

@router.post("/refresh-token", response_model=dict)
async def refresh_access_token(credentials: HTTPAuthorizationCredentials = Depends()):
    """Refresh access token"""
    try:
        # Verify refresh token
        payload = verify_token(credentials.credentials)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Generate new access token
        access_token = create_access_token(data={"sub": user_id})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refresh token error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error during token refresh"
        )
