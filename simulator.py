import time
import json
import random
import paho.mqtt.client as mqtt

# Konfigurasi sama persis dengan Backend & ESP32
BROKER = "test.mosquitto.org"
TOPIC = "inkubator/data"

client = mqtt.Client()
print(f"Menghubungkan ke Broker {BROKER}...")
client.connect(BROKER, 1883, 60)

print("Mulai mengirim data palsu (Tekan Ctrl+C untuk stop)...")

try:
    while True:
        # --- UBAH BAGIAN INI AGAR SUHU JADI PANAS (BAHAYA) ---
        # Kita paksa suhu antara 39.5 sampai 40.5
        temp = round(random.uniform(39.5, 40.5), 1) 
        hum = round(random.uniform(50.0, 60.0), 1)
        # -----------------------------------------------------

        payload = json.dumps({"temp": temp, "hum": hum})
        client.publish(TOPIC, payload)
        print(f"Sent (BAHAYA): {payload}")
        
        time.sleep(5) # Perlambat sedikit biar Telegram tidak spam

    while True:
        # 1. Generate Suhu Acak (Pura-pura jadi inkubator)
        # Kadang bagus (37.5 - 38.0), kadang jelek biar AI bereaksi
        temp = round(random.uniform(36.5, 39.0), 1) 
        hum = round(random.uniform(50.0, 70.0), 1)

        # 2. Bungkus jadi JSON
        payload = json.dumps({"temp": temp, "hum": hum})

        # 3. Kirim ke MQTT
        client.publish(TOPIC, payload)
        print(f"Sent: {payload}")

        # Tunggu 2 detik
        time.sleep(2)

except KeyboardInterrupt:
    print("\nSimulasi Berhenti.")