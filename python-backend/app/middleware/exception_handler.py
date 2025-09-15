"""
Global exception handler middleware for FastAPI
"""

import logging
import traceback
from typing import Union
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import StudyTrackerException, create_http_exception

logger = logging.getLogger(__name__)


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """Global exception handler middleware"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            return await self.handle_exception(request, exc)
    
    async def handle_exception(self, request: Request, exc: Exception) -> JSONResponse:
        """Handle different types of exceptions"""
        
        # Log the exception
        logger.error(
            f"Exception in {request.method} {request.url.path}: {str(exc)}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "client_ip": self._get_client_ip(request),
                "traceback": traceback.format_exc()
            }
        )
        
        # Handle different exception types
        if isinstance(exc, StudyTrackerException):
            http_exc = create_http_exception(exc)
            return JSONResponse(
                status_code=http_exc.status_code,
                content={
                    "error": True,
                    "message": http_exc.detail,
                    "details": exc.details,
                    "path": request.url.path,
                    "method": request.method
                },
                headers=getattr(http_exc, 'headers', {})
            )
        
        elif isinstance(exc, HTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": True,
                    "message": exc.detail,
                    "path": request.url.path,
                    "method": request.method
                },
                headers=getattr(exc, 'headers', {})
            )
        
        elif isinstance(exc, StarletteHTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": True,
                    "message": exc.detail,
                    "path": request.url.path,
                    "method": request.method
                }
            )
        
        elif isinstance(exc, RequestValidationError):
            return JSONResponse(
                status_code=422,
                content={
                    "error": True,
                    "message": "Validation error",
                    "details": exc.errors(),
                    "path": request.url.path,
                    "method": request.method
                }
            )
        
        else:
            # Generic server error
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "Internal server error",
                    "path": request.url.path,
                    "method": request.method
                }
            )
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"


class ValidationErrorHandler:
    """Custom validation error handler"""
    
    @staticmethod
    def format_validation_error(exc: RequestValidationError) -> dict:
        """Format validation errors for better user experience"""
        errors = []
        
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            message = error["msg"]
            error_type = error["type"]
            
            # Customize error messages based on type
            if error_type == "value_error.missing":
                message = f"{field} is required"
            elif error_type == "type_error.integer":
                message = f"{field} must be a number"
            elif error_type == "type_error.str":
                message = f"{field} must be text"
            elif error_type == "value_error.email":
                message = f"{field} must be a valid email address"
            elif error_type == "value_error.date":
                message = f"{field} must be a valid date"
            elif error_type == "value_error.time":
                message = f"{field} must be a valid time"
            
            errors.append({
                "field": field,
                "message": message,
                "type": error_type
            })
        
        return {
            "error": True,
            "message": "Validation failed",
            "validation_errors": errors
        }
