// backend/src/services/mlService.js
import axios from "axios";

const ML_SERVER = "http://localhost:8000/predict"; // ganti sesuai endpoint python-mu

export async function runPrediction(sensorPayload) {
  try {
    const res = await axios.post(ML_SERVER, sensorPayload, {
      timeout: 8000, // biar tidak nge-freeze
    });
    return res.data; // pastikan server Python return JSON
  } catch (err) {
    console.error("❌ ML Server Error:", err.message);
    throw new Error("ML server tidak merespon");
  }
}
