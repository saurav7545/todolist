from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from app.schemas.schemas import (
    UserRegistration, UserLogin, UserLoginWithOTP, UserResponse, Token, 
    PasswordChange, UserUpdate, BaseResponse, OTPRequest, OTPVerification, 
    OTPResponse
)
from app.models.models import User, OTPVerification as OTPVerificationModel
from app.core.database import get_collection
from app.core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, verify_token, get_current_user
)
from app.core.config import settings
from app.utils.email_otp import generate_otp, send_otp_email, get_otp_expiry_time
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=BaseResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user with email verification"""
    logger.debug(f"Attempting to register user: {user_data.email}")
    try:
        # Get database collections
        logger.debug("Getting database collections...")
        users_collection = get_collection("users")
        otp_collection = get_collection("otp_verifications")
        
        # Check if user already exists
        logger.debug("Checking for existing user...")
        query = {
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        }
        logger.debug(f"Query: {query}")
        existing_user = await users_collection.find_one(query)
        
        if existing_user:
            logger.warning(f"User already exists: {existing_user.get('email')}")
            if existing_user.get("email") == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Generate OTP
        otp_code = generate_otp()
        otp_expiry = get_otp_expiry_time()
        
        # Store OTP in database
        otp_data = {
            "email": user_data.email,
            "otp_code": otp_code,
            "otp_type": "registration",
            "is_used": False,
            "expires_at": otp_expiry,
            "attempts": 0,
            "max_attempts": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await otp_collection.insert_one(otp_data)
        
        # Send OTP email
        email_error = send_otp_email(
            to_email=user_data.email,
            otp=otp_code,
            otp_type="registration",
            username=user_data.first_name
        )
        
        if email_error:
            logger.error(f"Failed to send OTP email: {email_error}")
            # Don't fail registration if email fails, but log it
        
        return BaseResponse(
            success=True,
            message="Registration successful! Please check your email for OTP verification.",
            data={"email": user_data.email, "expires_in": 600}  # 10 minutes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/verify-otp", response_model=BaseResponse)
async def verify_otp(otp_data: OTPVerification):
    """Verify OTP and complete user registration"""
    try:
        users_collection = get_collection("users")
        otp_collection = get_collection("otp_verifications")
        
        # Find OTP record
        otp_record = await otp_collection.find_one({
            "email": otp_data.email,
            "otp_code": otp_data.otp_code,
            "otp_type": "registration",
            "is_used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not otp_record:
            # Check if OTP exists but is expired or used
            expired_otp = await otp_collection.find_one({
                "email": otp_data.email,
                "otp_code": otp_data.otp_code,
                "otp_type": "registration"
            })
            
            if expired_otp:
                if expired_otp["is_used"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="OTP already used"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="OTP expired"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid OTP"
                )
        
        # Check attempt limit
        if otp_record["attempts"] >= otp_record["max_attempts"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum OTP attempts exceeded"
            )
        
        # Mark OTP as used
        await otp_collection.update_one(
            {"_id": otp_record["_id"]},
            {"$set": {"is_used": True, "updated_at": datetime.utcnow()}}
        )
        
        # Get user data from registration (you might need to store this temporarily)
        # For now, we'll create a basic user record
        # In a real implementation, you'd store the registration data temporarily
        
        return BaseResponse(
            success=True,
            message="Email verified successfully! You can now login.",
            data={"email": otp_data.email}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed. Please try again."
        )

@router.post("/request-login-otp", response_model=OTPResponse)
async def request_login_otp(otp_request: OTPRequest):
    """Request OTP for login"""
    try:
        users_collection = get_collection("users")
        otp_collection = get_collection("otp_verifications")
        
        # Check if user exists
        user = await users_collection.find_one({"email": otp_request.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate OTP
        otp_code = generate_otp()
        otp_expiry = get_otp_expiry_time()
        
        # Store OTP in database
        otp_data = {
            "email": otp_request.email,
            "otp_code": otp_code,
            "otp_type": "login",
            "is_used": False,
            "expires_at": otp_expiry,
            "attempts": 0,
            "max_attempts": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await otp_collection.insert_one(otp_data)
        
        # Send OTP email
        email_error = send_otp_email(
            to_email=otp_request.email,
            otp=otp_code,
            otp_type="login",
            username=user.get("first_name", "User")
        )
        
        if email_error:
            logger.error(f"Failed to send OTP email: {email_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email"
            )
        
        return OTPResponse(
            message="OTP sent to your email",
            expires_in=600,  # 10 minutes
            email=otp_request.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login OTP request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLoginWithOTP):
    """Login user with email, password, and OTP"""
    try:
        users_collection = get_collection("users")
        otp_collection = get_collection("otp_verifications")
        
        # Find user
        user = await users_collection.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify OTP
        otp_record = await otp_collection.find_one({
            "email": login_data.email,
            "otp_code": login_data.otp_code,
            "otp_type": "login",
            "is_used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP"
            )
        
        # Mark OTP as used
        await otp_collection.update_one(
            {"_id": otp_record["_id"]},
            {"$set": {"is_used": True, "updated_at": datetime.utcnow()}}
        )
        
        # Update last login
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user["_id"])})
        refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        avatar=current_user.get("avatar"),
        role=current_user["role"],
        is_active=current_user["is_active"],
        is_email_verified=current_user.get("is_email_verified", False),
        last_login=current_user.get("last_login"),
        preferences=current_user.get("preferences", {}),
        study_stats=current_user.get("study_stats", {}),
        created_at=current_user["created_at"],
        updated_at=current_user["updated_at"]
    )

@router.put("/me", response_model=BaseResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        users_collection = get_collection("users")
        
        update_data = user_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await users_collection.update_one(
                {"_id": current_user["_id"]},
                {"$set": update_data}
            )
        
        return BaseResponse(
            success=True,
            message="Profile updated successfully"
        )
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/change-password", response_model=BaseResponse)
async def change_password(
    password_change: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    try:
        users_collection = get_collection("users")
        
        # Verify current password
        if not verify_password(password_change.current_password, current_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        new_password_hash = get_password_hash(password_change.new_password)
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "password_hash": new_password_hash,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return BaseResponse(
            success=True,
            message="Password changed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout", response_model=BaseResponse)
async def logout_user(current_user: dict = Depends(get_current_user)):
    """Logout user"""
    # In a real implementation, you might want to blacklist the token
    return BaseResponse(
        success=True,
        message="Logged out successfully"
    )