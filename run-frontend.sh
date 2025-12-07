#!/bin/bash
# Script untuk menjalankan Frontend di Linux/Mac/Raspberry Pi

echo "Starting Frontend Development Server..."
cd frontend

# Install dependencies jika belum ada
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Jalankan dev server
echo "Frontend running on http://localhost:5173"
npm run dev

