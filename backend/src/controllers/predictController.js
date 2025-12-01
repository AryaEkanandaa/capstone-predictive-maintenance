import { pool } from "../db/db.js";
import { runFailurePrediction } from "../services/modelService.js";

// === 1. RUN prediction 1x (yang sudah kamu punya) ===
export const predictFailure = async (req, res, next) => {
  try {
    const payload = req.body;

    const result = await runFailurePrediction(payload);

    await pool.query(
      `INSERT INTO prediction_logs (failure_probability) VALUES ($1)`,
      [result.failureProbability]
    );

    return res.json({
      status: "success",
      message: "Failure prediction complete",
      data: result
    });

  } catch (err) {
    next(err);
  }
};

// === 2. HISTORY prediction untuk Dashboard.jsx ===
export const getPredictionHistory = async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT * FROM prediction_logs ORDER BY created_at DESC LIMIT 100`
    );

    const formatted = r.rows.map((p) => ({
      machine_name: "Machine 1", // sementara default
      prediction_text: `Failure probability: ${p.failure_probability}`,
      prediction_date: p.created_at,
    }));

    return res.json({
      status: "success",
      data: formatted
    });

  } catch (err) {
    next(err);
  }
};

// optional: AUTO PREDICT semua mesin
export const autoPredict = async (req, res, next) => {
  try {
    // jika nanti kamu punya sensorService.getLatest
    return res.json({ status: "success", message: "Auto predict not implemented yet" });
  } catch (err) {
    next(err);
  }
};

export default {
  predictFailure,
  getPredictionHistory,
  autoPredict
};
