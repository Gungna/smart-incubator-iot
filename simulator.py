import time
import json
import random
import paho.mqtt.client as mqtt

# Konfigurasi sama persis dengan Backend & ESP32
# Untuk local development, gunakan localhost (jika ada MQTT broker lokal)
# Untuk testing, gunakan test.mosquitto.org (public broker)
BROKER = "test.mosquitto.org"  # Ganti ke "localhost" jika ada MQTT lokal
TOPIC = "inkubator/data"

# Buat client MQTT
# Untuk menghindari deprecation warning, gunakan CallbackAPIVersion jika tersedia
try:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
except AttributeError:
    # Fallback untuk versi lama paho-mqtt
    client = mqtt.Client()
print(f"Menghubungkan ke Broker {BROKER}...")

try:
    client.connect(BROKER, 1883, 60)
    client.loop_start()  # Start background thread untuk handle network traffic
    print("Berhasil terhubung ke broker!")
except Exception as e:
    print(f"Error: Tidak bisa connect ke broker {BROKER}")
    print(f"Detail: {e}")
    print("\nSolusi:")
    print("1. Pastikan MQTT broker berjalan (jika menggunakan localhost)")
    print("2. Atau pastikan koneksi internet aktif (jika menggunakan test.mosquitto.org)")
    print("3. Atau install Mosquitto: https://mosquitto.org/download/")
    exit(1)

print("Mulai mengirim data palsu (Tekan Ctrl+C untuk stop)...")

try:
    while True:
        # 1. Generate Suhu Acak (Pura-pura jadi inkubator)
        # Kadang bagus (37.5 - 38.0), kadang jelek biar AI bereaksi
        temp = round(random.uniform(36.5, 39.0), 1) 
        hum = round(random.uniform(50.0, 70.0), 1)

        # 2. Bungkus jadi JSON
        payload = json.dumps({"temp": temp, "hum": hum})

        # 3. Kirim ke MQTT
        result = client.publish(TOPIC, payload)
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print(f"✅ Sent: {payload}")
        else:
            print(f"❌ Failed to send: {payload} (error code: {result.rc})")

        # Tunggu 2 detik
        time.sleep(2)

except KeyboardInterrupt:
    print("\nSimulasi Berhenti.")