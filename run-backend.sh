#!/bin/bash
# Script untuk menjalankan Backend di Linux/Mac/Raspberry Pi

echo "Starting Backend Server..."
cd backend

# Cek apakah virtual environment ada
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Aktifkan virtual environment
source venv/bin/activate

# Install dependencies jika belum ada
if [ ! -f "venv/lib/python3.*/site-packages/fastapi/__init__.py" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Jalankan server
echo "Backend running on http://localhost:8000"
echo "Press Ctrl+C to stop"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

