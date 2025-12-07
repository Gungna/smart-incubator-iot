# 📡 Kode ESP32 Lengkap - Smart Incubator IoT

## ✅ Kompatibilitas dengan Backend

Kode ESP32 ini **100% kompatibel** dengan backend Python. Semua fitur sudah terintegrasi dengan MQTT.

## 📋 Fitur yang Didukung

### 1. **Sensor Data (DHT22)**
- ✅ Membaca suhu dan kelembapan
- ✅ Mengirim data ke topic `inkubator/data` setiap 2 detik
- ✅ Format JSON: `{"temp": 37.5, "hum": 55.0}`

### 2. **Kontrol Aktuator**
- ✅ **Lampu** (RELAY1) - `LAMP_ON` / `LAMP_OFF`
- ✅ **Kipas** (RELAY3) - `FAN_ON` / `FAN_OFF`
- ✅ **Motor/Servo** (RELAY2) - `SERVO_TURN` (ON 10 detik)
- ⚠️ **MIST** - Perintah dihandle tapi hardware tidak digunakan (untuk testing)

### 3. **Mode Khusus**
- ✅ **Maintenance Mode** - `ALL_OFF` (semua mati)
- ✅ **Test Mode** - `TEST_ALL` (test semua aktuator selama 3 detik)

### 4. **Monitoring**
- ✅ Heartbeat ke topic `inkubator/heartbeat`
- ✅ Status online/offline

## 🔌 Pin Configuration

```cpp
RELAY1 (Pin 23) → Lampu
RELAY2 (Pin 22) → Motor/Servo (putar telur)
RELAY3 (Pin 21) → Kipas
DHT22 (Pin 4)   → Sensor suhu & kelembapan
```

**Catatan:** MIST/Sprayer tidak digunakan, tapi perintah `MIST_ON`/`MIST_OFF` tetap dihandle untuk testing.

## 📡 MQTT Topics

### Subscribe (Menerima Perintah):
- `inkubator/action` - Menerima perintah kontrol dari backend

### Publish (Mengirim Data):
- `inkubator/data` - Data sensor (setiap 2 detik)
- `inkubator/heartbeat` - Status heartbeat (setiap 5 detik)
- `inkubator/status` - Status ESP32 (saat connect)

## 🎮 Perintah yang Didukung

| Perintah | Deskripsi | Hardware |
|----------|-----------|----------|
| `LAMP_ON` | Nyalakan lampu | RELAY1 |
| `LAMP_OFF` | Matikan lampu | RELAY1 |
| `FAN_ON` | Nyalakan kipas | RELAY3 |
| `FAN_OFF` | Matikan kipas | RELAY3 |
| `MIST_ON` | MIST ON (untuk testing) | Tidak ada hardware |
| `MIST_OFF` | MIST OFF (untuk testing) | Tidak ada hardware |
| `SERVO_TURN` | Putar telur (motor ON 10 detik) | RELAY2 |
| `TEST_ALL` | Test semua aktuator (3 detik) | Semua relay |
| `ALL_OFF` | Maintenance mode (semua mati) | Semua relay |

## ⚙️ Konfigurasi

### 1. WiFi
```cpp
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";
```

### 2. MQTT Broker
```cpp
// Untuk Raspberry Pi
const char* mqtt_server = "192.168.1.100";  // IP Raspberry Pi

// Untuk testing (tanpa Raspberry Pi)
// const char* mqtt_server = "test.mosquitto.org";
```

### 3. Interval Timer
```cpp
sensorInterval = 2000;      // Baca sensor setiap 2 detik
heartbeatInterval = 5000;   // Heartbeat setiap 5 detik
servoOnTime = 10000;        // Motor ON selama 10 detik
testDuration = 3000;        // Test mode selama 3 detik
```

## 📚 Library yang Diperlukan

Install library berikut di Arduino IDE:

1. **WiFi** (built-in ESP32) ✅
2. **PubSubClient** - MQTT client
   - Tools → Manage Libraries → Cari "PubSubClient"
3. **DHT sensor library** - Sensor DHT22
   - Tools → Manage Libraries → Cari "DHT sensor library"
4. **ArduinoJson** - JSON parsing
   - Tools → Manage Libraries → Cari "ArduinoJson"

## 🔄 Alur Kerja

1. **ESP32 Start** → Connect WiFi → Connect MQTT
2. **Setiap 2 detik** → Baca sensor → Kirim data ke backend
3. **Backend terima data** → Analisa → Kirim perintah kontrol
4. **ESP32 terima perintah** → Eksekusi → Update relay
5. **Heartbeat** → Setiap 5 detik untuk monitoring

## 🧪 Testing

### Test Manual dari Dashboard:
1. Buka dashboard di browser
2. Klik button "TEST AKTUATOR"
3. Semua relay akan ON selama 3 detik
4. Cek Serial Monitor ESP32 untuk log

### Test Perintah Individual:
- Backend API: `POST /control/LAMP_ON`
- Atau dari dashboard: Klik button kontrol

## 🐛 Troubleshooting

### ESP32 tidak connect ke WiFi
- Cek SSID dan password
- Pastikan WiFi 2.4GHz (ESP32 tidak support 5GHz)

### ESP32 tidak connect ke MQTT
- Cek IP MQTT broker
- Pastikan MQTT broker running
- Cek firewall/router settings

### Data tidak masuk ke backend
- Cek Serial Monitor ESP32
- Cek backend terminal untuk log
- Pastikan topic sama: `inkubator/data`

### Relay tidak bekerja
- Cek wiring relay
- Cek apakah relay aktif LOW atau HIGH
- Test dengan perintah manual

## 📝 Catatan Penting

1. **Relay Active LOW** - HIGH = OFF, LOW = ON
2. **MIST tidak digunakan** - Perintah tetap dihandle untuk testing
3. **Auto-reconnect** - ESP32 akan reconnect otomatis jika terputus
4. **Maintenance Mode** - Semua relay mati, data sensor tidak dikirim

## ✅ Checklist Sebelum Upload

- [ ] WiFi SSID dan password sudah diisi
- [ ] IP MQTT broker sudah benar
- [ ] Library sudah terinstall
- [ ] Pin relay sesuai dengan hardware
- [ ] DHT22 terhubung ke pin 4
- [ ] Relay terhubung dengan benar

## 🎉 Selesai!

Kode ESP32 sudah siap digunakan dan 100% kompatibel dengan backend!

**File:** `ESP32_Code.ino`

