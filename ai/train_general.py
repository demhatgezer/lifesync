import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("datasets/general_dataset.csv")

# Input kolonlar
X = df[["activity_status", "sleep_status", "mood_status", "nutrition_status"]]
y = df["overall_status"]

# Kategorik verileri encode et
encoders = {}
for column in X.columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])
    encoders[column] = le

# Target encode
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

model = RandomForestClassifier()
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("General Model Accuracy:", accuracy)

# Kaydet
joblib.dump(model, "models/general_model.pkl")
joblib.dump(encoders, "models/general_input_encoders.pkl")
joblib.dump(target_encoder, "models/general_target_encoder.pkl")

print("General modeli kaydedildi.")