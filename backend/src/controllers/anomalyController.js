// ===============================
// 🔥 ANOMALY CONTROLLER (Final)
// ===============================
import fetch from "node-fetch";
import { pool } from "../db/db.js";

export const detectAnomaly = async (req, res, next) => {
  try {
    const payload = req.body; // { Type, air_temp, process_temp, rpm, torque, tool_wear }

    // ==============================
    // 🔥 Kirim Data ke FastAPI /anomaly
    // ==============================
    const mlURL = process.env.ML_ANOMALY_URL || "http://localhost:8001/anomaly";

    const response = await fetch(mlURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        status: "failed",
        message: "❌ Anomaly API error",
        detail: data
      });
    }

    const isAnomaly = data.is_anomaly ? true : false;
    const status = data.status ?? (isAnomaly ? "WARNING" : "NORMAL");

    // ==============================
    // 💾 Simpan ke Database anomaly_logs
    // ==============================
    await pool.query(
      `INSERT INTO anomaly_logs (is_anomaly, score, status)
       VALUES ($1,$2,$3)`,
      [isAnomaly, data.score || null, status]
    );

    // ==============================
    // 🔥 Response ke Frontend
    // ==============================
    return res.json({
      status: "success",
      message: "Anomaly detection complete",
      data: {
        is_anomaly: isAnomaly,
        score: data.score ?? null,
        status: status,
        input: payload,
        model_info: data.metadata ?? {}
      }
    });

  } catch (err) {
    console.error("[ANOMALY ERROR]", err);
    next(err);
  }
};
