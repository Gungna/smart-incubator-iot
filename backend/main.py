import json
import time
import threading
import joblib
import pandas as pd
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from paho.mqtt import client as mqtt_client
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel

# === 1. KONFIGURASI ===
TELEGRAM_BOT_TOKEN = "8235041481:AAGpTOViJlKBOMRsPKY5kOlbmzOSeaf7OUE" 
TELEGRAM_CHAT_ID = "1905806768"

SECRET_KEY = "SUPER_SECRET_KEY_SMART_HATCHERY_PROJECT_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300 

MQTT_BROKER = "test.mosquitto.org"
MQTT_TOPIC_DATA = "inkubator/data"
MQTT_TOPIC_ACTION = "inkubator/action"
MQTT_TOPIC_HEARTBEAT = "inkubator/heartbeat"
DATABASE_URL = "sqlite:///./incubator.db"

# === 2. SETUP DATABASE & AUTH ===
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class SensorData(Base):
    __tablename__ = "sensor_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    temperature = Column(Float)
    humidity = Column(Float)
    status = Column(String)

# Tabel Settingan Aktif (Yang sedang berjalan)
class SystemSettings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    preset_name = Column(String, default="Custom")
    target_temp_low = Column(Float, default=37.5)
    target_temp_high = Column(Float, default=38.0)
    target_hum_low = Column(Float, default=50.0)
    temp_offset = Column(Float, default=0.0) # Global Offset
    hum_offset = Column(Float, default=0.0)  # Global Offset
    servo_interval = Column(Integer, default=7200) 
    is_maintenance = Column(Boolean, default=False)

# [BARU] Tabel Preset (Resep Tersimpan)
class PresetConfig(Base):
    __tablename__ = "presets"
    name = Column(String, primary_key=True) # AYAM, BEBEK, dll
    target_temp_low = Column(Float)
    target_temp_high = Column(Float)
    target_hum_low = Column(Float)
    servo_interval = Column(Integer)

Base.metadata.create_all(bind=engine)

# Inisialisasi Database
def init_db():
    db = SessionLocal()
    
    # 1. Init SystemSettings (Aktif)
    if not db.query(SystemSettings).first():
        db.add(SystemSettings(preset_name="AYAM", target_temp_low=37.5, target_temp_high=38.0, target_hum_low=50.0, servo_interval=7200))
    
    # 2. Init Preset Templates (Data Awal)
    # Preset AYAM (Default 2 Jam / 7200s)
    if not db.query(PresetConfig).filter(PresetConfig.name == "AYAM").first():
        db.add(PresetConfig(name="AYAM", target_temp_low=37.5, target_temp_high=38.0, target_hum_low=50.0, servo_interval=7200))
    
    # Preset BEBEK (Default 3 Jam / 10800s - Karena telur bebek lebih besar)
    if not db.query(PresetConfig).filter(PresetConfig.name == "BEBEK").first():
        db.add(PresetConfig(name="BEBEK", target_temp_low=37.0, target_temp_high=37.5, target_hum_low=60.0, servo_interval=10800))
        
    db.commit()
    db.close()

init_db()

# === 3. LOGIC AI & TELEGRAM ===
try:
    model = joblib.load("model_incubator.pkl")
    label_encoder = joblib.load("label_encoder.pkl")
except:
    model = None

last_servo_turn_time = time.time()
last_telegram_alert = 0

def send_telegram(message):
    global last_telegram_alert
    if time.time() - last_telegram_alert > 600:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"})
            last_telegram_alert = time.time()
            print("Telegram sent!")
        except Exception as e:
            print(f"Gagal kirim Telegram: {e}")

# === 4. MQTT LOGIC ===
client = mqtt_client.Client()

def on_connect(client, userdata, flags, rc):
    client.subscribe(MQTT_TOPIC_DATA)
    print("MQTT Connected.")

def on_message(client, userdata, msg):
    try:
        db = SessionLocal()
        settings = db.query(SystemSettings).first()
        
        if settings.is_maintenance:
            client.publish(MQTT_TOPIC_ACTION, "ALL_OFF")
            db.close()
            return

        payload = msg.payload.decode()
        data = json.loads(payload)
        real_temp = float(data.get("temp", 0)) + settings.temp_offset
        real_hum = float(data.get("hum", 0)) + settings.hum_offset
        
        ai_status = "UNKNOWN"
        if model:
            res = model.predict(pd.DataFrame([[real_temp, real_hum]], columns=['temperature', 'humidity']))[0]
            ai_status = label_encoder.inverse_transform([res])[0]

        if real_temp > settings.target_temp_high + 0.5: 
            client.publish(MQTT_TOPIC_ACTION, "LAMP_OFF")
            client.publish(MQTT_TOPIC_ACTION, "FAN_ON")
        elif real_temp < settings.target_temp_low - 0.2:
            client.publish(MQTT_TOPIC_ACTION, "FAN_OFF")
            client.publish(MQTT_TOPIC_ACTION, "LAMP_ON")
        else:
            client.publish(MQTT_TOPIC_ACTION, "FAN_OFF")

        if real_hum < settings.target_hum_low:
            client.publish(MQTT_TOPIC_ACTION, "MIST_ON")
        else:
            client.publish(MQTT_TOPIC_ACTION, "MIST_OFF")

        if ai_status == "DANGER":
            msg = f"⚠️ *PERINGATAN INKUBATOR*\nSuhu: {real_temp:.1f}°C\nKelembapan: {real_hum:.1f}%\nStatus: BAHAYA!"
            threading.Thread(target=send_telegram, args=(msg,)).start()

        db.add(SensorData(temperature=real_temp, humidity=real_hum, status=ai_status))
        db.commit()
        db.close()
    except Exception as e:
        print(f"MQTT Error: {e}")

