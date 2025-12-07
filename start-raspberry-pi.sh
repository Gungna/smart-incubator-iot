#!/bin/bash
# Script untuk menjalankan aplikasi di Raspberry Pi
# Script ini akan start backend dan serve frontend

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Smart Incubator IoT...${NC}"

# Cek apakah di direktori yang benar
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${YELLOW}⚠️  Pastikan Anda di root directory project${NC}"
    exit 1
fi

# Start Backend
echo -e "${GREEN}📦 Starting Backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment tidak ditemukan. Jalankan install-raspberry-pi.sh terlebih dahulu${NC}"
    exit 1
fi

source venv/bin/activate

# Start backend di background
echo -e "${GREEN}✅ Backend running on http://0.0.0.0:8000${NC}"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Tunggu backend start
sleep 3

# Serve Frontend
echo -e "${GREEN}🌐 Starting Frontend...${NC}"
cd frontend

if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Frontend belum di-build. Building now...${NC}"
    npm run build
fi

# Cek apakah serve terinstall
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}⚠️  'serve' tidak ditemukan. Installing...${NC}"
    sudo npm install -g serve
fi

echo -e "${GREEN}✅ Frontend running on http://0.0.0.0:80${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Trap untuk cleanup saat Ctrl+C
trap "kill $BACKEND_PID; exit" INT TERM

# Serve frontend (blocking)
sudo serve -s dist -l 80

