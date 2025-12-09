# server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="Predictive Maintenance ML API (compatible with notebook)")

# ============================================================
#  LOAD MODEL PREDIKSI FAILURE (XGBoost + scaler + encoder)
# ============================================================
MODEL_PATH = "./models/model.pkl"
SCALER_PATH = "./models/scaler.pkl"
FAILURE_LE_PATH = "./models/failure_le.pkl"
TYPE_LE_PATH = "./models/type_le.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
failure_le = joblib.load(FAILURE_LE_PATH)
type_le = joblib.load(TYPE_LE_PATH)

# ----- expected feature order (must match training X.columns) -----
FEATURE_ORDER = [
    "Type",
    "air_temp",
    "process_temp",
    "rpm",
    "torque",
    "tool_wear",
    "temp_diff",
    "torque_rpm_ratio",
    "power",
    "temp_stress",
    "wear_per_rpm",
    "torque_squared",
    "tool_wear_squared",
    "torque_wear_interaction",
    "rpm_temp_interaction",
    "power_wear_ratio",
]

# ============================================================
#  REQUEST BODY UNTUK PREDICTION & ANOMALY
# ============================================================
class PredictRequest(BaseModel):
    Type: str          # 'L', 'M', 'H'
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float


# ============================================================
#  FEATURE ENGINEERING (dipakai oleh predict & anomaly)
# ============================================================
def make_features_from_input(d: dict) -> pd.DataFrame:
    """
    Build DataFrame dengan fitur engineered (tanpa rolling)
    sesuai urutan training untuk model prediction.
    """
    df = pd.DataFrame([d])

    # Encode Type pakai label encoder yang disimpan
    if df.loc[0, "Type"] not in list(type_le.classes_):
        raise ValueError(
            f"Type '{df.loc[0, 'Type']}' not recognized. "
            f"Allowed: {list(type_le.classes_)}"
        )

    df["Type"] = type_le.transform(df["Type"])

    # Feature engineering seperti di notebook prediction
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

    # Pastikan semua kolom untuk model prediction ada dan berurutan
    missing = [c for c in FEATURE_ORDER if c not in df.columns]
    if missing:
        raise ValueError(f"Missing engineered columns: {missing}")

    df = df[FEATURE_ORDER]
    return df


def get_status(pred_failure_label: str, anomaly_label: int = 0) -> str:
    """
    Mapping sederhana ke status health:
    - pred_failure != No Failure  -> CRITICAL
    - anomaly label 1             -> WARNING
    - lainnya                     -> NORMAL
    """
    if pred_failure_label != "No Failure" and pred_failure_label != "NO_FAILURE":
        return "CRITICAL"
    if anomaly_label == 1:
        return "WARNING"
    return "NORMAL"