client.on_connect = on_connect
client.on_message = on_message

# === 5. BACKGROUND TASKS ===
def background_loop():
    global last_servo_turn_time
    while True:
        client.publish(MQTT_TOPIC_HEARTBEAT, "ALIVE")
        
        db = SessionLocal()
        settings = db.query(SystemSettings).first()
        
        if settings and not settings.is_maintenance:
            time_diff = time.time() - last_servo_turn_time
            if time_diff >= settings.servo_interval:
                print(f">>> WAKTUNYA PUTAR TELUR! (Interval: {settings.servo_interval}s)")
                client.publish(MQTT_TOPIC_ACTION, "SERVO_TURN")
                last_servo_turn_time = time.time()
        
        db.close()
        time.sleep(5)

# === 6. API ENDPOINTS ===
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    client.connect(MQTT_BROKER, 1883, 60)
    client.loop_start()
    threading.Thread(target=background_loop, daemon=True).start()

# --- AUTH HELPERS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401)
    except: raise HTTPException(status_code=401)
    user = db.query(User).filter(User.username == username).first()
    if not user: raise HTTPException(status_code=401)
    return user

class UserAuth(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserAuth, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username sudah dipakai")
    hashed_pw = pwd_context.hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"msg": "Registrasi Berhasil"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Login Gagal")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# --- DATA ENDPOINTS ---
@app.get("/latest")
def get_latest(user: User = Depends(get_current_user)): 
    db = SessionLocal()
    data = db.query(SensorData).order_by(SensorData.id.desc()).first()
    st = db.query(SystemSettings).first()
    db.close()
    
    if not data: 
        return {
            "temperature": 0, 
            "humidity": 0, 
            "status": "WAITING",
            "is_maintenance": st.is_maintenance if st else False
        }
        
    return {
        "temperature": data.temperature, 
        "humidity": data.humidity, 
        "status": data.status,
        "is_maintenance": st.is_maintenance
    }

@app.get("/history")
def get_history(user: User = Depends(get_current_user)):
    db = SessionLocal()
    logs = db.query(SensorData).order_by(SensorData.id.desc()).limit(20).all()
    db.close()
    return logs[::-1]

@app.post("/control/{action}")
def control(action: str, user: User = Depends(get_current_user)):
    global last_servo_turn_time
    client.publish(MQTT_TOPIC_ACTION, action)
    if action == "SERVO_TURN":
        last_servo_turn_time = time.time()
        print("Manual Turn -> Timer Reset")
    return {"status": "Command Sent"}

# --- SETTINGS ENDPOINTS ---
class SettingsUpdate(BaseModel):
    preset_name: str
    target_temp_low: float
    target_temp_high: float
    target_hum_low: float
    temp_offset: float
    hum_offset: float
    servo_interval: int
    is_maintenance: bool

@app.get("/settings")
def get_settings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SystemSettings).first()

@app.post("/settings")
def update_settings(s: SettingsUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_sess = db
    # 1. Update Settingan Aktif
    active_settings = db_sess.query(SystemSettings).first()
    active_settings.preset_name = s.preset_name
    active_settings.target_temp_low = s.target_temp_low
    active_settings.target_temp_high = s.target_temp_high
    active_settings.target_hum_low = s.target_hum_low
    active_settings.temp_offset = s.temp_offset
    active_settings.hum_offset = s.hum_offset
    active_settings.servo_interval = s.servo_interval
    active_settings.is_maintenance = s.is_maintenance
    
    # 2. Update Resep (Preset) di Database agar tersimpan
    #    Jadi kalau nanti balik lagi ke preset ini, settingan terakhirnya diingat.
    preset = db_sess.query(PresetConfig).filter(PresetConfig.name == s.preset_name).first()
    if not preset:
        # Jika preset baru (misal user bikin nama sendiri), buat baru
        preset = PresetConfig(name=s.preset_name)
        db_sess.add(preset)
    
    # Simpan nilai spesifik preset
    preset.target_temp_low = s.target_temp_low
    preset.target_temp_high = s.target_temp_high
    preset.target_hum_low = s.target_hum_low
    preset.servo_interval = s.servo_interval
    
    db_sess.commit()
    
    if not s.is_maintenance:
        client.publish(MQTT_TOPIC_ACTION, "LAMP_ON")
        
    return {"msg": "Settings & Preset Updated"}

# [ENDPOINT BARU] Untuk Load Preset (Dipanggil saat klik tombol Ayam/Bebek)
@app.post("/settings/load_preset/{preset_name}")
def load_preset(preset_name: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Cari resep di database
    preset = db.query(PresetConfig).filter(PresetConfig.name == preset_name).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset tidak ditemukan")
    
    # Timpa settingan aktif dengan resep ini
    active = db.query(SystemSettings).first()
    active.preset_name = preset.name
    active.target_temp_low = preset.target_temp_low
    active.target_temp_high = preset.target_temp_high
    active.target_hum_low = preset.target_hum_low
    active.servo_interval = preset.servo_interval
    # Catatan: Offset tidak ikut diload karena offset itu sifatnya global (kalibrasi sensor), bukan per telur.
    
    db.commit()
    return {"msg": f"Preset {preset_name} Loaded", "data": active}