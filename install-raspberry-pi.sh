#!/bin/bash
# Script Instalasi Otomatis untuk Raspberry Pi 4
# Script ini akan menginstall semua dependencies yang diperlukan

set -e  # Stop jika ada error

echo "=========================================="
echo "  Smart Incubator IoT - Setup Raspberry Pi"
echo "=========================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fungsi untuk print dengan warna
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Cek apakah script dijalankan sebagai root
if [ "$EUID" -eq 0 ]; then 
    print_warning "Jangan jalankan script ini sebagai root/sudo"
    print_info "Script akan meminta password saat diperlukan"
    exit 1
fi

# 1. Update sistem
print_info "Mengupdate sistem..."
sudo apt update
sudo apt upgrade -y
print_success "Sistem terupdate"

# 2. Install dependencies sistem
print_info "Menginstall dependencies sistem..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    git \
    build-essential \
    python3-dev \
    mosquitto \
    mosquitto-clients

print_success "Dependencies sistem terinstall"

# 3. Install Node.js 20
print_info "Menginstall Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js terinstall"
else
    NODE_VERSION=$(node --version)
    print_info "Node.js sudah terinstall: $NODE_VERSION"
fi

# Verifikasi Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"

# 4. Setup MQTT Broker (Mosquitto)
print_info "Mengkonfigurasi Mosquitto..."
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Buat config mosquitto jika belum ada
if [ ! -f /etc/mosquitto/mosquitto.conf.backup ]; then
    sudo cp /etc/mosquitto/mosquitto.conf /etc/mosquitto/mosquitto.conf.backup
fi

# Tambahkan config untuk allow anonymous (untuk development)
echo "" | sudo tee -a /etc/mosquitto/mosquitto.conf > /dev/null
echo "# Smart Incubator IoT Config" | sudo tee -a /etc/mosquitto/mosquitto.conf > /dev/null
echo "listener 1883 0.0.0.0" | sudo tee -a /etc/mosquitto/mosquitto.conf > /dev/null
echo "allow_anonymous true" | sudo tee -a /etc/mosquitto/mosquitto.conf > /dev/null

sudo systemctl restart mosquitto
print_success "Mosquitto dikonfigurasi dan berjalan"

# 5. Setup Backend
print_info "Mengsetup Backend..."
cd "$(dirname "$0")/backend" || exit 1

# Buat virtual environment jika belum ada
if [ ! -d "venv" ]; then
    print_info "Membuat virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment dibuat"
fi

# Aktifkan virtual environment
source venv/bin/activate

# Upgrade pip
print_info "Mengupgrade pip..."
pip install --upgrade pip

# Install Python dependencies
print_info "Menginstall Python dependencies..."
pip install -r requirements.txt

print_success "Backend dependencies terinstall"

# 6. Setup Frontend
print_info "Mengsetup Frontend..."
cd "../frontend" || exit 1

# Install Node.js dependencies
print_info "Menginstall Node.js dependencies..."
npm install

print_success "Frontend dependencies terinstall"

# 7. Build Frontend untuk production
print_info "Membangun Frontend untuk production..."
npm run build

print_success "Frontend berhasil di-build"

# 8. Kembali ke root directory
cd ..

# 9. Buat file .env untuk konfigurasi (opsional)
if [ ! -f .env ]; then
    print_info "Membuat file .env..."
    cat > .env << EOF
# MQTT Configuration
MQTT_BROKER=localhost
MQTT_PORT=1883

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
VITE_API_URL=http://localhost:8000
EOF
    print_success "File .env dibuat"
fi

# 10. Verifikasi instalasi
echo ""
echo "=========================================="
print_info "Verifikasi Instalasi..."
echo "=========================================="

# Cek Python
PYTHON_VERSION=$(python3 --version)
print_success "Python: $PYTHON_VERSION"

# Cek Node.js
NODE_VERSION=$(node --version)
print_success "Node.js: $NODE_VERSION"

# Cek npm
NPM_VERSION=$(npm --version)
print_success "npm: $NPM_VERSION"

# Cek Mosquitto
if systemctl is-active --quiet mosquitto; then
    print_success "Mosquitto: Running"
else
    print_error "Mosquitto: Not Running"
fi

# Cek Backend dependencies
cd backend
source venv/bin/activate
if python3 -c "import fastapi, uvicorn, paho.mqtt, sqlalchemy" 2>/dev/null; then
    print_success "Backend dependencies: OK"
else
    print_error "Backend dependencies: Missing"
fi
deactivate
cd ..

# Cek Frontend build
if [ -d "frontend/dist" ]; then
    print_success "Frontend build: OK"
else
    print_error "Frontend build: Missing"
fi

echo ""
echo "=========================================="
print_success "Instalasi Selesai!"
echo "=========================================="
echo ""
echo "Langkah selanjutnya:"
echo "1. Jalankan Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "2. Serve Frontend (di terminal lain):"
echo "   cd frontend"
echo "   sudo npm install -g serve"
echo "   sudo serve -s dist -l 80"
echo ""
echo "3. Atau gunakan nginx untuk production"
echo ""
echo "Akses aplikasi di: http://<IP_RASPBERRY_PI>"
echo ""

