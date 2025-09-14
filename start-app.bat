@echo off
echo ========================================
echo 🚀 Study Tracker - Full Stack Application
echo ========================================
echo.

echo Starting Backend Server (Python FastAPI)...
start "Backend Server" cmd /k "cd /d D:\PROJECT\TODO-LIST\python-backend && python main.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (HTTP Server)...
start "Frontend Server" cmd /k "cd /d D:\PROJECT\TODO-LIST\FORENTEND && python -m http.server 3000"

timeout /t 2 /nobreak > nul

echo.
echo ✅ Both servers are starting...
echo.
echo 📊 Backend API: http://localhost:8000
echo 📊 API Docs: http://localhost:8000/docs
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:3000
start http://localhost:8000/docs

echo.
echo 🎉 Application is running!
echo.
echo To stop the servers, close the command windows that opened.
echo.
pause
