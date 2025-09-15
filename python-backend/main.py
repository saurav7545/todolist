from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routers import auth, tasks, notes, diary, feedback, notices, admin
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware, SecurityHeadersMiddleware
from app.middleware.exception_handler import ExceptionHandlerMiddleware

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create FastAPI app
app = FastAPI(
    title="Study Tracker API",
    description="A comprehensive study tracking and personal productivity API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    debug=True  # Enable debug mode
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Add custom middleware
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(diary.router, prefix="/api/diary", tags=["Diary"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(notices.router, prefix="/api/notices", tags=["Notices"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "Study Tracker API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "Study Tracker API is running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
