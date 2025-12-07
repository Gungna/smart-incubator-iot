# 🌡️ Logika Kontrol Suhu - Smart Incubator IoT

## ✅ Logika Pendinginan (Suhu Terlalu Tinggi)

**YA, sistem sudah memiliki logika pendinginan otomatis!**

### Kapan Sistem Mendinginkan?

```python
if real_temp > settings.target_temp_high + 0.5:
    client.publish(MQTT_TOPIC_ACTION, "LAMP_OFF")
    client.publish(MQTT_TOPIC_ACTION, "FAN_ON")
```

**Suhu terlalu tinggi** → Sistem akan:
1. ✅ **Matikan Lampu** (`LAMP_OFF`) - Mengurangi sumber panas
2. ✅ **Nyalakan Kipas** (`FAN_ON`) - Mendinginkan ruangan dengan sirkulasi udara

### Contoh:
- **Target suhu tinggi**: 38.0°C
- **Threshold**: 38.0 + 0.5 = **38.5°C**
- **Suhu aktual = 39.0°C** → Lampu OFF + Kipas ON ✅

## 📊 Logika Kontrol Suhu Lengkap

### 1. **Suhu Terlalu Tinggi** (> target_temp_high + 0.5°C)
```
Aksi:
- Lampu: OFF (mengurangi panas)
- Kipas: ON (mendinginkan)
```

### 2. **Suhu Terlalu Rendah** (< target_temp_low - 0.2°C)
```
Aksi:
- Kipas: OFF (mencegah pendinginan lebih lanjut)
- Lampu: ON (menghangatkan)
```

### 3. **Suhu Optimal** (target_temp_low - 0.2 ≤ suhu ≤ target_temp_high + 0.5)
```
Aksi:
- Kipas: OFF
- Lampu: ON (mempertahankan suhu)
```

## ⚠️ Tentang "Meredupkan Lampu"

**Saat ini sistem TIDAK memiliki fitur "meredupkan" lampu.**

### Status Saat Ini:
- ✅ Lampu hanya **ON** atau **OFF** (binary)
- ❌ Tidak ada **PWM/dimming** untuk meredupkan

### Mengapa?
- Relay hanya support ON/OFF, tidak support PWM
- Untuk dimming, perlu hardware tambahan (PWM module atau dimmer)

### Solusi Saat Ini:
- Saat suhu tinggi: **Lampu OFF** (bukan diredupkan)
- Saat suhu optimal: **Lampu ON** (full power)
- Kipas membantu mendinginkan saat suhu tinggi

## 🔄 Alur Kerja Lengkap

```
Sensor DHT22 membaca suhu
    ↓
Kirim ke Backend via MQTT
    ↓
Backend: real_temp = temp + temp_offset
    ↓
    ├─ real_temp > target_temp_high + 0.5?
    │   └─ YES → LAMP_OFF + FAN_ON (Pendinginan)
    │
    ├─ real_temp < target_temp_low - 0.2?
    │   └─ YES → FAN_OFF + LAMP_ON (Pemanasan)
    │
    └─ ELSE (Suhu optimal)
        └─ FAN_OFF + LAMP_ON (Pemeliharaan)
    ↓
ESP32 terima perintah → Eksekusi relay
    ↓
Loop setiap 2 detik
```

## 📝 Catatan Penting

### 1. **Hysteresis**
- Threshold berbeda untuk ON/OFF
- Mencegah relay "flickering" (nyala-mati cepat)
- **Pendinginan**: Trigger di `target_temp_high + 0.5°C`
- **Pemanasan**: Trigger di `target_temp_low - 0.2°C`

### 2. **Offset Kalibrasi**
```python
real_temp = float(data.get("temp", 0)) + settings.temp_offset
```
- Data sensor bisa dikalibrasi dengan offset
- Berguna jika sensor tidak akurat

### 3. **Maintenance Mode**
- Jika `is_maintenance = true`, semua kontrol dihentikan
- Semua relay akan `ALL_OFF`

## 💡 Rekomendasi untuk Dimming (Future)

Jika ingin menambahkan fitur meredupkan lampu:

### Opsi 1: PWM Module
- Gunakan PWM module untuk kontrol intensitas lampu
- Perlu hardware tambahan
- Perlu update kode ESP32 untuk support PWM

### Opsi 2: Multiple Lampu
- Gunakan beberapa lampu dengan watt berbeda
- Kontrol kombinasi lampu untuk intensitas berbeda
- Lebih sederhana, tidak perlu PWM

### Opsi 3: Dimmer Module
- Gunakan dimmer AC module
- Support kontrol intensitas
- Perlu hardware khusus

## ✅ Kesimpulan

**Sistem sudah memiliki logika pendinginan:**
- ✅ Saat suhu tinggi → Lampu OFF + Kipas ON
- ✅ Saat suhu rendah → Lampu ON + Kipas OFF
- ✅ Saat suhu optimal → Lampu ON + Kipas OFF

**Tentang meredupkan lampu:**
- ❌ Saat ini tidak ada (hanya ON/OFF)
- 💡 Bisa ditambahkan di masa depan dengan hardware PWM/dimmer

**Sistem sudah optimal untuk menjaga suhu tetap stabil!**

