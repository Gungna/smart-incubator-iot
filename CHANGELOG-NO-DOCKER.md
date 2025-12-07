# Changelog - Migrasi dari Docker ke Local Development

## 🎯 Perubahan Besar

Project sekarang **tidak menggunakan Docker** lagi. Semua komponen dijalankan langsung di sistem operasi.

## ✅ File yang Dihapus

- ❌ `docker-compose.yml` - Tidak diperlukan lagi
- ❌ `Dockerfile.backend` - Tidak diperlukan lagi
- ❌ `Dockerfile.frontend` - Tidak diperlukan lagi
- ❌ `mosquitto.conf` - Konfigurasi MQTT sekarang di sistem
- ❌ `check-port.sh` - Tidak diperlukan
- ❌ `README-DOCKER.md` - Diganti dengan README.md baru
- ❌ `SETUP-RASPBERRY-PI.md` - Diganti dengan PANDUAN-RASPBERRY-PI.md

## ✅ File yang Ditambahkan

- ✅ `run-backend.bat` - Script run backend untuk Windows
- ✅ `run-backend.sh` - Script run backend untuk Linux/Mac/Raspberry Pi
- ✅ `run-frontend.bat` - Script run frontend untuk Windows
- ✅ `run-frontend.sh` - Script run frontend untuk Linux/Mac/Raspberry Pi
- ✅ `start-backend.py` - Alternative script untuk start backend
- ✅ `PANDUAN-RASPBERRY-PI.md` - Panduan lengkap setup di Raspberry Pi
- ✅ `.gitignore` - File untuk ignore file yang tidak perlu di commit

## ✅ File yang Diupdate

### backend/main.py
- ✅ MQTT_BROKER default diubah dari `"mqtt"` (Docker service) ke `"localhost"`
- ✅ Support environment variable untuk fleksibilitas

### frontend/src/App.jsx
- ✅ API_URL sekarang menggunakan environment variable atau default ke `/api` (dev) atau `http://localhost:8000` (prod)
- ✅ Support proxy dari Vite untuk development

### frontend/vite.config.js
- ✅ Ditambahkan proxy configuration untuk `/api` → `http://localhost:8000`

### README.md
- ✅ Diupdate dengan instruksi setup tanpa Docker
- ✅ Menambahkan informasi tentang kompatibilitas Windows ↔ Raspberry Pi

### PANDUAN-INSTALASI.md
- ✅ Diupdate untuk setup local development
- ✅ Menghapus semua referensi Docker

## 🔄 Perubahan Workflow

### Sebelum (Docker):
```bash
docker-compose up -d --build
```

### Sekarang (Local):
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # atau venv\Scripts\activate di Windows
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (terminal lain)
cd frontend
npm install
npm run dev
```

## ✅ Keuntungan Setup Baru

1. **Lebih Mudah Development** - Tidak perlu build Docker image setiap kali
2. **Lebih Cepat** - Hot reload langsung tanpa rebuild container
3. **Lebih Fleksibel** - Bisa debug langsung dengan IDE
4. **Kompatibel Cross-Platform** - Code Python dan React kompatibel 100%
5. **Lebih Ringan** - Tidak perlu install Docker

## ⚠️ Yang Perlu Diperhatikan

1. **MQTT Broker** - Harus diinstall terpisah (Mosquitto)
2. **Dependencies** - Harus diinstall di masing-masing platform
3. **Environment Variables** - Bisa digunakan untuk konfigurasi

## 📝 Migration Guide

Jika Anda sudah menggunakan Docker sebelumnya:

1. **Stop semua container:**
   ```bash
   docker-compose down
   ```

2. **Hapus Docker images (opsional):**
   ```bash
   docker rmi smart-incubator-iot_backend smart-incubator-iot_frontend
   ```

3. **Install MQTT Broker:**
   - Windows: Download dari mosquitto.org
   - Linux: `sudo apt install mosquitto`
   - Mac: `brew install mosquitto`

4. **Setup local environment:**
   - Ikuti instruksi di README.md

## 🎉 Hasil

Project sekarang lebih mudah untuk:
- ✅ Development di local
- ✅ Deploy ke Raspberry Pi
- ✅ Maintenance dan update
- ✅ Debugging

**Semua logika dan UI tetap sama, hanya cara menjalankannya yang berubah!**

