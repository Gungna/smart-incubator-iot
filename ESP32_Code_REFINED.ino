/*
 * SMART INCUBATOR IOT - ESP32 CODE
 * Versi: Refined (Tanpa MIST/Sprayer)
 * 
 * Fitur:
 * - Membaca sensor DHT22 (Suhu & Kelembaban)
 * - Kontrol Lampu, Kipas, dan Motor/Servo via MQTT
 * - Test Mode untuk semua aktuator
 * - Maintenance Mode
 * 
 * Hardware:
 * - ESP32 Development Board
 * - DHT22 Sensor (Pin 4)
 * - Relay Module 3 Channel:
 *   * RELAY1 (Pin 23) - Lampu
 *   * RELAY2 (Pin 22) - Motor/Servo (Putar Telur)
 *   * RELAY3 (Pin 21) - Kipas
 * 
 * Library yang dibutuhkan:
 * - WiFi (built-in ESP32)
 * - PubSubClient (by Nick O'Leary)
 * - DHT sensor library (by Adafruit)
 * - ArduinoJson (by Benoit Blanchon)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ===== KONFIGURASI WIFI =====
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// ===== KONFIGURASI MQTT =====
// Ganti dengan IP Raspberry Pi atau gunakan test.mosquitto.org untuk testing
const char* mqtt_server = "192.168.1.100";  // IP Raspberry Pi
// const char* mqtt_server = "test.mosquitto.org";  // Untuk testing tanpa Raspberry Pi
const int mqtt_port = 1883;

// MQTT Topics (harus sama dengan backend)
const char* topic_data = "inkubator/data";
const char* topic_action = "inkubator/action";
const char* topic_heartbeat = "inkubator/heartbeat";

// ===== KONFIGURASI HARDWARE =====
#define RELAY1 23   // Lampu
#define RELAY2 22   // Motor/Servo (untuk putar telur)
#define RELAY3 21   // Kipas

#define DHTPIN 4       // Pin data DHT22
#define DHTTYPE DHT22  // Tipe sensor

DHT dht(DHTPIN, DHTTYPE);

// ===== VARIABEL MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== VARIABEL TIMER =====
unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 2000;  // Baca sensor setiap 2 detik

unsigned long lastHeartbeat = 0;
const unsigned long heartbeatInterval = 5000;  // Heartbeat setiap 5 detik

unsigned long lastServoTurn = 0;
unsigned long servoInterval = 7200000;  // Default 2 jam (7200 detik = 2 jam)
unsigned long servoOnTime = 10000;  // Motor ON selama 10 detik
bool servoActive = false;
unsigned long servoStartTime = 0;

// ===== STATE RELAY =====
bool lampState = false;
bool fanState = false;
bool maintenanceMode = false;

// ===== VARIABEL TEST MODE =====
bool testMode = false;
unsigned long testStartTime = 0;
const unsigned long testDuration = 3000;  // Test selama 3 detik

// ===== FUNGSI WIFI =====
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// ===== FUNGSI MQTT CALLBACK =====
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Message received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Handle perintah dari backend
  if (String(topic) == topic_action) {
    if (message == "LAMP_ON") {
      digitalWrite(RELAY1, LOW);  // Relay aktif LOW
      lampState = true;
      Serial.println("✅ Lampu ON");
    }
    else if (message == "LAMP_OFF") {
      digitalWrite(RELAY1, HIGH);
      lampState = false;
      Serial.println("✅ Lampu OFF");
    }
    else if (message == "FAN_ON") {
      digitalWrite(RELAY3, LOW);  // Relay aktif LOW
      fanState = true;
      Serial.println("✅ Kipas ON");
    }
    else if (message == "FAN_OFF") {
      digitalWrite(RELAY3, HIGH);
      fanState = false;
      Serial.println("✅ Kipas OFF");
    }
    else if (message == "SERVO_TURN") {
      // Putar telur (motor ON selama 10 detik)
      digitalWrite(RELAY2, LOW);
      servoActive = true;
      servoStartTime = millis();
      lastServoTurn = millis();
      Serial.println("✅ SERVO TURN - Motor ON (10 detik)");
    }
    else if (message == "TEST_ALL") {
      // Test semua aktuator (untuk button test di dashboard)
      testMode = true;
      testStartTime = millis();
      
      // ON semua relay untuk test
      digitalWrite(RELAY1, LOW);  // Lampu ON
      digitalWrite(RELAY2, LOW);  // Motor ON
      digitalWrite(RELAY3, LOW);  // Kipas ON
      
      lampState = true;
      fanState = true;
      servoActive = true;
      
      Serial.println("🧪 TEST MODE - Semua aktuator ON (3 detik)");
    }
    else if (message == "ALL_OFF") {
      // Maintenance mode - semua mati
      digitalWrite(RELAY1, HIGH);
      digitalWrite(RELAY2, HIGH);
      digitalWrite(RELAY3, HIGH);
      lampState = false;
      fanState = false;
      servoActive = false;
      testMode = false;
      maintenanceMode = true;
      Serial.println("⚠️ ALL OFF - Maintenance Mode");
    }
  }
}

// ===== FUNGSI RECONNECT MQTT =====
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Client ID unik
    String clientId = "ESP32-Incubator-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected!");
      
      // Subscribe ke topic action untuk menerima perintah
      client.subscribe(topic_action);
      Serial.print("Subscribed to: ");
      Serial.println(topic_action);
      
      // Subscribe ke heartbeat (opsional)
      client.subscribe(topic_heartbeat);
      
      // Kirim status awal
      client.publish("inkubator/status", "ESP32_ONLINE");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ===== FUNGSI KIRIM DATA SENSOR =====
void sendSensorData() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Cek jika pembacaan sensor valid
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ Gagal membaca sensor DHT22!");
    return;
  }

  // Buat JSON payload (format harus sama dengan backend)
  StaticJsonDocument<200> doc;
  doc["temp"] = temp;
  doc["hum"] = hum;

  String payload;
  serializeJson(doc, payload);

  // Publish ke topic data
  if (client.publish(topic_data, payload.c_str())) {
    Serial.print("📤 Data sent: ");
    Serial.println(payload);
  } else {
    Serial.println("❌ Failed to send data");
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  
  // Setup pin relay
  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);
  pinMode(RELAY3, OUTPUT);

  // Semua relay OFF awal (aktif LOW, jadi HIGH = OFF)
  digitalWrite(RELAY1, HIGH);
  digitalWrite(RELAY2, HIGH);
  digitalWrite(RELAY3, HIGH);

  // Setup DHT
  dht.begin();

  // Setup WiFi
  setup_wifi();

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  Serial.println("✅ ESP32 Setup Complete!");
  Serial.println("Waiting for MQTT connection...");
}

// ===== LOOP =====
void loop() {
  // Pastikan MQTT connected
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();

  // Handle TEST MODE
  if (testMode) {
    if (currentMillis - testStartTime >= testDuration) {
      // Test selesai, matikan semua
      digitalWrite(RELAY1, HIGH);
      digitalWrite(RELAY2, HIGH);
      digitalWrite(RELAY3, HIGH);
      lampState = false;
      fanState = false;
      servoActive = false;
      testMode = false;
      Serial.println("✅ TEST MODE selesai - Semua aktuator OFF");
    }
  }

  // Baca dan kirim data sensor setiap 2 detik
  if (currentMillis - lastSensorRead >= sensorInterval) {
    if (!maintenanceMode) {  // Hanya kirim data jika tidak maintenance
      sendSensorData();
    }
    lastSensorRead = currentMillis;
  }

  // Handle servo/motor timer (hanya jika tidak dalam test mode)
  if (servoActive && !testMode) {
    if (currentMillis - servoStartTime >= servoOnTime) {
      // Matikan motor setelah 10 detik
      digitalWrite(RELAY2, HIGH);
      servoActive = false;
      Serial.println("✅ Motor OFF (SERVO selesai)");
    }
  }

  // Heartbeat (opsional, untuk monitoring)
  if (currentMillis - lastHeartbeat >= heartbeatInterval) {
    client.publish(topic_heartbeat, "ESP32_ALIVE");
    lastHeartbeat = currentMillis;
  }

  // Small delay untuk stability
  delay(100);
}

