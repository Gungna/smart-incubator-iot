# Script untuk menjalankan Backend dari folder backend
Write-Host "Starting Backend Server..." -ForegroundColor Green

# Cek apakah virtual environment ada
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Aktifkan virtual environment
& "venv\Scripts\Activate.ps1"

# Install dependencies jika belum ada
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Jalankan server
Write-Host "Backend running on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

