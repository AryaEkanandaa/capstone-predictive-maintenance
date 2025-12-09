// backend/src/services/prediction/predictionService.js
import fetch from "node-fetch";
import { mapStatus } from "./autoPredictionService.js"; // status mapping dari ML result


export async function runFailurePrediction(payload) {
    const mlUrl = process.env.ML_API_URL || "http://localhost:8001/predict"; // FastAPI endpoint

    const response = await fetch(mlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const err = new Error("ML server error");
        err.detail = data;
        throw err;
    }

    const predictedFailure = data.predicted_failure || "Unknown";
    const confidence = data.confidence ?? 0;

    const status = mapStatus(predictedFailure, confidence);

    return {
        predicted_failure: predictedFailure,
        confidence,
        status,
        raw: data, // original ML response
    };
}
