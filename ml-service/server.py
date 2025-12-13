# ============================================================
#  ML-SERVICE FINAL VERSION (Prediction + Anomaly + Trend)
#  FastAPI with all endpoints needed for AI Agent & n8n Tools
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import requests

app = FastAPI(title="Predictive Maintenance ML Service")

# ============================================================
#  CONFIG: BACKEND (untuk ambil sensor data)
# ============================================================

BACKEND_URL = "http://localhost:5000"      # <- ubah jika perlu


# ============================================================
#  LOAD MODEL PREDIKSI FAILURE (XGBoost + scaler + encoders)
# ============================================================

MODEL_PATH = "./models/model.pkl"
SCALER_PATH = "./models/scaler.pkl"
FAILURE_LE_PATH = "./models/failure_le.pkl"
TYPE_LE_PATH = "./models/type_le.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
failure_le = joblib.load(FAILURE_LE_PATH)
type_le = joblib.load(TYPE_LE_PATH)

FEATURE_ORDER = [
    "Type", "air_temp", "process_temp", "rpm", "torque", "tool_wear",
    "temp_diff", "torque_rpm_ratio", "power", "temp_stress",
    "wear_per_rpm", "torque_squared", "tool_wear_squared",
    "torque_wear_interaction", "rpm_temp_interaction", "power_wear_ratio",
]


# ============================================================
#  PREDICTION REQUEST BODY
# ============================================================

class PredictRequest(BaseModel):
    Type: str
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float


# ============================================================
#  FEATURE ENGINEERING PREDICTION
# ============================================================

