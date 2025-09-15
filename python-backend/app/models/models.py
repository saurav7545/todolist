from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.schemas.schemas import UserRole, TaskStatus, TaskPriority, MoodType, WeatherType, FeedbackType, NoticeType

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class UserPreferences(BaseModel):
    theme: str = "light"
    language: str = "en"
    notifications: Dict[str, bool] = {"email": True, "push": True}

class StudyStats(BaseModel):
    total_study_time: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    streak: int = 0
    last_study_date: Optional[datetime] = None

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(..., min_length=3, max_length=30)
    email: str = Field(..., max_length=255)
    password_hash: str = Field(..., alias="passwordHash")
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    avatar: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = False  # Changed to False - requires email verification
    is_email_verified: bool = False  # New field for email verification
    email_verification_token: Optional[str] = None  # New field for verification token
    otp_code: Optional[str] = None  # New field for OTP
    otp_expires_at: Optional[datetime] = None  # New field for OTP expiry
    last_login: Optional[datetime] = None
    preferences: UserPreferences = UserPreferences()
    study_stats: StudyStats = StudyStats()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Task(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    subject: str = Field(..., max_length=50)
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: datetime
    estimated_time: int = Field(60, ge=1)  # in minutes
    actual_time: int = 0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    tags: List[str] = []
    notes: Optional[str] = Field(None, max_length=1000)
    completed_at: Optional[datetime] = None
    is_recurring: bool = False
    recurring_pattern: Optional[str] = None
    reminder: Dict[str, Any] = {"enabled": False, "time": None}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Note(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    title: str = Field(..., max_length=100)
    content: str = Field(..., max_length=10000)
    subject: Optional[str] = Field(None, max_length=50)
    tags: List[str] = []
    is_public: bool = False
    is_pinned: bool = False
    word_count: int = 0
    last_modified: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1
    previous_versions: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Diary(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    date: datetime = Field(default_factory=datetime.utcnow)
    title: str = Field(..., max_length=100)
    content: str = Field(..., max_length=50000)
    mood: MoodType = MoodType.NEUTRAL
    weather: Optional[WeatherType] = None
    tags: List[str] = []
    is_private: bool = True
    word_count: int = 0
    reading_time: int = 0  # in minutes
    last_modified: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1
    previous_versions: List[Dict[str, Any]] = []
    location: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Feedback(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    type: FeedbackType
    subject: str = Field(..., max_length=100)
    message: str = Field(..., max_length=1000)
    priority: str = "medium"
    status: str = "open"
    rating: Optional[int] = Field(None, ge=1, le=5)
    admin_response: Optional[Dict[str, Any]] = None
    resolved_at: Optional[datetime] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Notice(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(..., max_length=200)
    content: str = Field(..., max_length=2000)
    type: NoticeType = NoticeType.INFO
    priority: str = "medium"
    is_active: bool = True
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    target_audience: str = "all"
    created_by: PyObjectId = Field(..., alias="createdBy")
    view_count: int = 0
    views: List[Dict[str, Any]] = []
    is_pinned: bool = False
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OTPVerification(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: str = Field(..., max_length=255)
    otp_code: str = Field(..., max_length=6)
    otp_type: str = Field(..., max_length=20)  # "registration", "login", "password_reset"
    is_used: bool = False
    expires_at: datetime = Field(..., alias="expiresAt")
    attempts: int = 0
    max_attempts: int = 3
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Session(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    session_id: str = Field(..., alias="sessionId")
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    duration: int = 0  # in minutes
    task_id: Optional[PyObjectId] = Field(None, alias="taskId")
    subject: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)
    productivity: Optional[int] = Field(None, ge=1, le=10)
    distractions: List[str] = []
    breaks: List[Dict[str, Any]] = []
    is_active: bool = True
    device_info: Optional[Dict[str, str]] = None
    location: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
