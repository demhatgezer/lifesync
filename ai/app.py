from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

# Modelleri yükle
mood_model = joblib.load("models/mood_model.pkl")
mood_encoder = joblib.load("models/mood_label_encoder.pkl")

sleep_model = joblib.load("models/sleep_model.pkl")
sleep_encoder = joblib.load("models/sleep_label_encoder.pkl")

activity_model = joblib.load("models/activity_model.pkl")
activity_encoder = joblib.load("models/activity_label_encoder.pkl")

nutrition_model = joblib.load("models/nutrition_model.pkl")
nutrition_encoder = joblib.load("models/nutrition_label_encoder.pkl")

general_model = joblib.load("models/general_model.pkl")
general_input_encoders = joblib.load("models/general_input_encoders.pkl")
general_target_encoder = joblib.load("models/general_target_encoder.pkl")


# Request modelleri
class MoodRequest(BaseModel):
    mood_score: int


class SleepRequest(BaseModel):
    sleep_hours: float


class ActivityRequest(BaseModel):
    steps: int
    exercise_minutes: int


class NutritionRequest(BaseModel):
    protein_count: int
    vegetable_count: int
    carb_count: int
    junk_count: int
    meal_count: int


class GeneralRequest(BaseModel):
    activity_status: str
    sleep_status: str
    mood_status: str
    nutrition_status: str


@app.get("/")
def home():
    return {"message": "AI service is running"}


@app.post("/predict/mood")
def predict_mood(data: MoodRequest):
    X = pd.DataFrame([[data.mood_score]], columns=["mood_score"])
    pred = mood_model.predict(X)
    result = mood_encoder.inverse_transform(pred)[0]
    return {"status": result}


@app.post("/predict/sleep")
def predict_sleep(data: SleepRequest):
    X = pd.DataFrame([[data.sleep_hours]], columns=["sleep_hours"])
    pred = sleep_model.predict(X)
    result = sleep_encoder.inverse_transform(pred)[0]
    return {"status": result}


@app.post("/predict/activity")
def predict_activity(data: ActivityRequest):
    X = pd.DataFrame(
        [[data.steps, data.exercise_minutes]],
        columns=["steps", "exercise_minutes"]
    )
    pred = activity_model.predict(X)
    result = activity_encoder.inverse_transform(pred)[0]
    return {"status": result}


@app.post("/predict/nutrition")
def predict_nutrition(data: NutritionRequest):
    X = pd.DataFrame(
        [[
            data.protein_count,
            data.vegetable_count,
            data.carb_count,
            data.junk_count,
            data.meal_count
        ]],
        columns=[
            "protein_count",
            "vegetable_count",
            "carb_count",
            "junk_count",
            "meal_count"
        ]
    )
    pred = nutrition_model.predict(X)
    result = nutrition_encoder.inverse_transform(pred)[0]
    return {"status": result}


@app.post("/predict/general")
def predict_general(data: GeneralRequest):
    encoded_data = {
        "activity_status": general_input_encoders["activity_status"].transform([data.activity_status])[0],
        "sleep_status": general_input_encoders["sleep_status"].transform([data.sleep_status])[0],
        "mood_status": general_input_encoders["mood_status"].transform([data.mood_status])[0],
        "nutrition_status": general_input_encoders["nutrition_status"].transform([data.nutrition_status])[0],
    }

    X = pd.DataFrame([encoded_data])
    pred = general_model.predict(X)
    result = general_target_encoder.inverse_transform(pred)[0]
    return {"status": result}