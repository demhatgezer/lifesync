import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("datasets/activity_dataset.csv")

X = df[["steps", "exercise_minutes"]]
y = df["status"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

model = RandomForestClassifier()
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("Activity Model Accuracy:", accuracy)

joblib.dump(model, "models/activity_model.pkl")
joblib.dump(le, "models/activity_label_encoder.pkl")

print("Activity modeli kaydedildi.")