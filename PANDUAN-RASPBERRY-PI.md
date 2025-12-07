# 🍓 Panduan Setup di Raspberry Pi 4 (Tanpa Docker)

## ✅ Jawaban: Apakah akan bekerja sama dengan di Windows?

**YA, akan bekerja sama!** Dengan catatan:

### ✅ Yang Kompatibel (Akan Bekerja Sama):
1. **Python Code (Backend)** - ✅ Kompatibel 100%
2. **React Code (Frontend)** - ✅ Kompatibel 100%
3. **Database SQLite** - ✅ Kompatibel cross-platform
4. **Model ML (pickle files)** - ✅ Kompatibel
5. **Logika aplikasi** - ✅ Sama persis

### ⚠️ Yang Perlu Diperhatikan:
1. **Dependencies** - Harus diinstall ulang di Raspberry Pi
2. **Node.js version** - Pastikan versi yang sama (20+)
3. **Python version** - Pastikan versi yang sama (3.9+)
4. **Build frontend** - Bisa build di Windows dan copy `dist/`, atau build di Raspberry Pi
5. **MQTT Broker** - Harus diinstall terpisah di Raspberry Pi

### 💡 Rekomendasi Workflow:
1. **Develop di Windows** → Test semua fitur
2. **Copy ke Raspberry Pi via USB** → Install dependencies → Run
3. **Hasil akan sama** karena code Python dan React kompatibel cross-platform

---

## 📋 Langkah Setup di Raspberry Pi

### 1. Persiapan Sistem

```bash
# Update sistem
sudo apt update
sudo apt upgrade -y

# Install tools dasar
sudo apt install -y git curl wget
```

### 2. Install Python 3.9+

```bash
# Cek versi Python (harus 3.9+)
python3 --version

# Install pip dan venv jika belum ada
sudo apt install -y python3-pip python3-venv
```

### 3. Install Node.js 20+

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node --version  # Harus 20.x atau lebih
npm --version
```

### 4. Install MQTT Broker (Mosquitto)

```bash
# Install Mosquitto
sudo apt install -y mosquitto mosquitto-clients

# Enable dan start service
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Verifikasi berjalan
sudo systemctl status mosquitto
```

### 5. Konfigurasi Mosquitto

```bash
# Edit config
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan di akhir file:
```
listener 1883 0.0.0.0
allow_anonymous true
```

Restart:
```bash
sudo systemctl restart mosquitto
```

Test MQTT:
```bash
# Terminal 1: Subscribe
mosquitto_sub -h localhost -t "test"

# Terminal 2: Publish
mosquitto_pub -h localhost -t "test" -m "Hello"
```

### 6. Copy Project ke Raspberry Pi

**Via USB Flash Drive:**

```bash
# Mount USB (jika belum auto-mount)
sudo mkdir -p /mnt/usb
sudo mount /dev/sda1 /mnt/usb  # Sesuaikan device

# Copy project
mkdir -p ~/smart-incubator-project
cp -r /mnt/usb/smart-incubator-iot-iot/* ~/smart-incubator-project/

# Unmount
sudo umount /mnt/usb
```

**Via SCP (dari Windows):**

```powershell
# Di Windows PowerShell
scp -r C:\xampp\htdocs\smart-incubator-iot-iot\* pi@<IP_RASPBERRY_PI>:~/smart-incubator-project/
```

**Via Git (jika menggunakan Git):**

```bash
cd ~
git clone <URL_REPOSITORY> smart-incubator-project
cd smart-incubator-project
```

### 7. Setup Backend

```bash
cd ~/smart-incubator-project/backend

# Buat virtual environment
python3 -m venv venv

# Aktifkan
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test run (Ctrl+C untuk stop)
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Verifikasi:**
- Buka browser di komputer lain: `http://<IP_RASPBERRY_PI>:8000/docs`
- Harus muncul dokumentasi API

### 8. Setup Frontend

**Opsi A: Development Mode (untuk testing)**

```bash
cd ~/smart-incubator-project/frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

**Opsi B: Production Mode (Recommended)**

```bash
cd ~/smart-incubator-project/frontend

# Install dependencies
npm install

# Build untuk production
npm run build

# Install serve untuk serve static files
sudo npm install -g serve

# Serve di port 80
sudo serve -s dist -l 80
```

**Opsi C: Menggunakan Nginx (Paling Recommended untuk Production)**

```bash
# Install nginx
sudo apt install -y nginx

# Copy build files
sudo cp -r ~/smart-incubator-project/frontend/dist/* /var/www/html/

# Edit nginx config untuk proxy API
sudo nano /etc/nginx/sites-available/default
```

Tambahkan di dalam `server { ... }`:
```nginx
location /api/ {
    proxy_pass http://localhost:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Restart nginx:
```bash
sudo systemctl restart nginx
```

### 9. Setup Auto-Start (Systemd Service)

Buat service untuk auto-start backend:

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

# Cek status
sudo systemctl status incubator-backend
```

### 10. Verifikasi Semua Berjalan

```bash
# Cek backend
curl http://localhost:8000/docs

# Cek frontend
curl http://localhost

# Cek MQTT
mosquitto_sub -h localhost -t "inkubator/data" -v

# Cek semua service
sudo systemctl status mosquitto
sudo systemctl status incubator-backend
sudo systemctl status nginx
```

## 🔧 Konfigurasi ESP32

Pastikan ESP32 dikonfigurasi untuk connect ke:
- **Broker:** IP Raspberry Pi (contoh: `192.168.1.100`)
- **Port:** `1883`
- **Topics:**
  - Publish: `inkubator/data`
  - Subscribe: `inkubator/action`, `inkubator/heartbeat`

## 📊 Monitoring

### Lihat Logs Backend

```bash
# Jika menggunakan systemd
sudo journalctl -u incubator-backend -f

# Jika manual
cd ~/smart-incubator-project/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Cek Resource Usage

```bash
# CPU dan Memory
htop

# Disk space
df -h

# Network
ifconfig
```

## 🐛 Troubleshooting

### Backend tidak start

```bash
# Cek error
sudo journalctl -u incubator-backend -n 50

# Test manual
cd ~/smart-incubator-project/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend tidak bisa akses Backend

1. Pastikan backend running: `curl http://localhost:8000/docs`
2. Cek firewall: `sudo ufw status`
3. Cek nginx config: `sudo nginx -t`

### MQTT tidak connect

```bash
# Test MQTT
mosquitto_sub -h localhost -t "test" -v

# Cek config
cat /etc/mosquitto/mosquitto.conf

# Restart
sudo systemctl restart mosquitto
```

### Port sudah digunakan

```bash
# Cek port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

## ✅ Checklist Setup

- [ ] Python 3.9+ terinstall
- [ ] Node.js 20+ terinstall
- [ ] Mosquitto terinstall dan running
- [ ] Project ter-copy ke Raspberry Pi
- [ ] Backend dependencies terinstall
- [ ] Frontend dependencies terinstall
- [ ] Backend bisa diakses (http://IP:8000/docs)
- [ ] Frontend bisa diakses (http://IP)
- [ ] MQTT broker bisa diakses
- [ ] ESP32 bisa connect ke MQTT
- [ ] Systemd service setup (opsional)

## 🎉 Selesai!

Aplikasi sekarang berjalan di Raspberry Pi dan akan bekerja **sama persis** dengan di Windows!

**Akses aplikasi:**
- Frontend: `http://<IP_RASPBERRY_PI>`
- Backend API: `http://<IP_RASPBERRY_PI>:8000`
- API Docs: `http://<IP_RASPBERRY_PI>:8000/docs`

