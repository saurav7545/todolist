# Deployment Guide

This guide covers deployment instructions for the Study Tracker frontend application.

## Frontend Deployment (Netlify)

This is a standalone frontend application that works entirely in the browser using localStorage for data storage. No backend server is required.

### Deployment Steps

1. Push your code to GitHub
2. Log in to Netlify
3. Choose "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: None (static site)
   - Publish directory: `FORENTEND`
6. Deploy!

### Features

- **Standalone Operation**: No backend server required
- **Local Storage**: All data is stored in the user's browser
- **Offline Capable**: Works without internet connection
- **Demo Mode**: Includes demo user for testing

### Demo Credentials

- **Username**: demo
- **Password**: 123456
- **Email**: demo@studytracker.com

## Environment Variables

No environment variables are required for this standalone frontend application.

## Data Storage

All user data, tasks, notes, and diary entries are stored locally in the browser's localStorage. This means:

- Data persists between browser sessions
- Data is private to each user's browser
- No server-side data storage required
- Users can export/import their data if needed