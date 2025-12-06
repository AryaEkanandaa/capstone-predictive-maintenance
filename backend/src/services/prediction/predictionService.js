// backend/src/services/prediction/predictionService.js
import fetch from "node-fetch";

export async function runFailurePrediction(payload) {
  const mlUrl = process.env.ML_API_URL || "http://localhost:8001/predict";

  const res = await fetch(mlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error("ML server error");
    err.detail = data;
    throw err;
  }

  return {
    predicted_failure: data.predicted_failure ?? data.failure_label ?? "Unknown",
    confidence: typeof data.confidence === "number" ? data.confidence : (data.confidence ?? 0),
    raw: data
  };
}
