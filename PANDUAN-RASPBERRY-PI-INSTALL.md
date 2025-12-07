# 🍓 Panduan Instalasi Otomatis di Raspberry Pi 4

## ✅ Kompatibilitas

**YA, semua akan berjalan lancar di Raspberry Pi 4!**

### Yang Kompatibel:
- ✅ **Python Code** - 100% kompatibel (Python adalah cross-platform)
- ✅ **React/Node.js Code** - 100% kompatibel (Node.js support ARM64)
- ✅ **SQLite Database** - Kompatibel cross-platform
- ✅ **Model ML (pickle)** - Kompatibel
- ✅ **Semua dependencies** - Support ARM64 architecture

### Yang Perlu Diperhatikan:
- ⚠️ **Dependencies** - Harus diinstall di Raspberry Pi (tidak bisa copy dari Windows)
- ⚠️ **Build Frontend** - Harus di-build di Raspberry Pi (atau copy folder `dist/`)
- ⚠️ **MQTT Broker** - Harus diinstall terpisah (Mosquitto)

## 🚀 Instalasi Otomatis (Recommended)

### 1. Copy Project ke Raspberry Pi

**Via USB:**
```bash
# Mount USB di Raspberry Pi
sudo mkdir -p /mnt/usb
sudo mount /dev/sda1 /mnt/usb  # Sesuaikan device

# Copy project
mkdir -p ~/smart-incubator-project
cp -r /mnt/usb/smart-incubator-iot-iot/* ~/smart-incubator-project/
cd ~/smart-incubator-project

# Unmount USB
sudo umount /mnt/usb
```

**Via SCP (dari Windows):**
```powershell
scp -r C:\xampp\htdocs\smart-incubator-iot-iot\* pi@<IP_RASPBERRY_PI>:~/smart-incubator-project/
```

**Via Git:**
```bash
cd ~
git clone <URL_REPOSITORY> smart-incubator-project
cd smart-incubator-project
```

### 2. Jalankan Script Instalasi Otomatis

```bash
# Berikan permission execute
chmod +x install-raspberry-pi.sh

# Jalankan script
./install-raspberry-pi.sh
```

Script ini akan:
- ✅ Update sistem
- ✅ Install Python 3, Node.js 20, dan dependencies
- ✅ Install dan konfigurasi Mosquitto (MQTT broker)
- ✅ Setup virtual environment untuk backend
- ✅ Install semua Python dependencies
- ✅ Install semua Node.js dependencies
- ✅ Build frontend untuk production
- ✅ Verifikasi semua instalasi

**Waktu instalasi:** ~10-15 menit (tergantung koneksi internet)

### 3. Jalankan Aplikasi

**Opsi A: Menggunakan Script Otomatis**
```bash
chmod +x start-raspberry-pi.sh
./start-raspberry-pi.sh
```

**Opsi B: Manual (Recommended untuk Production)**

**Terminal 1 - Backend:**
```bash
cd ~/smart-incubator-project/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd ~/smart-incubator-project/frontend
sudo serve -s dist -l 80
```

**Opsi C: Menggunakan Systemd (Auto-start saat boot)**

Buat service untuk backend:
```bash
sudo nano /etc/systemd/system/incubator-backend.service
```

Isi dengan:
```ini
[Unit]
Description=Smart Incubator Backend
After=network.target mosquitto.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart-incubator-project/backend
Environment="PATH=/home/pi/smart-incubator-project/backend/venv/bin"
ExecStart=/home/pi/smart-incubator-project/backend/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable incubator-backend
sudo systemctl start incubator-backend
```

## 📋 Manual Installation (Jika Script Gagal)

### 1. Update Sistem
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Python & Dependencies
```bash
sudo apt install -y python3 python3-pip python3-venv build-essential python3-dev
```

### 3. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Install Mosquitto
```bash
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

### 5. Setup Backend
```bash
cd ~/smart-incubator-project/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 6. Setup Frontend
```bash
cd ~/smart-incubator-project/frontend
npm install
npm run build
```

## 🔧 Konfigurasi

### MQTT Broker

Edit config Mosquitto:
```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan:
```
listener 1883 0.0.0.0
allow_anonymous true
```

Restart:
```bash
sudo systemctl restart mosquitto
```

### Backend MQTT

Backend akan otomatis connect ke `localhost` (atau `test.mosquitto.org` jika tidak ada MQTT lokal).

Untuk menggunakan MQTT lokal di Raspberry Pi:
- Backend sudah default ke `localhost` ✅
- Simulator/ESP32 harus connect ke IP Raspberry Pi

## 🌐 Akses Aplikasi

Setelah semua berjalan:
- **Frontend:** `http://<IP_RASPBERRY_PI>`
- **Backend API:** `http://<IP_RASPBERRY_PI>:8000`
- **API Docs:** `http://<IP_RASPBERRY_PI>:8000/docs`

## ✅ Checklist

Setelah instalasi, pastikan:
- [ ] Python 3.9+ terinstall
- [ ] Node.js 20+ terinstall
- [ ] Mosquitto running: `sudo systemctl status mosquitto`
- [ ] Backend dependencies terinstall
- [ ] Frontend dependencies terinstall
- [ ] Frontend di-build (`frontend/dist/` ada)
- [ ] Backend bisa diakses: `curl http://localhost:8000/docs`
- [ ] Frontend bisa diakses: `curl http://localhost`

## 🐛 Troubleshooting

### Script gagal di tengah jalan
```bash
# Jalankan lagi, script akan skip yang sudah terinstall
./install-raspberry-pi.sh
```

### Port 80 sudah digunakan
```bash
# Cek proses yang menggunakan port 80
sudo lsof -i :80

# Atau gunakan port lain
sudo serve -s dist -l 8080
```

### Backend tidak bisa connect ke MQTT
```bash
# Cek Mosquitto status
sudo systemctl status mosquitto

# Test MQTT
mosquitto_sub -h localhost -t "test" -v
```

### Permission denied
```bash
# Berikan permission
chmod +x install-raspberry-pi.sh
chmod +x start-raspberry-pi.sh
```

## 📝 Catatan Penting

1. **First Build** - Build pertama mungkin memakan waktu lebih lama
2. **Internet Required** - Script memerlukan koneksi internet untuk download dependencies
3. **ARM64 Compatible** - Semua dependencies support ARM64 (Raspberry Pi 4)
4. **Data Persistence** - Database dan model files akan tetap ada setelah restart

## 🎉 Selesai!

Setelah instalasi selesai, aplikasi siap digunakan di Raspberry Pi 4!

**Semua akan bekerja sama persis dengan di Windows karena Python dan Node.js adalah cross-platform!**

