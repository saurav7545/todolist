# Study Tracker - Full Stack Application Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Study Tracker - Full Stack Application" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server (Python FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\PROJECT\TODO-LIST\python-backend'; python main.py" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server (HTTP Server)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\PROJECT\TODO-LIST\FORENTEND'; python -m http.server 3000" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Backend API: http://localhost:8000" -ForegroundColor Blue
Write-Host "📊 API Docs: http://localhost:8000/docs" -ForegroundColor Blue
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""

$response = Read-Host "Press Enter to open the application in your browser"
if ($response -eq "") {
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:8000/docs"
}

Write-Host ""
Write-Host "🎉 Application is running!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop the servers, close the PowerShell windows that opened." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
