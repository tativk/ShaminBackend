@echo off
title Shamin Backend (local dev)
cd /d %~dp0
echo Starting Shamin backend with project venv...
.\venv\Scripts\python.exe manage.py runserver
pause
