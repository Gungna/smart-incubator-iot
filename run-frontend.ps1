# Script PowerShell untuk menjalankan Frontend
Write-Host "Starting Frontend Development Server..." -ForegroundColor Green

Set-Location frontend

# Install dependencies jika belum ada
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Jalankan dev server
Write-Host "Frontend running on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
npm run dev

