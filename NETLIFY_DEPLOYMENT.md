# Netlify Deployment Guide

## 🚀 Deploy Study Tracker to Netlify

This guide will help you deploy the Study Tracker frontend to Netlify and connect it to your backend API.

## 📋 Prerequisites

- GitHub account
- Netlify account
- Backend API deployed (Heroku, Railway, etc.)

## 🔧 Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Study Tracker application"
   git branch -M main
   git remote add origin https://github.com/your-username/study-tracker.git
   git push -u origin main
   ```

2. **Verify Structure**
   ```
   Study-Tracker/
   ├── FORENTEND/          # This will be your Netlify site
   │   ├── index.html
   │   ├── netlify.toml
   │   ├── package.json
   │   └── ...
   ├── python-backend/     # Deploy separately
   └── README.md
   ```

## 🌐 Step 2: Deploy to Netlify

### Option A: Connect GitHub Repository

1. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign in with your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Select your `study-tracker` repository

3. **Configure Build Settings**
   - **Base directory**: `FORENTEND`
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `FORENTEND` (or leave empty)

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

### Option B: Drag and Drop

1. **Zip the Frontend Folder**
   - Navigate to the `FORENTEND` folder
   - Select all files and create a ZIP archive

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the ZIP file to the deploy area

## ⚙️ Step 3: Configure Environment

### Update API URLs

1. **Edit API Client**
   - Open `FORENTEND/js/api-client.js`
   - Update the `baseURL` to your backend API URL:
   ```javascript
   constructor() {
       this.baseURL = 'https://your-backend-api.herokuapp.com/api';
       // ... rest of the code
   }
   ```

2. **Redeploy**
   - Commit and push changes to GitHub
   - Netlify will automatically redeploy

### Environment Variables (Optional)

If you need environment variables:

1. **Go to Site Settings**
   - In Netlify dashboard, go to your site
   - Click "Site settings" → "Environment variables"

2. **Add Variables**
   ```
   REACT_APP_API_URL = https://your-backend-api.herokuapp.com/api
   ```

## 🔧 Step 4: Backend API Configuration

### Update CORS Settings

In your backend API, update CORS settings to allow your Netlify domain:

```python
# In python-backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app-name.netlify.app",  # Add your Netlify URL
        "https://*.netlify.app"  # Allow all Netlify subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎯 Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - In Netlify dashboard, go to "Domain settings"
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**
   - Add CNAME record pointing to your Netlify site
   - Or use Netlify's nameservers

## 🔍 Step 6: Testing

1. **Test Frontend**
   - Visit your Netlify URL
   - Test all features and functionality

2. **Test API Integration**
   - Try logging in with demo credentials
   - Create, edit, and delete tasks
   - Test admin panel functionality

## 🚀 Step 7: Continuous Deployment

### Automatic Deployments

- Every push to your main branch will trigger a new deployment
- Netlify will build and deploy automatically
- You can see deployment status in the Netlify dashboard

### Manual Deployments

- Go to "Deploys" tab in Netlify dashboard
- Click "Trigger deploy" → "Deploy site"

## 📊 Step 8: Monitoring

### Netlify Analytics

1. **Enable Analytics**
   - Go to "Analytics" in your site dashboard
   - Enable Netlify Analytics (free tier available)

2. **Monitor Performance**
   - Track page views and user behavior
   - Monitor site performance metrics

### Error Monitoring

1. **Check Function Logs**
   - Go to "Functions" tab for serverless function logs
   - Monitor any errors or issues

2. **Browser Console**
   - Check browser console for JavaScript errors
   - Test on different devices and browsers

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check CORS settings in backend
   - Verify API URL in frontend code
   - Test API endpoints directly

2. **Build Failures**
   - Check build logs in Netlify dashboard
   - Verify file structure and paths
   - Check for syntax errors

3. **Routing Issues**
   - Ensure `netlify.toml` is configured correctly
   - Check redirect rules for SPA routing

### Debug Steps

1. **Check Build Logs**
   - Go to "Deploys" → Click on latest deploy
   - Review build logs for errors

2. **Test Locally**
   - Run `python -m http.server 3000` in FORENTEND folder
   - Test functionality before deploying

3. **Check Network Tab**
   - Open browser dev tools
   - Check Network tab for failed requests

## 📈 Performance Optimization

### Netlify Features

1. **CDN**
   - Netlify automatically provides global CDN
   - Static assets are cached globally

2. **Image Optimization**
   - Use Netlify's image optimization
   - Compress images before uploading

3. **Caching**
   - Configure caching headers in `netlify.toml`
   - Cache static assets for better performance

## 🎉 Success!

Your Study Tracker application is now live on Netlify! 

**Next Steps:**
- Share your live URL
- Monitor performance and usage
- Collect user feedback
- Plan future enhancements

## 📞 Support

If you encounter issues:

1. Check Netlify documentation
2. Review build logs
3. Test locally first
4. Check browser console for errors

---

**Happy Deploying! 🚀**

