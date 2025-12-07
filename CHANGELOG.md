# Changelog - Perbaikan untuk Raspberry Pi 4

## Perbaikan yang Dilakukan

### 1. Dockerfile.frontend
- ✅ **Upgrade Node.js**: Dari Node 18 ke Node 20 (kompatibel dengan Vite 7)
- **Alasan**: Vite 7 memerlukan Node.js 20.19+ atau 22.12+
- **File**: `Dockerfile.frontend`

### 2. Dockerfile.backend
- ✅ **Fix Debconf Warnings**: Menambahkan `DEBIAN_FRONTEND=noninteractive`
- ✅ **Optimasi Build**: Menambahkan cleanup apt cache untuk mengurangi ukuran image
- ✅ **ARM Compatibility**: Memastikan kompatibel dengan Raspberry Pi (ARM64)
- **File**: `Dockerfile.backend`

### 3. docker-compose.yml
- ✅ **MQTT Image Tag**: Menambahkan tag `2.0` untuk stabilitas
- ✅ **Health Check**: Menambahkan healthcheck untuk service MQTT
- ✅ **Environment Variables**: Menambahkan env vars untuk MQTT broker di backend
- ✅ **Service Dependencies**: Backend sekarang menunggu MQTT sehat sebelum start
- ✅ **Port Conflict Info**: Menambahkan komentar untuk alternatif port
- **File**: `docker-compose.yml`

### 4. backend/main.py
- ✅ **MQTT Broker Configuration**: Menggunakan service name "mqtt" dari Docker Compose
- ✅ **Environment Variables**: Support untuk `MQTT_BROKER` dan `MQTT_PORT` via env vars
- ✅ **Error Handling**: Menambahkan error handling untuk koneksi MQTT
- ✅ **Logging**: Menambahkan log untuk debugging koneksi MQTT
- **File**: `backend/main.py`

### 5. backend/requirements.txt
- ✅ **Missing Dependencies**: Menambahkan dependencies yang hilang:
  - `passlib[bcrypt]` - untuk password hashing
  - `python-jose[cryptography]` - untuk JWT tokens
  - `python-multipart` - untuk form data parsing
- **File**: `backend/requirements.txt`

### 6. mosquitto.conf
- ✅ **WebSocket Support**: Menambahkan konfigurasi listener untuk WebSocket (port 9001)
- ✅ **Network Binding**: Menambahkan binding ke 0.0.0.0 untuk semua interface
- **File**: `mosquitto.conf`

### 7. Dokumentasi
- ✅ **PANDUAN-INSTALASI.md**: Panduan instalasi lengkap dalam bahasa Indonesia
- ✅ **README-DOCKER.md**: Quick reference untuk troubleshooting
- ✅ **check-port.sh**: Script untuk mengecek dan mengatasi port conflict
- **Files**: `PANDUAN-INSTALASI.md`, `README-DOCKER.md`, `check-port.sh`

## Masalah yang Diperbaiki

### Error 1: Port 1883 Already in Use
**Error:**
```
ERROR: bind: address already in use (port 1883)
```

**Solusi:**
- Menambahkan script `check-port.sh` untuk otomatis cek dan kill proses
- Menambahkan instruksi di dokumentasi untuk menggunakan port alternatif
- Menambahkan komentar di docker-compose.yml

### Error 2: Node.js Version Mismatch
**Error:**
```
Vite requires Node.js version 20.19+ or 22.12+
You are using Node.js 18.20.8
```

**Solusi:**
- Upgrade Dockerfile.frontend dari `node:18-alpine` ke `node:20-alpine`

### Error 3: Debconf Warnings
**Warning:**
```
debconf: unable to initialize frontend: Dialog
debconf: unable to initialize frontend: Readline
```

**Solusi:**
- Menambahkan `ENV DEBIAN_FRONTEND=noninteractive` di Dockerfile.backend
- Menambahkan cleanup apt cache

### Error 4: Missing Python Dependencies
**Potential Error:**
- Backend mungkin error saat import `passlib` atau `jose`

**Solusi:**
- Menambahkan semua dependencies yang diperlukan ke requirements.txt

### Error 5: MQTT Connection Issues
**Potential Error:**
- Backend tidak bisa connect ke MQTT broker

**Solusi:**
- Mengubah MQTT_BROKER dari "test.mosquitto.org" ke "mqtt" (service name)
- Menambahkan environment variables untuk konfigurasi fleksibel
- Menambahkan healthcheck dan service dependencies

## Testing Checklist

Setelah perbaikan, pastikan:

- [ ] Build berhasil tanpa error: `docker-compose up -d --build`
- [ ] Semua container running: `docker-compose ps`
- [ ] Frontend bisa diakses: `http://<raspberry-pi-ip>`
- [ ] Backend API bisa diakses: `http://<raspberry-pi-ip>/api/docs`
- [ ] MQTT broker running: `docker-compose logs mqtt`
- [ ] Backend bisa connect ke MQTT: `docker-compose logs backend | grep MQTT`
- [ ] Tidak ada debconf warnings saat build
- [ ] Tidak ada Node.js version warnings saat build frontend

## Catatan Penting

1. **Port 1883**: Jika masih error, gunakan script `check-port.sh` atau ubah port di docker-compose.yml
2. **First Build**: Build pertama mungkin memakan waktu lebih lama karena download images
3. **ARM Architecture**: Semua images sudah kompatibel dengan ARM64 (Raspberry Pi 4)
4. **Data Persistence**: Database dan model files akan persist setelah restart container

## Versi

- **Date**: 2025-01-27
- **Target**: Raspberry Pi 4 (ARM64)
- **Docker Compose**: 3.8
- **Python**: 3.9
- **Node.js**: 20
- **MQTT**: Eclipse Mosquitto 2.0

