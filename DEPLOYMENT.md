# Deployment Guide

This guide covers deployment instructions for both Heroku (backend) and Netlify (frontend).

## Frontend Deployment (Netlify)

1. Push your code to GitHub
2. Log in to Netlify
3. Choose "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: None (static site)
   - Publish directory: `FORENTEND`
6. Set environment variables:
   - `API_URL`: Your backend API URL

## Backend Deployment (Heroku)

1. Make sure you have the Heroku CLI installed
2. Log in to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set up environment variables:
   ```bash
   heroku config:set MONGODB_URL=your_mongodb_url
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set EMAIL_USERNAME=your_email
   heroku config:set EMAIL_PASSWORD=your_email_password
   ```
5. Deploy your code:
   ```bash
   git subtree push --prefix python-backend heroku main
   ```

## Environment Variables

Make sure to set up these environment variables in both development and production:

### Frontend (.env)
```
API_URL=http://localhost:8000 # Development
API_URL=https://your-api.herokuapp.com # Production
```

### Backend (.env)
```
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USERNAME=your_email_for_sending_otps
EMAIL_PASSWORD=your_email_app_password
```