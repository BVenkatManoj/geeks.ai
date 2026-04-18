@echo off
echo ==============================================
echo  Starting Geeks.AI Backend (FastAPI Python)
echo ==============================================
start cmd /k "cd c:\Users\user\.antigravity\geeks-ai\backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo ==============================================
echo  Starting Geeks.AI Frontend (React Vite)
echo ==============================================
start cmd /k "cd c:\Users\user\.antigravity\geeks-ai\frontend && npm install && npm run dev"

echo Both services are starting... 
echo Frontend will be running at http://localhost:5173
echo Backend will be running at http://localhost:8000
