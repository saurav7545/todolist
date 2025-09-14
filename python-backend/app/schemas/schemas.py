from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class MoodType(str, Enum):
    VERY_HAPPY = "very-happy"
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    VERY_SAD = "very-sad"

class WeatherType(str, Enum):
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    SNOWY = "snowy"
    WINDY = "windy"

class FeedbackType(str, Enum):
    BUG = "bug"
    FEATURE = "feature"
    IMPROVEMENT = "improvement"
    GENERAL = "general"

class NoticeType(str, Enum):
    ANNOUNCEMENT = "announcement"
    MAINTENANCE = "maintenance"
    UPDATE = "update"
    WARNING = "warning"
    INFO = "info"

# Base schemas
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Success"

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[List[str]] = None

# User schemas
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

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    preferences: Optional[UserPreferences] = None

class UserResponse(UserBase):
    id: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    preferences: UserPreferences
    study_stats: StudyStats
    created_at: datetime
    last_login: Optional[datetime] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

# Task schemas
class TaskBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    subject: str = Field(..., max_length=50)
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime
    estimated_time: int = Field(60, ge=1)  # in minutes
    tags: Optional[List[str]] = []

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    subject: Optional[str] = Field(None, max_length=50)
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    estimated_time: Optional[int] = Field(None, ge=1)
    status: Optional[TaskStatus] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=1000)

class TaskResponse(TaskBase):
    id: str
    user_id: str
    status: TaskStatus = TaskStatus.PENDING
    actual_time: int = 0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class TaskStats(BaseModel):
    total: int = 0
    completed: int = 0
    pending: int = 0
    in_progress: int = 0
    total_estimated_time: int = 0
    total_actual_time: int = 0

# Note schemas
class NoteBase(BaseModel):
    title: str = Field(..., max_length=100)
    content: str = Field(..., max_length=10000)
    subject: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = []
    is_public: bool = False
    is_pinned: bool = False

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = Field(None, max_length=10000)
    subject: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    is_pinned: Optional[bool] = None

class NoteResponse(NoteBase):
    id: str
    user_id: str
    word_count: int = 0
    last_modified: datetime
    version: int = 1
    created_at: datetime
    updated_at: datetime

# Diary schemas
class DiaryBase(BaseModel):
    title: str = Field(..., max_length=100)
    content: str = Field(..., max_length=50000)
    mood: MoodType = MoodType.NEUTRAL
    weather: Optional[WeatherType] = None
    tags: Optional[List[str]] = []
    is_private: bool = True
    location: Optional[Dict[str, Any]] = None

class DiaryCreate(DiaryBase):
    date: Optional[datetime] = None

class DiaryUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = Field(None, max_length=50000)
    mood: Optional[MoodType] = None
    weather: Optional[WeatherType] = None
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None
    location: Optional[Dict[str, Any]] = None

class DiaryResponse(DiaryBase):
    id: str
    user_id: str
    date: datetime
    word_count: int = 0
    reading_time: int = 0  # in minutes
    last_modified: datetime
    version: int = 1
    created_at: datetime
    updated_at: datetime

# Feedback schemas
class FeedbackBase(BaseModel):
    type: FeedbackType
    subject: str = Field(..., max_length=100)
    message: str = Field(..., max_length=1000)
    priority: str = "medium"
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    subject: Optional[str] = Field(None, max_length=100)
    message: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackResponse(FeedbackBase):
    id: str
    user_id: str
    status: str = "open"
    admin_response: Optional[Dict[str, Any]] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Notice schemas
class NoticeBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str = Field(..., max_length=2000)
    type: NoticeType = NoticeType.INFO
    priority: str = "medium"
    start_date: datetime
    end_date: Optional[datetime] = None
    target_audience: str = "all"
    is_pinned: bool = False
    tags: Optional[List[str]] = []

class NoticeCreate(NoticeBase):
    pass

class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=2000)
    type: Optional[NoticeType] = None
    priority: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_audience: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    tags: Optional[List[str]] = None

class NoticeResponse(NoticeBase):
    id: str
    is_active: bool = True
    created_by: str
    view_count: int = 0
    created_at: datetime
    updated_at: datetime

# Pagination schemas
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool
