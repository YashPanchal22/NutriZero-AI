@echo off
echo ========================================================
echo     Starting NutriZero AI (Backend + Frontend)
echo ========================================================

echo Starting FastAPI Backend on port 8000...
start "NutriZero AI - Backend" cmd /k "cd /d %~dp0backend && ..\.venv\Scripts\python -m uvicorn main:app --reload --port 8000"

echo Starting Vite Frontend on port 5173...
start "NutriZero AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul
echo.
echo Opening browser at http://localhost:5173 ...
start http://localhost:5173
echo.
echo NutriZero AI is running!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000/docs
echo ========================================================
