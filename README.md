# 📚 Study Tracker - Full Stack Application

A comprehensive study tracking and personal productivity application built with FastAPI backend and modern frontend technologies.

![Study Tracker](https://img.shields.io/badge/Study-Tracker-blue?style=for-the-badge&logo=book)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🌟 Features

### 📋 Task Management
- Create, edit, and delete study tasks
- Set dates, times, and priorities
- Mark tasks as complete
- Task statistics and filtering
- Integrated study timer

### 📝 Notes System
- Rich text notes with formatting
- Word count and reading time
- Search and filter capabilities
- Organized note management

### 📖 Personal Diary
- Daily diary entries with mood tracking
- Rich text editor with emoji support
- Weather and mood tracking
- Entry history and search

### 💬 Feedback System
- Submit feedback and bug reports
- Admin response system
- Rating and categorization
- User feedback management

### 📢 Notice Board
- Public announcements
- Admin-managed content
- Active/inactive status
- Real-time updates

### 👨‍💼 Admin Panel
- OTP-based authentication
- Notice management
- Feedback management
- User statistics and analytics

## 🚀 Live Demo

**Frontend**: [https://your-app-name.netlify.app](https://your-app-name.netlify.app)

**API Documentation**: [https://your-api.herokuapp.com/docs](https://your-api.herokuapp.com/docs)

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Interactive functionality
- **Fetch API** - HTTP client
- **Local Storage** - Client-side caching

### Deployment
- **Netlify** - Frontend hosting
- **Heroku/Railway** - Backend hosting
- **MongoDB Atlas** - Database hosting

## 📁 Project Structure

```
Study-Tracker/
├── FORENTEND/                 # Frontend application
│   ├── js/                   # JavaScript utilities
│   │   ├── api-client.js     # API communication
│   │   ├── utils.js          # Utility functions
│   │   └── form-validation.js # Form validation
│   ├── admin/                # Admin panel
│   ├── login/                # User login
│   ├── netlify.toml          # Netlify configuration
│   └── *.html               # Main pages
├── python-backend/           # Backend API
│   ├── app/
│   │   ├── core/            # Core functionality
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routers/         # API endpoints
│   │   └── schemas/         # Data validation
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/study-tracker.git
   cd study-tracker
   ```

2. **Backend Setup**
   ```bash
   cd python-backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd FORENTEND
   # Open index.html in browser or use a local server
   python -m http.server 3000
   ```

### Production Deployment

#### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build directory to `FORENTEND`
3. Deploy automatically on push

#### Backend (Heroku/Railway)
1. Create a new app on Heroku/Railway
2. Connect your GitHub repository
3. Set environment variables
4. Deploy automatically

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `python-backend` directory:

```env
# Application Settings
APP_NAME=Study Tracker
DEBUG=false
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Database Configuration
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/study_tracker
MONGODB_DATABASE=study_tracker

# Security Settings
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Settings (for OTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Task Endpoints
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Notes Endpoints
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Diary Endpoints
- `GET /api/diary` - List diary entries
- `POST /api/diary` - Create entry
- `PUT /api/diary/{id}` - Update entry
- `DELETE /api/diary/{id}` - Delete entry

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify-otp` - Verify OTP
- `GET /api/admin/notices` - List notices
- `POST /api/admin/notices` - Create notice
- `GET /api/admin/stats` - Get statistics

## 🔑 Default Credentials

### User Login
- **Username**: demo
- **Password**: 123456



## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and security headers
- Input validation and sanitization
- CORS protection
- XSS and CSRF protection

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Task Management | ✅ | Create, edit, delete tasks with dates and times |
| Notes System | ✅ | Rich text notes with formatting |
| Personal Diary | ✅ | Daily entries with mood tracking |
| Feedback System | ✅ | Submit and manage feedback |
| Notice Board | ✅ | Public announcements |
| Admin Panel | ✅ | OTP-based admin authentication |
| API Integration | ✅ | Complete REST API |
| Security | ✅ | JWT auth, rate limiting, validation |
| Responsive Design | ✅ | Mobile-friendly interface |
| Real-time Validation | ✅ | Client-side form validation |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- MongoDB for the flexible database
- Netlify for the hosting platform
- All contributors and users

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/your-username/study-tracker/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/study-tracker&type=Date)](https://star-history.com/#your-username/study-tracker&Date)

---

**Made with ❤️ for students and productivity enthusiasts**