"""
Rate limiting middleware for FastAPI
"""
import time
from typing import Dict, Optional
from fastapi import Request, HTTPException
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using sliding window algorithm"""
    
    def __init__(self, app, requests_per_minute: int = None):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute or settings.RATE_LIMIT_REQUESTS_PER_MINUTE
        self.windows: Dict[str, list] = {}
        self.window_size = 60  # 60 seconds
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Check rate limit
        if not self._is_allowed(client_ip):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(self._get_remaining_requests(client_ip))
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + self.window_size))
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        # Check for forwarded IP first (for reverse proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        return request.client.host if request.client else "unknown"
    
    def _is_allowed(self, client_ip: str) -> bool:
        """Check if client is within rate limit"""
        current_time = time.time()
        
        # Clean old entries
        if client_ip in self.windows:
            self.windows[client_ip] = [
                timestamp for timestamp in self.windows[client_ip]
                if current_time - timestamp < self.window_size
            ]
        else:
            self.windows[client_ip] = []
        
        # Check if under limit
        if len(self.windows[client_ip]) >= self.requests_per_minute:
            return False
        
        # Add current request
        self.windows[client_ip].append(current_time)
        return True
    
    def _get_remaining_requests(self, client_ip: str) -> int:
        """Get remaining requests for client"""
        if client_ip not in self.windows:
            return self.requests_per_minute
        
        current_time = time.time()
        recent_requests = [
            timestamp for timestamp in self.windows[client_ip]
            if current_time - timestamp < self.window_size
        ]
        
        return max(0, self.requests_per_minute - len(recent_requests))