# ============================================================
#  ENDPOINT PREDICTION (TIDAK DIUBAH)
# ============================================================
@app.post("/predict")
def predict(req: PredictRequest):
    try:
        payload = req.dict()
        df_input = make_features_from_input(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature engineering error: {str(e)}")

    # Scale features using saved scaler
    try:
        X_scaled = scaler.transform(df_input)  # scaler fitted on same columns
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scaling error: {str(e)}")

    # Predict failure using model
    try:
        pred_encoded = model.predict(X_scaled)[0]
        probabilities = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X_scaled)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {str(e)}")

    # decode prediction
    try:
        pred_failure = failure_le.inverse_transform([pred_encoded])[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Label decode error: {str(e)}")

    # build probabilities dict (if available)
    prob_dict = {}
    if probabilities is not None:
        for idx, prob in enumerate(probabilities):
            try:
                label = failure_le.inverse_transform([idx])[0]
            except Exception:
                label = str(idx)
            prob_dict[label] = float(prob)

    anomaly_label = 0  # di sini belum pakai model anomaly
    status = get_status(pred_failure, anomaly_label)

    return {
        "predicted_failure": pred_failure,
        "confidence": float(probabilities[pred_encoded]) if probabilities is not None else None,
        "probabilities": prob_dict if prob_dict else None,
        "status": status,
        "input_features": df_input.to_dict(orient="records")[0],
    }


# ============================================================
#  🔥 BAGIAN BARU: MODEL ANOMALY (ISOLATION FOREST)
# ============================================================

# Path model anomaly (folder: model_anomaly)
ANOMALY_MODEL_PATH = "./models/model_anomaly/anomaly_isoforest.pkl"
ANOMALY_SCALER_PATH = "./models/model_anomaly/anomaly_scaler.pkl"
ANOMALY_TYPE_LE_PATH = "./models/model_anomaly/anomaly_type_le.pkl"
ANOMALY_META_PATH = "./models/model_anomaly/model_metadata.pkl"

# Load anomaly objects
try:
    anomaly_model = joblib.load(ANOMALY_MODEL_PATH)
    anomaly_scaler = joblib.load(ANOMALY_SCALER_PATH)
    anomaly_type_le = joblib.load(ANOMALY_TYPE_LE_PATH)
    anomaly_meta = joblib.load(ANOMALY_META_PATH)
except Exception:
    anomaly_model = None
    anomaly_scaler = None
    anomaly_type_le = None
    anomaly_meta = None

# urutan fitur yang dipakai waktu training anomaly
ANOMALY_FEATURES = [
    "Type",
    "air_temp",
    "process_temp",
    "rpm",
    "torque",
    "tool_wear",
    "temp_diff",
    "torque_rpm_ratio",
    "power",
    "temp_stress",
    "wear_per_rpm",
    "torque_squared",
    "tool_wear_squared",
    "torque_wear_interaction",
    "rpm_temp_interaction",
    "power_wear_ratio",
    "air_temp_rolling_mean",
    "air_temp_rolling_std",
    "process_temp_rolling_mean",
    "process_temp_rolling_std",
    "rpm_rolling_mean",
    "rpm_rolling_std",
    "torque_rolling_mean",
    "torque_rolling_std",
    "tool_wear_rolling_mean",
    "tool_wear_rolling_std",
]


def make_features_for_anomaly(d: dict) -> pd.DataFrame:

    if anomaly_model is None or anomaly_scaler is None:
        raise RuntimeError("Anomaly model is not loaded")

    # gunakan raw input (TIDAK lagi lewat make_features_from_input)
    df = pd.DataFrame([d])

    # encode type pakai anomaly encoder
    df["Type"] = anomaly_type_le.transform([d["Type"]])[0]

    # feature engineering (sama persis prediction)
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

    # rolling feature by 1 (seperti notebook kamu)
    for col in ["air_temp","process_temp","rpm","torque","tool_wear"]:
        df[f"{col}_rolling_mean"] = df[col]
        df[f"{col}_rolling_std"] = 0.0

    df = df[ANOMALY_FEATURES]
    return df


class AnomalyRequest(BaseModel):
    Type: str
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float


@app.post("/anomaly")
def anomaly(req: AnomalyRequest):
    if anomaly_model is None or anomaly_scaler is None:
        raise HTTPException(
            status_code=500,
            detail="Anomaly model is not loaded. Pastikan file di folder model_anomaly/"
        )

    try:
        df = make_features_for_anomaly(req.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature engineering error: {str(e)}")

    # Scaling
    try:
        X_scaled = anomaly_scaler.transform(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly scaling error: {str(e)}")

    # Isolation Forest prediction: -1 = anomaly, 1 = normal
    try:
        raw_pred = anomaly_model.predict(X_scaled)[0]
        is_anomaly = 1 if raw_pred == -1 else 0
        score = None
        if hasattr(anomaly_model, "decision_function"):
            score = float(anomaly_model.decision_function(X_scaled)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly model error: {str(e)}")

    status = "WARNING" if is_anomaly == 1 else "NORMAL"

    return {
        "is_anomaly": bool(is_anomaly),
        "score": score,
        "status": status,
        "metadata": anomaly_meta if anomaly_meta is not None else None,
        "input_features": df.to_dict(orient="records")[0],
    }


# ============================================================
#  ROOT
# ============================================================
@app.get("/")
def home():
    return {"message": "ML API is running (compatible with notebook training)."}
