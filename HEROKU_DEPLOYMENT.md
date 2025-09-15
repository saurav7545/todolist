# Heroku Deployment Guide

## 🚀 Deploy Study Tracker Backend to Heroku

This guide will help you deploy the Study Tracker backend API to Heroku.

## 📋 Prerequisites

- GitHub account
- Heroku account
- Heroku CLI installed
- MongoDB Atlas account (for database)

## 🔧 Step 1: Prepare Backend for Heroku

### 1.1 Install Heroku CLI

**Windows:**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# Or use chocolatey
choco install heroku-cli
```

**Mac:**
```bash
brew install heroku/brew/heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### 1.2 Login to Heroku
```bash
heroku login
```

## 🌐 Step 2: Create Heroku App

### 2.1 Create New App
```bash
cd python-backend
heroku create your-app-name
```

### 2.2 Set Environment Variables
```bash
# Set MongoDB URL (get from MongoDB Atlas)
heroku config:set MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/study_tracker"

# Set JWT Secret
heroku config:set JWT_SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"

# Set other environment variables
heroku config:set DEBUG=false
heroku config:set APP_NAME="Study Tracker"
heroku config:set JWT_ALGORITHM="HS256"
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email settings (optional)
heroku config:set SMTP_SERVER="smtp.gmail.com"
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER="your-email@gmail.com"
heroku config:set SMTP_PASSWORD="your-app-password"
heroku config:set FROM_EMAIL="your-email@gmail.com"
```

## 🗄️ Step 3: Set Up MongoDB Atlas

### 3.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster

### 3.2 Configure Database
1. **Create Database User**
   - Go to "Database Access"
   - Add new database user
   - Note username and password

2. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Add IP address (0.0.0.0/0 for all IPs)
   - Or add Heroku's IP ranges

3. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string

### 3.3 Update Heroku Config
```bash
heroku config:set MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/study_tracker?retryWrites=true&w=majority"
```

## 🚀 Step 4: Deploy to Heroku

### 4.1 Deploy from Git
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

### 4.2 Deploy from GitHub
1. **Connect GitHub Repository**
   - Go to Heroku dashboard
   - Select your app
   - Go to "Deploy" tab
   - Connect to GitHub
   - Select your repository
   - Enable automatic deploys

2. **Manual Deploy**
   - Click "Deploy branch"
   - Wait for deployment to complete

## 🔧 Step 5: Configure CORS

### 5.1 Update CORS Settings
In your `python-backend/main.py`, update CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app-name.netlify.app",  # Your Netlify URL
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.2 Redeploy
```bash
git add .
git commit -m "Update CORS settings"
git push heroku main
```

## 🧪 Step 6: Test Your API

### 6.1 Check Health Endpoint
```bash
curl https://your-app-name.herokuapp.com/api/health
```

### 6.2 Test API Documentation
- Visit: `https://your-app-name.herokuapp.com/docs`
- Test the interactive API documentation

### 6.3 Test Authentication
```bash
# Test user registration
curl -X POST https://your-app-name.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Test user login
curl -X POST https://your-app-name.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

## 📊 Step 7: Monitor Your App

### 7.1 View Logs
```bash
heroku logs --tail
```

### 7.2 Check App Status
```bash
heroku ps
```

### 7.3 Monitor Resources
- Go to Heroku dashboard
- Check "Metrics" tab for resource usage
- Monitor "Logs" tab for errors

## 🔧 Step 8: Database Initialization

### 8.1 Create Initial Data
You can create a script to initialize your database:

```python
# create_initial_data.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def create_initial_data():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DATABASE]
    
    # Create admin user
    admin_user = {
        "username": "admin",
        "email": "admin@studytracker.com",
        "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Q8Q8Q8",
        "role": "admin",
        "is_active": True
    }
    
    await db.users.insert_one(admin_user)
    print("Initial data created successfully!")

if __name__ == "__main__":
    asyncio.run(create_initial_data())
```

### 8.2 Run Initialization
```bash
heroku run python create_initial_data.py
```

## 🚀 Step 9: Connect Frontend

### 9.1 Update Frontend API URL
In your `FORENTEND/js/api-client.js`:

```javascript
constructor() {
    this.baseURL = 'https://your-app-name.herokuapp.com/api';
    // ... rest of the code
}
```

### 9.2 Redeploy Frontend
- Commit and push changes to GitHub
- Netlify will automatically redeploy

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Check if all dependencies are in requirements.txt
   pip freeze > requirements.txt
   ```

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Verify database user permissions

3. **CORS Issues**
   - Update CORS origins in main.py
   - Redeploy the application
   - Check browser console for errors

4. **Environment Variables**
   ```bash
   # Check all environment variables
   heroku config
   
   # Set missing variables
   heroku config:set VARIABLE_NAME=value
   ```

### Debug Steps

1. **Check App Status**
   ```bash
   heroku ps
   heroku logs --tail
   ```

2. **Test Locally with Heroku Config**
   ```bash
   heroku config:get MONGODB_URL
   # Use this URL in your local .env file
   ```

3. **Check Database Connection**
   ```bash
   heroku run python -c "from app.core.database import connect_to_mongo; import asyncio; asyncio.run(connect_to_mongo())"
   ```

## 📈 Performance Optimization

### 1. Enable Heroku Redis (Optional)
```bash
heroku addons:create heroku-redis:mini
```

### 2. Set Up Monitoring
- Use Heroku's built-in metrics
- Consider adding New Relic or similar service

### 3. Database Optimization
- Create indexes in MongoDB Atlas
- Monitor query performance

## 🎉 Success!

Your Study Tracker backend is now live on Heroku!

**Your API URLs:**
- **API Base**: `https://your-app-name.herokuapp.com/api`
- **Documentation**: `https://your-app-name.herokuapp.com/docs`
- **Health Check**: `https://your-app-name.herokuapp.com/api/health`

**Next Steps:**
- Update your frontend to use the new API URL
- Test all functionality
- Monitor performance and usage
- Set up monitoring and alerts

## 📞 Support

If you encounter issues:

1. Check Heroku documentation
2. Review build and runtime logs
3. Test API endpoints directly
4. Check MongoDB Atlas connection

---

**Happy Deploying! 🚀**

