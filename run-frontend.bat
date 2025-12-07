@echo off
REM Script untuk menjalankan Frontend di Windows
echo Starting Frontend Development Server...
cd frontend

REM Install dependencies jika belum ada
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Jalankan dev server
echo Frontend running on http://localhost:5173
call npm run dev

