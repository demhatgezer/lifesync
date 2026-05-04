import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("datasets/sleep_dataset.csv")

X = df[["sleep_hours"]]
y = df["status"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

model = RandomForestClassifier()
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("Sleep Model Accuracy:", accuracy)

joblib.dump(model, "models/sleep_model.pkl")
joblib.dump(le, "models/sleep_label_encoder.pkl")

print("Sleep modeli kaydedildi.")