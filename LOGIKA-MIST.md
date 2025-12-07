# 💧 Logika MIST (Sprayer/Mist) - Smart Incubator IoT

## 🎯 Fungsi MIST

**MIST** adalah **sprayer/mist generator** yang berfungsi untuk **meningkatkan kelembapan udara** di dalam inkubator.

### Tujuan:
- Menjaga kelembapan udara tetap optimal untuk perkembangan embrio telur
- Mencegah telur kering yang bisa menyebabkan embrio mati
- Mempertahankan kondisi lingkungan yang ideal

## ⚙️ Logika Kontrol MIST

### Kapan MIST ON?
```python
if real_hum < settings.target_hum_low:
    client.publish(MQTT_TOPIC_ACTION, "MIST_ON")
```

**MIST akan ON ketika:**
- **Kelembapan aktual < Target kelembapan minimum**

### Kapan MIST OFF?
```python
else:
    client.publish(MQTT_TOPIC_ACTION, "MIST_OFF")
```

**MIST akan OFF ketika:**
- **Kelembapan aktual >= Target kelembapan minimum**

## 📊 Contoh Skenario

### Preset AYAM (target_hum_low = 50.0%)
- **Kelembapan = 45%** → MIST **ON** ✅ (karena 45% < 50%)
- **Kelembapan = 50%** → MIST **OFF** ✅ (karena 50% >= 50%)
- **Kelembapan = 55%** → MIST **OFF** ✅ (karena 55% >= 50%)

### Preset BEBEK (target_hum_low = 60.0%)
- **Kelembapan = 55%** → MIST **ON** ✅ (karena 55% < 60%)
- **Kelembapan = 60%** → MIST **OFF** ✅ (karena 60% >= 60%)
- **Kelembapan = 65%** → MIST **OFF** ✅ (karena 65% >= 60%)

## 🔄 Alur Kerja

1. **ESP32 membaca sensor** → Kirim data ke backend setiap 2 detik
2. **Backend terima data** → Cek kelembapan aktual
3. **Backend bandingkan** → `real_hum` vs `target_hum_low`
4. **Backend kirim perintah** → `MIST_ON` atau `MIST_OFF` via MQTT
5. **ESP32 terima perintah** → Eksekusi (ON/OFF relay MIST)

## 📝 Catatan Penting

### 1. **Offset Kelembapan**
```python
real_hum = float(data.get("hum", 0)) + settings.hum_offset
```
- Data sensor ditambahkan dengan `hum_offset` (kalibrasi)
- Jadi perbandingan menggunakan nilai yang sudah dikalibrasi

### 2. **Maintenance Mode**
- Jika `is_maintenance = true`, semua relay termasuk MIST akan **ALL_OFF**
- Data sensor tetap dibaca tapi perintah kontrol tidak dikirim

### 3. **Default Values**
- **Preset AYAM**: `target_hum_low = 50.0%`
- **Preset BEBEK**: `target_hum_low = 60.0%`
- Bisa diubah melalui dashboard settings

## 🎛️ Kontrol Manual

MIST juga bisa dikontrol manual dari dashboard:
- **API Endpoint**: `POST /control/MIST_ON` atau `POST /control/MIST_OFF`
- **Button di Dashboard**: (jika ada button kontrol manual)

## ⚠️ Status Saat Ini

**MIST hardware TIDAK digunakan** di project ini, tapi:
- ✅ Logika tetap berjalan di backend
- ✅ Perintah `MIST_ON`/`MIST_OFF` tetap dikirim via MQTT
- ✅ ESP32 tetap handle perintah (untuk testing)
- ⚠️ Tidak ada relay/hardware yang dikontrol

## 🔧 Jika Ingin Menggunakan MIST

Jika nanti ingin menambahkan hardware MIST:

1. **Tambahkan relay** untuk kontrol MIST
2. **Update ESP32 code** untuk handle relay MIST
3. **Hardware sudah siap** - logika backend sudah ada

## 📊 Diagram Alur

```
Sensor DHT22
    ↓
Baca Kelembapan (hum)
    ↓
Kirim ke Backend via MQTT
    ↓
Backend: real_hum = hum + hum_offset
    ↓
    ├─ real_hum < target_hum_low? 
    │   ├─ YES → Kirim "MIST_ON" → ESP32 → Relay ON → Sprayer aktif
    │   └─ NO  → Kirim "MIST_OFF" → ESP32 → Relay OFF → Sprayer mati
    ↓
Loop setiap 2 detik
```

## 💡 Kesimpulan

**MIST = Sprayer untuk meningkatkan kelembapan**

- **Trigger ON**: Ketika kelembapan **di bawah** target minimum
- **Trigger OFF**: Ketika kelembapan **sudah mencapai** target minimum
- **Tujuan**: Mempertahankan kelembapan optimal untuk perkembangan embrio

**Saat ini hardware MIST tidak digunakan, tapi logika tetap ada untuk testing dan future use.**

