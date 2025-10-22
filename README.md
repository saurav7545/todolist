# 📚 Study Tracker - Standalone Frontend Application

A comprehensive study tracking and personal productivity application that works entirely in the browser using localStorage for data storage. No backend server required!

![Study Tracker](https://img.shields.io/badge/Study-Tracker-blue?style=for-the-badge&logo=book)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

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
- Rating and categorization
- User feedback management

### 📢 Notice Board
- Public announcements
- Active/inactive status
- Real-time updates

### 👨‍💼 Admin Panel
- OTP-based authentication
- Notice management
- Feedback management
- User statistics and analytics

## 🚀 Live Demo

**Frontend**: [https://your-app-name.netlify.app](https://your-app-name.netlify.app)

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Interactive functionality
- **Local Storage** - Client-side data storage
- **Fetch API** - HTTP client (for future backend integration)

### Deployment
- **Netlify** - Frontend hosting
- **GitHub** - Version control and deployment

## 📁 Project Structure

```
Study-Tracker/
├── FORENTEND/                 # Frontend application
│   ├── js/                   # JavaScript utilities
│   │   ├── api-client.js     # LocalStorage client
│   │   ├── utils.js          # Utility functions
│   │   └── form-validation.js # Form validation
│   ├── admin/                # Admin panel
│   ├── login/                # User login
│   ├── netlify.toml          # Netlify configuration
│   └── *.html               # Main pages
├── .gitignore               # Git ignore rules
├── DEPLOYMENT.md            # Deployment guide
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/study-tracker.git
   cd study-tracker
   ```

2. **Run the application**
   ```bash
   cd FORENTEND
   # Open index.html in browser or use a local server
   python -m http.server 3000
   # Or use Node.js
   npx serve .
   ```

3. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Use demo credentials: `demo` / `123456`

### Production Deployment

#### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build directory to `FORENTEND`
3. Deploy automatically on push

## 🔧 Configuration

### Demo Credentials

The application comes with a demo user for testing:

- **Username**: `demo`
- **Password**: `123456`
- **Email**: `demo@studytracker.com`

### Data Storage

All data is stored locally in your browser's localStorage:

- **Tasks**: Your study tasks and progress
- **Notes**: Personal notes and documents
- **Diary**: Daily diary entries
- **Feedback**: Submitted feedback and ratings
- **User Data**: Profile information and preferences

### Browser Compatibility

This application works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📖 Features Overview

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| Task Management | ✅ | Create, edit, delete tasks with dates and times |
| Notes System | ✅ | Rich text notes with formatting |
| Personal Diary | ✅ | Daily entries with mood tracking |
| Feedback System | ✅ | Submit and manage feedback |
| Notice Board | ✅ | Public announcements |
| Admin Panel | ✅ | OTP-based admin authentication |
| Local Storage | ✅ | All data stored in browser |
| Responsive Design | ✅ | Mobile-friendly interface |
| Study Timer | ✅ | Integrated timer for tasks |
| Statistics | ✅ | Task completion statistics |

## 🛡️ Security Features

- OTP-based authentication
- Input validation and sanitization
- XSS protection
- Secure data storage in localStorage
- Client-side data encryption

## 🔑 Default Credentials

### User Login
- **Username**: `demo`
- **Password**: `123456`
- **Email**: `demo@studytracker.com`

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@studytracker.com`
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

- Netlify for the hosting platform
- Modern web browsers for localStorage support
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