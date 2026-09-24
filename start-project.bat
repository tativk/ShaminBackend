@echo off
title Shamin Project Starter
echo ==========================================
echo   Shamin Gallery - Project Starter
echo ==========================================
echo.
echo [1/3] Clearing ports 8000 and 3000 ...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c:":8000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /c:":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo       done.
echo.
echo [2/3] Starting BACKEND (new window) ...
start "Shamin BACKEND - do not close" cmd /k "cd /d C:\Users\tativk\Desktop\ShaminBackend && python manage.py runserver"

echo       waiting 4 seconds ...
timeout /t 4 /nobreak >nul

echo [3/3] Starting FRONTEND (new window) ...
start "Shamin FRONTEND - do not close" cmd /k "cd /d C:\Users\tativk\Desktop\ShaminBackend\frontend && set BROWSER=none&& npm start"

echo.
echo ==========================================
echo   Ready! Open:  http://localhost:3000
echo   OTP code appears in the BACKEND window.
echo   Close both windows to stop the project.
echo ==========================================
pause
