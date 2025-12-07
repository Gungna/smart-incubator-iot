# 📘 Panduan Instalasi Smart Incubator IoT

> ⚠️ **CATATAN:** Project ini sekarang menggunakan setup **tanpa Docker** untuk kemudahan development dan deployment.

## 📋 Daftar Isi
1. [Setup Local (Windows/Linux/Mac)](#setup-local-windowslinuxmac)
2. [Setup Raspberry Pi](#setup-raspberry-pi)
3. [Troubleshooting](#troubleshooting)

---

## 🖥️ Setup Local (Windows/Linux/Mac)

### Prerequisites

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **MQTT Broker (Mosquitto)** - Lihat instruksi di bawah

### 1. Install MQTT Broker (Mosquitto)

**Windows:**
- Download dari: https://mosquitto.org/download/
- Atau via Chocolatey: `choco install mosquitto`
- Jalankan sebagai service atau manual: `mosquitto -v`

**Linux (Ubuntu/Debian):**
```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**Mac:**
```bash
brew install mosquitto
brew services start mosquitto
```

**Verifikasi MQTT berjalan:**
```bash
# Windows
netstat -an | findstr 1883

# Linux/Mac
sudo systemctl status mosquitto
# atau
mosquitto_sub -h localhost -t "test" -v
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

**Linux/Mac:**
```bash
chmod +x run-backend.sh
./run-backend.sh
```

**Manual:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend akan berjalan di: **http://localhost:8000**

### 3. Setup Frontend

**Windows (PowerShell):**
```powershell
.\run-frontend.ps1
```

**Windows (Command Prompt):**
```cmd
.\run-frontend.bat
```

**Linux/Mac:**
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

Frontend akan berjalan di: **http://localhost:5173**

### 4. Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Login pertama kali:**
1. Klik "Register" untuk membuat akun
2. Login dengan akun yang baru dibuat

---

## 🍓 Setup Raspberry Pi

> 📖 **Panduan lengkap:** Lihat [PANDUAN-RASPBERRY-PI.md](PANDUAN-RASPBERRY-PI.md)

### Quick Start

1. **Copy project ke Raspberry Pi** (via USB, SCP, atau Git)
2. **Install dependencies:**
   ```bash
   # Python
   sudo apt install python3 python3-pip python3-venv
   
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # MQTT
   sudo apt install mosquitto mosquitto-clients
   ```

3. **Setup dan jalankan:**
   ```bash
   # Backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   
   # Frontend (di terminal lain)
   cd frontend
   npm install
   npm run build
   sudo serve -s dist -l 80
   ```

### ✅ Kompatibilitas Windows ↔ Raspberry Pi

**YA, akan bekerja sama!** 

- ✅ Python code kompatibel 100%
- ✅ React code kompatibel 100%
- ✅ Database SQLite kompatibel
- ✅ Model ML kompatibel

**Yang perlu dilakukan:**
- Install dependencies di masing-masing platform
- Build frontend di masing-masing platform (atau copy `dist/` folder)

---

## 🐛 Troubleshooting

### Backend tidak bisa connect ke MQTT

**Gejala:**
```
Failed to connect to MQTT broker
```

**Solusi:**
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

3. Set environment variable:
   ```bash
   # Windows
   set MQTT_BROKER=localhost
   
   # Linux/Mac
   export MQTT_BROKER=localhost
   ```

### Frontend tidak bisa akses Backend

**Gejala:**
- Error di browser console tentang CORS atau connection refused

**Solusi:**
1. Pastikan backend running: `curl http://localhost:8000/docs`
2. Cek apakah backend di port 8000
3. Untuk production, set `VITE_API_URL` environment variable

### Port sudah digunakan

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Module not found (Python)

```bash
# Pastikan virtual environment aktif
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows

# Install ulang dependencies
pip install -r requirements.txt
```

### npm install error

```bash
# Clear cache
npm cache clean --force

# Delete node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Build frontend error

```bash
# Pastikan Node.js version 20+
node --version

# Update Node.js jika perlu
# Windows: Download dari nodejs.org
# Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

---

## 📝 Environment Variables

### Backend

- `MQTT_BROKER` - Alamat MQTT broker (default: localhost)
- `MQTT_PORT` - Port MQTT (default: 1883)

### Frontend

- `VITE_API_URL` - URL backend API
  - Development: tidak perlu set (menggunakan proxy)
  - Production: set ke `http://<IP_BACKEND>:8000`

---

## 🔧 Konfigurasi MQTT

### Default Topics

- `inkubator/data` - Data sensor dari ESP32
- `inkubator/action` - Perintah kontrol ke ESP32  
- `inkubator/heartbeat` - Heartbeat signal

### Format Data dari ESP32

```json
{
  "temp": 37.5,
  "hum": 55.0
}
```

### Test MQTT

```bash
# Subscribe ke topic
mosquitto_sub -h localhost -t "inkubator/data" -v

# Publish test data
mosquitto_pub -h localhost -t "inkubator/data" -m '{"temp":37.5,"hum":55.0}'
```

---

## 📚 Dokumentasi Lengkap

- **README.md** - Overview dan quick start
- **PANDUAN-RASPBERRY-PI.md** - Setup detail untuk Raspberry Pi
- **API Docs** - http://localhost:8000/docs (saat backend running)

---

## ✅ Checklist Setup

### Local Development:
- [ ] Python 3.9+ terinstall
- [ ] Node.js 20+ terinstall
- [ ] Mosquitto terinstall dan running
- [ ] Backend dependencies terinstall
- [ ] Frontend dependencies terinstall
- [ ] Backend running di port 8000
- [ ] Frontend running di port 5173
- [ ] Bisa akses http://localhost:5173

### Raspberry Pi:
- [ ] Semua prerequisites terinstall
- [ ] Project ter-copy ke Raspberry Pi
- [ ] Backend running
- [ ] Frontend di-build dan di-serve
- [ ] MQTT broker running
- [ ] ESP32 bisa connect ke MQTT

---

**Selamat! Aplikasi Smart Incubator IoT siap digunakan! 🎉**
