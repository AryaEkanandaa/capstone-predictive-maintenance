# server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="Predictive Maintenance ML API (compatible with notebook)")

# ----- load models (pastikan file ada di ./models/) -----
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

# ----- request schema: we accept minimal raw fields (as in your notebook) -----
class PredictRequest(BaseModel):
    Type: str                  # e.g. 'L', 'M', 'H' as in your dataset
    air_temp: float
    process_temp: float
    rpm: float
    torque: float
    tool_wear: float

def make_features_from_input(d: dict) -> pd.DataFrame:
    """
    Build DataFrame with engineered features in the exact order used during training.
    """
    df = pd.DataFrame([d])

    # Encode Type using saved label encoder
    # Check validity
    if df.loc[0, "Type"] not in list(type_le.classes_):
        raise ValueError(f"Type '{df.loc[0, 'Type']}' not recognized. Allowed: {list(type_le.classes_)}")

    df["Type"] = type_le.transform(df["Type"])

    # Feature engineering exactly as in notebook
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

    # Ensure columns exist and in correct order
    missing = [c for c in FEATURE_ORDER if c not in df.columns]
    if missing:
        raise ValueError(f"Missing engineered columns: {missing}")

    df = df[FEATURE_ORDER]
    return df

def get_status(pred_failure_label: str, anomaly_label: int = 0) -> str:
    if pred_failure_label != "No Failure" and pred_failure_label != "NO_FAILURE":
        # preserve original semantics from notebook (notebook used encoded labels)
        return "CRITICAL"
    if anomaly_label == 1:
        return "WARNING"
    return "NORMAL"

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
        X_scaled = scaler.transform(df_input)  # scaler was fitted on DataFrame with same columns
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

    # NOTE: anomaly model not present in this notebook cell for prediction; if you have anomaly model, you can integrate similarly
    anomaly_label = 0
    anomaly_score = None

    status = get_status(pred_failure, anomaly_label)

    return {
        "predicted_failure": pred_failure,
        "confidence": float(probabilities[pred_encoded]) if probabilities is not None else None,
        "probabilities": prob_dict if prob_dict else None,
        "status": status,
        "input_features": df_input.to_dict(orient="records")[0],
    }

@app.get("/")
def home():
    return {"message": "ML API is running (compatible with notebook training)."}
