# 🐣 Smart Incubator IoT - Rilis Beta v1.0.0-beta

## 📖 Tentang Proyek

**Smart Incubator IoT** adalah sistem monitoring dan kontrol inkubator telur berbasis Internet of Things (IoT) yang dilengkapi dengan kecerdasan buatan (AI) untuk memprediksi dan mengoptimalkan kondisi lingkungan inkubator secara otomatis. Sistem ini dirancang untuk membantu peternak dalam proses penetasan telur dengan efisiensi tinggi dan tingkat keberhasilan yang lebih baik.

---

## ✨ Fitur Utama

### 1. 📊 Monitoring Real-Time
- **Monitoring Suhu dan Kelembapan**: Sistem membaca data sensor DHT22 setiap 2 detik dan menampilkannya secara real-time di dashboard web
- **Grafik Historis**: Visualisasi data suhu dan kelembapan dalam bentuk grafik area yang dapat di-scroll untuk melihat tren historis
- **Status AI**: Prediksi kondisi inkubator menggunakan Machine Learning (Normal, Warning, Danger)
- **Heartbeat Monitoring**: Sistem memantau status koneksi ESP32 secara real-time

### 2. 🤖 Kontrol Otomatis Cerdas
- **Kontrol Suhu Otomatis**:
  - Saat suhu terlalu tinggi (> target + 0.5°C): Lampu OFF + Kipas ON untuk mendinginkan
  - Saat suhu terlalu rendah (< target - 0.2°C): Kipas OFF + Lampu ON untuk menghangatkan
  - Saat suhu optimal: Lampu ON + Kipas OFF untuk mempertahankan suhu
- **Kontrol Kelembapan Otomatis**: Sistem dapat mengaktifkan MIST/Sprayer saat kelembapan di bawah target
- **Putar Telur Otomatis**: Motor/Servo berputar secara otomatis sesuai interval yang ditentukan (default: 2 jam untuk ayam, 3 jam untuk bebek)
- **Maintenance Mode**: Mode khusus untuk maintenance yang mematikan semua aktuator

### 3. 🧠 Kecerdasan Buatan (AI/ML)
- **Prediksi Kondisi**: Model Machine Learning memprediksi status inkubator (Normal, Warning, Danger) berdasarkan suhu dan kelembapan
- **Optimasi Otomatis**: Sistem menggunakan prediksi AI untuk mengambil keputusan kontrol yang optimal
- **Model Terlatih**: Menggunakan model yang sudah dilatih dengan data historis untuk akurasi tinggi

### 4. 🎛️ Dashboard Web Modern
- **Interface Modern**: Dashboard web yang responsif dan modern menggunakan React dengan Tailwind CSS
- **Real-Time Updates**: Data diperbarui secara real-time tanpa perlu refresh halaman
- **Visualisasi Data**: Grafik interaktif untuk monitoring suhu dan kelembapan
- **Kontrol Manual**: Fitur untuk mengontrol aktuator secara manual dari dashboard
- **Pengaturan Preset**: Sistem preset untuk berbagai jenis telur (Ayam, Bebek, dll)
- **Kalibrasi Sensor**: Fitur offset untuk kalibrasi sensor suhu dan kelembapan
- **Autentikasi**: Sistem login/register dengan JWT token untuk keamanan

### 5. 📡 Integrasi IoT dengan ESP32
- **Komunikasi MQTT**: Sistem menggunakan protokol MQTT untuk komunikasi real-time antara backend dan ESP32
- **Kontrol Aktuator**: Kontrol lampu, kipas, motor/servo melalui MQTT
- **Data Sensor**: Menerima data sensor dari ESP32 secara real-time
- **Heartbeat Signal**: Monitoring status online/offline ESP32
- **Test Mode**: Mode testing untuk menguji semua aktuator

### 6. 🔔 Notifikasi Telegram
- **Alert Otomatis**: Sistem mengirim notifikasi Telegram saat kondisi inkubator dalam status "Danger"
- **Monitoring Jarak Jauh**: Dapat memantau status inkubator dari mana saja melalui Telegram
- **Rate Limiting**: Sistem membatasi pengiriman notifikasi (maksimal 1 notifikasi per 10 menit) untuk menghindari spam

