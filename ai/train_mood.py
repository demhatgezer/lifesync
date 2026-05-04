import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Dataset oku
df = pd.read_csv("datasets/mood_dataset.csv")

# X ve y ayır
X = df[["mood_score"]]
y = df["status"]

# Label encode
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Accuracy
accuracy = model.score(X_test, y_test)
print("Mood Model Accuracy:", accuracy)

# Modeli kaydet
joblib.dump(model, "models/mood_model.pkl")
joblib.dump(le, "models/mood_label_encoder.pkl")

print("Mood modeli kaydedildi.")