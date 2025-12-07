# Tambahkan ini di deretan import paling atas
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Synthetic Data Generation
np.random.seed(42)
num_samples = 10000

temperature = np.random.uniform(30.0, 42.0, num_samples)
humidity = np.random.uniform(40.0, 90.0, num_samples)

data = pd.DataFrame({
    'temperature': temperature,
    'humidity': humidity
})

# Apply labeling logic
def get_status(row):
    temp = row['temperature']
    hum = row['humidity']

    if (37.5 <= temp <= 38.0) and (50 <= hum <= 65):
        return 'OPTIMAL'
    elif (37.0 <= temp < 37.5) or (38.0 < temp <= 38.5):
        return 'WARNING'
    elif (temp < 37.0) or (temp > 38.5):
        return 'DANGER'
    else: # Default for cases not explicitly covered by WARNING/DANGER but not OPTIMAL
        return 'WARNING' # Assign general warning for other non-optimal cases

data['status'] = data.apply(get_status, axis=1)

# Add 5% random noise to labels
num_noise_samples = int(num_samples * 0.05)
noise_indices = np.random.choice(num_samples, num_noise_samples, replace=False)
unique_statuses = data['status'].unique()

for idx in noise_indices:
    original_status = data.loc[idx, 'status']
    # Select a new random status that is different from the original
    new_status_options = [s for s in unique_statuses if s != original_status]
    if new_status_options: # Ensure there are other options
        data.loc[idx, 'status'] = np.random.choice(new_status_options)

# Prepare data for ML
X = data[['temperature', 'humidity']]
y = data['status']

# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
label_mapping = dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_)))

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# 1. Inisialisasi Model Random Forest
# n_estimators=100 artinya kita pakai 100 "pohon" keputusan (konsil)
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

# 2. Latih Model (Fit)
print("Sedang melatih AI... mohon tunggu sebentar.")
rf_model.fit(X_train, y_train)

# 3. Evaluasi Akurasi
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Selesai Dilatih! Akurasi: {accuracy * 100:.2f}%")

# 4. Simpan Model & Encoder
# Kita butuh dua file: Model otaknya, dan Kamus labelnya (0=DANGER, 1=OPTIMAL, dll)
joblib.dump(rf_model, 'model_incubator.pkl')
joblib.dump(label_encoder, 'label_encoder.pkl') 

print("File berhasil disimpan: 'model_incubator.pkl' dan 'label_encoder.pkl'")
print("PHASE 1 SELESAI. Siap lanjut ke Phase 2.")