### 7. 💾 Penyimpanan Data
- **Database SQLite**: Menyimpan semua data sensor secara historis
- **Logging Lengkap**: Setiap pembacaan sensor disimpan dengan timestamp
- **Preset Management**: Sistem preset dapat disimpan dan di-load kembali
- **User Management**: Sistem manajemen user dengan autentikasi

### 8. 🔧 API REST dengan FastAPI
- **API Dokumentasi**: Dokumentasi API otomatis menggunakan Swagger UI di `/docs`
- **RESTful API**: API yang mengikuti standar REST untuk integrasi mudah
- **CORS Support**: Mendukung Cross-Origin Resource Sharing untuk frontend
- **JWT Authentication**: Autentikasi menggunakan JSON Web Token
- **Error Handling**: Penanganan error yang baik dengan pesan yang jelas

---

## 🛠️ Teknologi yang Digunakan

### Backend
- **Python 3.9+**: Bahasa pemrograman utama
- **FastAPI**: Framework web modern dan cepat untuk API
- **SQLAlchemy**: ORM untuk manajemen database
- **SQLite**: Database untuk penyimpanan data
- **Paho MQTT**: Client MQTT untuk komunikasi dengan ESP32
- **Joblib**: Untuk load model Machine Learning
- **Pandas**: Untuk manipulasi data
- **JWT**: Untuk autentikasi
- **Bcrypt**: Untuk hashing password

### Frontend
- **React**: Framework JavaScript untuk UI
- **Vite**: Build tool yang cepat
- **Tailwind CSS**: Framework CSS untuk styling modern
- **Recharts**: Library untuk visualisasi grafik
- **React Router**: Untuk routing
- **Axios**: Untuk HTTP requests
- **React Hot Toast**: Untuk notifikasi

### Hardware & IoT
- **ESP32**: Mikrokontroler untuk sensor dan aktuator
- **DHT22**: Sensor suhu dan kelembapan
- **Relay Module**: Untuk kontrol aktuator (lampu, kipas, motor)
- **MQTT Broker (Mosquitto)**: Server MQTT untuk komunikasi

### Machine Learning
- **Scikit-learn**: Framework untuk Machine Learning
- **Model Terlatih**: Model prediksi kondisi inkubator

---

## 🎯 Kemampuan Sistem

### Kontrol Aktuator
1. **Lampu (RELAY1)**: Kontrol ON/OFF untuk menghangatkan inkubator
2. **Motor/Servo (RELAY2)**: Kontrol untuk memutar telur secara otomatis
3. **Kipas (RELAY3)**: Kontrol ON/OFF untuk mendinginkan inkubator
4. **MIST/Sprayer**: Kontrol untuk meningkatkan kelembapan (opsional)

### Preset yang Tersedia
- **Preset AYAM**: 
  - Suhu: 37.5°C - 38.0°C
  - Kelembapan: 50.0%
  - Interval Putar Telur: 2 jam (7200 detik)
- **Preset BEBEK**:
  - Suhu: 37.0°C - 37.5°C
  - Kelembapan: 60.0%
  - Interval Putar Telur: 3 jam (10800 detik)
- **Preset Custom**: Dapat membuat preset sendiri dengan parameter yang disesuaikan

### Fitur Keamanan
- **Autentikasi JWT**: Sistem login dengan token yang aman
- **Password Hashing**: Password di-hash menggunakan bcrypt
- **CORS Protection**: Konfigurasi CORS untuk keamanan
- **Input Validation**: Validasi input untuk mencegah error

---

## 🚀 Platform yang Didukung

### Development
- ✅ **Windows**: Script PowerShell dan Batch untuk kemudahan instalasi
- ✅ **Linux**: Script shell untuk instalasi otomatis
- ✅ **macOS**: Kompatibel dengan semua dependencies

### Production
- ✅ **Raspberry Pi 4**: Fully supported dengan script instalasi otomatis
- ✅ **Docker**: Support untuk containerization (opsional)
- ✅ **Cloud**: Dapat di-deploy ke cloud server

---

## 📦 Instalasi

