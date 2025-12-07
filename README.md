# 🐣 Smart Incubator IoT Project

Sistem monitoring dan kontrol inkubator telur berbasis IoT dengan AI untuk prediksi kondisi optimal.

## 📋 Fitur

- ✅ Monitoring suhu dan kelembapan real-time
- ✅ Kontrol otomatis (lampu, kipas, mist, servo)
- ✅ Prediksi kondisi dengan Machine Learning
- ✅ Dashboard web modern dengan React
- ✅ API REST dengan FastAPI
- ✅ Integrasi MQTT untuk komunikasi dengan ESP32
- ✅ Notifikasi Telegram

## 🚀 Quick Start (Local Development)

### Prerequisites

- Python 3.9+ 
- Node.js 18+ (disarankan 20+)
- MQTT Broker (Mosquitto) - untuk komunikasi dengan ESP32

### 1. Install MQTT Broker (Mosquitto)

**Windows:**
- Download dari: https://mosquitto.org/download/
- Atau install via Chocolatey: `choco install mosquitto`

**Linux/Mac/Raspberry Pi:**
```bash
sudo apt install mosquitto mosquitto-clients  # Debian/Ubuntu
brew install mosquitto  # Mac
```

**Verifikasi MQTT berjalan:**
```bash
# Windows
netstat -an | findstr 1883

# Linux/Mac
sudo systemctl status mosquitto
```

### 2. Setup Backend

**Windows (PowerShell):**
```powershell
.\run-backend.ps1
```

**Windows (Command Prompt):**
```cmd
.\run-backend.bat
```

**Linux/Mac/Raspberry Pi:**
```bash
chmod +x run-backend.sh
./run-backend.sh
```

**Manual:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau: venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend akan berjalan di: http://localhost:8000

### 3. Setup Frontend

**Windows (PowerShell):**
```powershell
.\run-frontend.ps1
```

**Windows (Command Prompt):**
```cmd
.\run-frontend.bat
```

**Linux/Mac/Raspberry Pi:**
```bash
chmod +x run-frontend.sh
./run-frontend.sh
```

**Manual:**
```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di: http://localhost:5173

### 4. Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📱 Deploy ke Raspberry Pi

### ✅ Kompatibilitas

**YA, semua akan berjalan lancar di Raspberry Pi 4!**

- ✅ Python code 100% kompatibel
- ✅ React/Node.js code 100% kompatibel  
- ✅ Semua dependencies support ARM64
- ✅ Database dan model files kompatibel

### 🚀 Instalasi Otomatis (Recommended)

1. **Copy project ke Raspberry Pi** (via USB, SCP, atau Git)

2. **Jalankan script instalasi otomatis:**
```bash
chmod +x install-raspberry-pi.sh
./install-raspberry-pi.sh
```

Script ini akan menginstall semua dependencies secara otomatis:
- ✅ Python 3, Node.js 20, dan dependencies sistem
- ✅ Mosquitto (MQTT broker) dengan konfigurasi
- ✅ Backend dependencies (Python packages)
- ✅ Frontend dependencies (npm packages)
- ✅ Build frontend untuk production

**Waktu instalasi:** ~10-15 menit

3. **Jalankan aplikasi:**
```bash
chmod +x start-raspberry-pi.sh
./start-raspberry-pi.sh
```

Atau manual:
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
sudo serve -s dist -l 80
```

### 📖 Panduan Lengkap

Lihat **[PANDUAN-RASPBERRY-PI-INSTALL.md](PANDUAN-RASPBERRY-PI-INSTALL.md)** untuk:
- Instalasi manual step-by-step
- Konfigurasi systemd untuk auto-start
- Troubleshooting
- Konfigurasi MQTT untuk ESP32

## 🔧 Konfigurasi

### Environment Variables

**Backend:**
- `MQTT_BROKER` - Alamat MQTT broker (default: localhost)
- `MQTT_PORT` - Port MQTT (default: 1883)

**Frontend:**
- `VITE_API_URL` - URL backend API (default: /api untuk dev, http://localhost:8000 untuk prod)

### MQTT Topics

- `inkubator/data` - Data sensor dari ESP32
- `inkubator/action` - Perintah kontrol ke ESP32
- `inkubator/heartbeat` - Heartbeat signal

## 📁 Struktur Project

```
smart-incubator-iot/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── incubator.db        # SQLite database
│   ├── model_incubator.pkl # ML model
│   └── label_encoder.pkl   # Label encoder
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── run-backend.bat/sh      # Script run backend
├── run-frontend.bat/sh     # Script run frontend
└── README.md
```

## 🐛 Troubleshooting

### Backend tidak bisa connect ke MQTT

1. Pastikan Mosquitto berjalan:
   ```bash
   # Windows
   netstat -an | findstr 1883
   
   # Linux
   sudo systemctl status mosquitto
   ```

2. Test koneksi MQTT:
   ```bash
   mosquitto_sub -h localhost -t "test"
   ```

3. Cek environment variable `MQTT_BROKER`

### Frontend tidak bisa akses Backend

1. Pastikan backend running di port 8000
2. Cek CORS settings di backend
3. Untuk production, set `VITE_API_URL` environment variable

### Port sudah digunakan

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux
sudo lsof -i :8000
sudo kill -9 <PID>
```

## 📝 Catatan Penting

### Kompatibilitas Windows vs Raspberry Pi

✅ **Akan bekerja sama:**
- Python code (backend) - kompatibel cross-platform
- React code (frontend) - kompatibel cross-platform
- Database SQLite - kompatibel cross-platform
- Model ML (pickle files) - kompatibel

⚠️ **Perlu perhatian:**
- **Node.js version**: Pastikan versi yang sama (disarankan 20+)
- **Python version**: Pastikan versi yang sama (3.9+)
- **Dependencies**: Install ulang di Raspberry Pi (`pip install -r requirements.txt` dan `npm install`)
- **Build frontend**: Build di masing-masing platform atau build sekali dan copy `dist/` folder
- **MQTT Broker**: Harus diinstall terpisah di Raspberry Pi

### Rekomendasi Workflow

1. **Development di Windows:**
   - Develop dan test di local
   - Pastikan semua fitur bekerja

2. **Deploy ke Raspberry Pi:**
   - Copy seluruh project folder
   - Install dependencies di Raspberry Pi
   - Build frontend di Raspberry Pi (atau copy `dist/` dari Windows)
   - Setup MQTT broker
   - Jalankan backend dan serve frontend

3. **Production:**
   - Gunakan systemd untuk auto-start backend
   - Gunakan nginx untuk serve frontend
   - Setup firewall untuk keamanan

## 📚 Dokumentasi API

Lihat dokumentasi lengkap di: http://localhost:8000/docs (saat backend running)

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk perbaikan.

## 📄 License

MIT License
