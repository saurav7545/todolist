from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        logger.info(f"Attempting to connect to MongoDB at {settings.MONGODB_URL}")
        # Add connection timeout
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test the connection
        logger.debug("Testing MongoDB connection...")
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
    except Exception as e:
        logger.error(f"MongoDB Connection Error: {str(e)}")
        logger.error("Stack trace:", exc_info=True)
        logger.error("Make sure MongoDB is installed and running on your system")
        sys.stderr.write(f"Database Connection Failed: {str(e)}\n")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if not db.database:
        logger.error("Database connection not initialized")
        raise ConnectionError("Database connection not initialized")
    return db.database

def get_collection(collection_name: str):
    """Get collection instance"""
    if not db.database:
        logger.error("Database connection not initialized")
        raise ConnectionError("Database connection not initialized")
    logger.debug(f"Accessing collection: {collection_name}")
    return db.database[collection_name]
