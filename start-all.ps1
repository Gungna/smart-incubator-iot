# Script untuk menjalankan semua service sekaligus
# Backend, Frontend, dan Simulator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Smart Incubator IoT - Start All" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pastikan kita di root project
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Fungsi untuk menjalankan service di terminal baru
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Green"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    $fullCommand = "cd '$Path'; $Command; Write-Host '`nPress any key to close...' -ForegroundColor Yellow; `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand
    Start-Sleep -Milliseconds 500
}

# 1. Start Backend
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptPath "backend"
$backendCommand = @"
if (-not (Test-Path 'venv')) { 
    Write-Host 'Creating virtual environment...' -ForegroundColor Yellow
    python -m venv venv 
}
& 'venv\Scripts\Activate.ps1'
if (-not (Test-Path 'venv\Lib\site-packages\fastapi')) { 
    Write-Host 'Installing dependencies...' -ForegroundColor Yellow
    pip install -r requirements.txt 
}
Write-Host 'Backend running on http://localhost:8000' -ForegroundColor Green
Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor Cyan
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"@
Start-Service -Name "Backend" -Path $backendPath -Command $backendCommand -Color "Green"

# 2. Start Frontend
Write-Host "[2/3] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptPath "frontend"
$frontendCommand = @"
if (-not (Test-Path 'node_modules')) { 
    Write-Host 'Installing dependencies...' -ForegroundColor Yellow
    npm install 
}
Write-Host 'Frontend running on http://localhost:5173' -ForegroundColor Green
npm run dev
"@
Start-Service -Name "Frontend" -Path $frontendPath -Command $frontendCommand -Color "Blue"

# 3. Start Simulator (Optional)
Write-Host "[3/3] Starting Simulator..." -ForegroundColor Yellow
$simulatorPath = $scriptPath
$simulatorCommand = @"
Write-Host 'Simulator running...' -ForegroundColor Magenta
Write-Host 'Sending data to MQTT broker: test.mosquitto.org' -ForegroundColor Cyan
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow
python simulator.py
"@
Start-Service -Name "Simulator" -Path $simulatorPath -Command $simulatorCommand -Color "Magenta"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  - Backend:    http://localhost:8000" -ForegroundColor Green
Write-Host "  - API Docs:   http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  - Frontend:   http://localhost:5173" -ForegroundColor Blue
Write-Host "  - Simulator:  Running (sending data to MQTT)" -ForegroundColor Magenta
Write-Host ""
Write-Host "Note: Each service runs in a separate PowerShell window." -ForegroundColor Yellow
Write-Host "      Close each window individually to stop the service." -ForegroundColor Yellow
Write-Host ""

