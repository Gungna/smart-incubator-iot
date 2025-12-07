@echo off
REM Script untuk menjalankan Backend di Windows
echo Starting Backend Server...
cd backend

REM Cek apakah virtual environment ada
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Aktifkan virtual environment
call venv\Scripts\activate.bat

REM Install dependencies jika belum ada
if not exist "venv\Lib\site-packages\fastapi" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Jalankan server
echo Backend running on http://localhost:8000
echo Press Ctrl+C to stop
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

