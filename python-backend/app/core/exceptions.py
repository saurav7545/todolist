"""
Custom exceptions for Study Tracker API
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class StudyTrackerException(Exception):
    """Base exception for Study Tracker"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(StudyTrackerException):
    """Authentication related errors"""
    pass


class AuthorizationError(StudyTrackerException):
    """Authorization related errors"""
    pass


class ValidationError(StudyTrackerException):
    """Data validation errors"""
    pass


class NotFoundError(StudyTrackerException):
    """Resource not found errors"""
    pass


class ConflictError(StudyTrackerException):
    """Resource conflict errors"""
    pass


class RateLimitError(StudyTrackerException):
    """Rate limiting errors"""
    pass


class DatabaseError(StudyTrackerException):
    """Database operation errors"""
    pass


class EmailError(StudyTrackerException):
    """Email sending errors"""
    pass


class FileUploadError(StudyTrackerException):
    """File upload errors"""
    pass


# HTTP Exception mappings
def create_http_exception(exc: StudyTrackerException) -> HTTPException:
    """Convert custom exceptions to HTTP exceptions"""
    
    if isinstance(exc, AuthenticationError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    elif isinstance(exc, AuthorizationError):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=exc.message
        )
    
    elif isinstance(exc, ValidationError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.message
        )
    
    elif isinstance(exc, NotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exc.message
        )
    
    elif isinstance(exc, ConflictError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=exc.message
        )
    
    elif isinstance(exc, RateLimitError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=exc.message,
            headers={"Retry-After": "60"}
        )
    
    elif isinstance(exc, DatabaseError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed"
        )
    
    elif isinstance(exc, EmailError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service unavailable"
        )
    
    elif isinstance(exc, FileUploadError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.message
        )
    
    else:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
