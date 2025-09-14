# Study Tracker Python Backend

A comprehensive FastAPI backend for the Study Tracker application with MongoDB integration.

## 🚀 Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **MongoDB Integration**: Async MongoDB operations with Motor
- **JWT Authentication**: Secure token-based authentication
- **User Management**: Complete user registration, login, and profile management
- **Task Management**: CRUD operations for study tasks with timers
- **Notes System**: Rich text notes with versioning
- **Diary System**: Personal diary with mood tracking
- **Feedback System**: User feedback and admin response system
- **Admin Panel**: Complete admin dashboard functionality
- **Notice System**: Announcements and notifications
- **Data Validation**: Pydantic models for request/response validation
- **Security**: Password hashing, CORS, rate limiting
- **Documentation**: Auto-generated API documentation

## 📋 Requirements

- Python 3.8+
- MongoDB 4.4+
- pip or poetry

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd python-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Run the application**
   ```bash
   python main.py
   # Or with uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `study_tracker` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-key` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `PORT` | Server port | `8000` |

### Database Collections

- `users` - User accounts and profiles
- `tasks` - Study tasks and sessions
- `notes` - User notes
- `diary` - Diary entries
- `feedback` - User feedback
- `notices` - System notices
- `sessions` - Study sessions

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get access and refresh tokens
2. **Include token** in Authorization header: `Bearer <token>`
3. **Refresh token** when access token expires

### Example Authentication Flow

```python
# Register
POST /api/auth/register
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
}

# Login
POST /api/auth/login
{
    "email": "john@example.com",
    "password": "password123"
}

# Use token
GET /api/tasks
Authorization: Bearer <access_token>
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh-token` - Refresh access token

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get single task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/start` - Start task session
- `POST /api/tasks/{id}/complete` - Complete task
- `GET /api/tasks/stats/overview` - Get task statistics

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Diary
- `GET /api/diary` - Get diary entries
- `POST /api/diary` - Create diary entry
- `PUT /api/diary/{id}` - Update diary entry
- `DELETE /api/diary/{id}` - Delete diary entry

### Feedback
- `GET /api/feedback` - Get user feedback
- `POST /api/feedback` - Submit feedback
- `PUT /api/feedback/{id}` - Update feedback
- `DELETE /api/feedback/{id}` - Delete feedback

### Notices
- `GET /api/notices` - Get active notices
- `GET /api/notices/{id}` - Get single notice

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/notices` - Get all notices
- `POST /api/admin/notices` - Create notice
- `PUT /api/admin/notices/{id}` - Update notice
- `DELETE /api/admin/notices/{id}` - Delete notice
- `GET /api/admin/feedback` - Get all feedback
- `PUT /api/admin/feedback/{id}/respond` - Respond to feedback
- `GET /api/admin/stats` - Get admin statistics

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## 🚀 Deployment

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongo:27017
    depends_on:
      - mongo
  
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
```

## 📝 Development

### Code Style

```bash
# Format code
black app/

# Lint code
flake8 app/
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit
pre-commit install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Saurav Kumar**
- Portfolio: [https://sauravedu.netlify.app/](https://sauravedu.netlify.app/)
- GitHub: [github.com/saurav7545](https://github.com/saurav7545)
- Email: saurav7545@gmail.com

## 🔗 Links

- **Live Application**: [https://indiantodolist.netlify.app/login/login.html](https://indiantodolist.netlify.app/login/login.html)
- **Portfolio**: [https://sauravedu.netlify.app/](https://sauravedu.netlify.app/)
- **API Documentation**: http://localhost:8000/docs
