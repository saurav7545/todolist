#!/usr/bin/env python3
"""
Study Tracker Backend Startup Script
This script helps you set up and run the Study Tracker Python backend
"""

import os
import sys
import subprocess
import platform

def print_banner():
    print("=" * 60)
    print("🚀 Study Tracker Python Backend Setup")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_mongodb():
    """Check if MongoDB is running"""
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=1000)
        client.server_info()
        print("✅ MongoDB is running")
        return True
    except Exception as e:
        print("❌ MongoDB is not running or not accessible")
        print("Please start MongoDB: mongod")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_env_file():
    """Create .env file if it doesn't exist"""
    if not os.path.exists(".env"):
        print("📝 Creating .env file...")
        try:
            with open(".env.example", "r") as f:
                content = f.read()
            with open(".env", "w") as f:
                f.write(content)
            print("✅ .env file created")
            print("⚠️  Please edit .env file with your configuration")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return False
    else:
        print("✅ .env file already exists")
        return True

def run_server():
    """Run the FastAPI server"""
    print("🚀 Starting Study Tracker Backend...")
    print("📊 API Documentation: http://localhost:8000/docs")
    print("📖 ReDoc Documentation: http://localhost:8000/redoc")
    print("🔗 Health Check: http://localhost:8000/api/health")
    print()
    print("Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def main():
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check MongoDB
    if not check_mongodb():
        print("\n💡 To start MongoDB:")
        if platform.system() == "Windows":
            print("   mongod")
        else:
            print("   sudo systemctl start mongod")
            print("   # or")
            print("   mongod")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print()
    
    # Ask if user wants to start the server
    response = input("Do you want to start the server now? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        run_server()
    else:
        print("\n💡 To start the server manually:")
        print("   python main.py")
        print("   # or")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    main()