### Quick Start (Windows)
```powershell
# Backend
.\run-backend.ps1

# Frontend (terminal baru)
.\run-frontend.ps1
```

### Quick Start (Linux/Raspberry Pi)
```bash
# Instalasi otomatis
chmod +x install-raspberry-pi.sh
./install-raspberry-pi.sh

# Jalankan aplikasi
chmod +x start-raspberry-pi.sh
./start-raspberry-pi.sh
```

### Manual Installation

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau: venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**MQTT Broker (Mosquitto):**
- Windows: Download dari https://mosquitto.org/download/ atau `choco install mosquitto`
- Linux/Mac: `sudo apt install mosquitto mosquitto-clients` atau `brew install mosquitto`

---

## 📱 Akses Aplikasi

Setelah instalasi, akses aplikasi melalui:
- **Frontend Dashboard**: http://localhost:5173 (development) atau http://raspberry-pi-ip (production)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🔌 Konfigurasi Hardware

### Pin ESP32
- **DHT22**: Pin 4 (Data)
- **RELAY1 (Lampu)**: Pin 23
- **RELAY2 (Motor/Servo)**: Pin 22
- **RELAY3 (Kipas)**: Pin 21

### MQTT Topics
- `inkubator/data`: Data sensor dari ESP32
- `inkubator/action`: Perintah kontrol ke ESP32
- `inkubator/heartbeat`: Heartbeat signal

---

## 📚 Dokumentasi Teknis

### Logika Kontrol Suhu
- **Suhu Terlalu Tinggi** (> target + 0.5°C): Lampu OFF + Kipas ON untuk mendinginkan
- **Suhu Terlalu Rendah** (< target - 0.2°C): Kipas OFF + Lampu ON untuk menghangatkan
- **Suhu Optimal**: Lampu ON + Kipas OFF untuk mempertahankan suhu

### Logika Kontrol Kelembapan
- **Kelembapan Rendah** (< target): MIST/Sprayer ON untuk meningkatkan kelembapan
- **Kelembapan Optimal** (>= target): MIST/Sprayer OFF

### Kode ESP32
- Sensor DHT22 membaca suhu dan kelembapan setiap 2 detik
- Data dikirim ke topic MQTT `inkubator/data`
- Menerima perintah kontrol dari topic `inkubator/action`
- Heartbeat signal setiap 5 detik ke topic `inkubator/heartbeat`

---

## 🐛 Known Issues (Beta)

- Model ML mungkin perlu retraining dengan data lebih banyak untuk akurasi optimal
- Notifikasi Telegram rate limiting: maksimal 1 notifikasi per 10 menit
- MIST/Sprayer hardware opsional (perintah tersedia tapi hardware tidak wajib)

---

## 🔮 Roadmap

Fitur yang direncanakan untuk versi selanjutnya:
- [ ] Support untuk lebih banyak jenis telur (puyuh, burung, dll)
- [ ] Dashboard mobile app
- [ ] Export data ke Excel/CSV
- [ ] Multi-user dengan role management
- [ ] WebSocket untuk real-time updates yang lebih efisien
- [ ] Support untuk multiple inkubator
- [ ] Kalibrasi sensor otomatis

---

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Silakan:
1. Fork repository ini
2. Buat branch untuk fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT License**. Lihat file LICENSE untuk detail lengkap.

---

## 👨‍💻 Developer

Dikembangkan dengan ❤️ untuk membantu peternak dalam proses penetasan telur yang lebih efisien dan berhasil.

---

## 📞 Support

Jika mengalami masalah atau memiliki pertanyaan:
1. Buka [Issues](https://github.com/Gungna/smart-incubator-iot/issues) di GitHub
2. Pastikan MQTT Broker (Mosquitto) sudah berjalan
3. Cek koneksi ESP32 ke WiFi dan MQTT broker
4. Verifikasi port 8000 (backend) dan 5173 (frontend) tidak digunakan aplikasi lain
5. Cek log backend dan frontend untuk error messages

---

**Selamat menggunakan Smart Incubator IoT Beta! 🎉**

*Versi: 1.0.0-beta*  
*Tanggal Rilis: 2025-01-27*  
*Status: Beta Release - Production Ready*