def make_features_from_input(d: dict) -> pd.DataFrame:
    df = pd.DataFrame([d])

    if df.loc[0, "Type"] not in list(type_le.classes_):
        raise ValueError(f"Unknown Type '{df.loc[0, 'Type']}', allowed: {list(type_le.classes_)}")

    df["Type"] = type_le.transform(df["Type"])

    df["temp_diff"] = df["process_temp"] - df["air_temp"]
    df["torque_rpm_ratio"] = df["torque"] / (df["rpm"] + 1e-5)
    df["power"] = df["torque"] * df["rpm"] / 9.5488
    df["temp_stress"] = df["process_temp"] / (df["air_temp"] + 1e-5)
    df["wear_per_rpm"] = df["tool_wear"] / (df["rpm"] + 1e-5)
    df["torque_squared"] = df["torque"] ** 2
    df["tool_wear_squared"] = df["tool_wear"] ** 2
    df["torque_wear_interaction"] = df["torque"] * df["tool_wear"]
    df["rpm_temp_interaction"] = df["rpm"] * df["temp_diff"]
    df["power_wear_ratio"] = df["power"] / (df["tool_wear"] + 1e-5)

    missing = [c for c in FEATURE_ORDER if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    return df[FEATURE_ORDER]


def get_status(pred_failure: str, anomaly_label: int = 0):
    if pred_failure not in ["No Failure", "NO_FAILURE"]:
        return "CRITICAL"
    if anomaly_label == 1:
        return "WARNING"
    return "NORMAL"


# ============================================================
#  ENDPOINT: RAW PREDICTION
# ============================================================

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        df_input = make_features_from_input(req.dict())
        X_scaled = scaler.transform(df_input)
        pred_encoded = model.predict(X_scaled)[0]

        probabilities = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X_scaled)[0]

        pred_failure = failure_le.inverse_transform([pred_encoded])[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    prob_dict = {}
    if probabilities is not None:
        for idx, prob in enumerate(probabilities):
            try:
                label = failure_le.inverse_transform([idx])[0]
            except:
                label = str(idx)
            prob_dict[label] = float(prob)

    status = get_status(pred_failure)

    return {
        "predicted_failure": pred_failure,
        "confidence": float(probabilities[pred_encoded]) if probabilities is not None else None,
        "probabilities": prob_dict or None,
        "status": status,
        "input_features": df_input.to_dict(orient="records")[0],
    }


# ============================================================
#  ENDPOINT: PREDICT LATEST BASED ON BACKEND SENSOR DATA
# ============================================================

@app.get("/predict/latest/{machine_id}")
def predict_latest(machine_id: int):
    try:
        sensor = requests.get(f"{BACKEND_URL}/api/machines/latest/{machine_id}").json()

        req = PredictRequest(
            Type=sensor["Type"],
            air_temp=sensor["air_temp"],
            process_temp=sensor["process_temp"],
            rpm=sensor["rpm"],
            torque=sensor["torque"],
            tool_wear=sensor["tool_wear"]
        )

        return predict(req)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor error: {str(e)}")


# ============================================================
#  LOAD ANOMALY MODEL
# ============================================================

ANOMALY_MODEL_PATH = "./models/model_anomaly/anomaly_isoforest.pkl"
ANOMALY_SCALER_PATH = "./models/model_anomaly/anomaly_scaler.pkl"
ANOMALY_TYPE_LE_PATH = "./models/model_anomaly/anomaly_type_le.pkl"
ANOMALY_META_PATH = "./models/model_anomaly/model_metadata.pkl"

try:
    anomaly_model = joblib.load(ANOMALY_MODEL_PATH)
    anomaly_scaler = joblib.load(ANOMALY_SCALER_PATH)
    anomaly_type_le = joblib.load(ANOMALY_TYPE_LE_PATH)
    anomaly_meta = joblib.load(ANOMALY_META_PATH)
except:
    anomaly_model = None


ANOMALY_FEATURES = [
    "Type","air_temp","process_temp","rpm","torque","tool_wear",
    "temp_diff","torque_rpm_ratio","power","temp_stress","wear_per_rpm",
    "torque_squared","tool_wear_squared","torque_wear_interaction",
    "rpm_temp_interaction","power_wear_ratio",
    "air_temp_rolling_mean","air_temp_rolling_std",
    "process_temp_rolling_mean","process_temp_rolling_std",
    "rpm_rolling_mean","rpm_rolling_std",
    "torque_rolling_mean","torque_rolling_std",
    "tool_wear_rolling_mean","tool_wear_rolling_std"
]


class AnomalyRequest(BaseModel):
    Type: str
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float


def make_features_for_anomaly(d: dict):
    if anomaly_model is None:
        raise RuntimeError("Anomaly model missing")

    df = pd.DataFrame([d])
    df["Type"] = anomaly_type_le.transform([d["Type"]])[0]

    # engineered features
    df["temp_diff"] = df["process_temp"] - df["air_temp"]
    df["torque_rpm_ratio"] = df["torque"] / (df["rpm"] + 1e-5)
    df["power"] = df["torque"] * df["rpm"] / 9.5488
    df["temp_stress"] = df["process_temp"] / (df["air_temp"] + 1e-5)
    df["wear_per_rpm"] = df["tool_wear"] / (df["rpm"] + 1e-5)
    df["torque_squared"] = df["torque"] ** 2
    df["tool_wear_squared"] = df["tool_wear"] ** 2
    df["torque_wear_interaction"] = df["torque"] * df["tool_wear"]
    df["rpm_temp_interaction"] = df["rpm"] * df["temp_diff"]
    df["power_wear_ratio"] = df["power"] / (df["tool_wear"] + 1e-5)

    # rolling (1-step)
    for col in ["air_temp","process_temp","rpm","torque","tool_wear"]:
        df[f"{col}_rolling_mean"] = df[col]
        df[f"{col}_rolling_std"] = 0.0

    return df[ANOMALY_FEATURES]


# ============================================================
#  ENDPOINT: RAW ANOMALY
# ============================================================

@app.post("/anomaly")
def anomaly(req: AnomalyRequest):
    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly model not loaded")

    df = make_features_for_anomaly(req.dict())
    X_scaled = anomaly_scaler.transform(df)

    raw_pred = anomaly_model.predict(X_scaled)[0]
    is_anomaly = 1 if raw_pred == -1 else 0

    score = None
    if hasattr(anomaly_model, "decision_function"):
        score = float(anomaly_model.decision_function(X_scaled)[0])

    return {
        "is_anomaly": bool(is_anomaly),
        "score": score,
        "status": "WARNING" if is_anomaly else "NORMAL",
        "input_features": df.to_dict(orient="records")[0],
        "metadata": anomaly_meta,
    }


# ============================================================
#  ENDPOINT: ANOMALY LATEST BASED ON BACKEND SENSOR
# ============================================================

@app.get("/anomaly/latest/{machine_id}")
def anomaly_latest(machine_id: int):
    try:
        sensor = requests.get(f"{BACKEND_URL}/api/machines/latest/{machine_id}").json()

        req = AnomalyRequest(
            Type=sensor["Type"],
            air_temp=sensor["air_temp"],
            process_temp=sensor["process_temp"],
            rpm=sensor["rpm"],
            torque=sensor["torque"],
            tool_wear=sensor["tool_wear"]
        )

        return anomaly(req)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor error: {str(e)}")


# ============================================================
#  ENDPOINT TREND (ambil dari backend)
# ============================================================

@app.get("/trend/{machine_id}")
def trend(machine_id: int):
    try:
        url = f"{BACKEND_URL}/api/machines/trend/{machine_id}"
        return requests.get(url).json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
#  HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service"}


# ============================================================
#  ROOT
# ============================================================

@app.get("/")
def home():
    return {"message": "ML API is running"}
