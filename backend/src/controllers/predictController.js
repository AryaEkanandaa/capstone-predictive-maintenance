// backend/src/controllers/predictController.js
import { pool } from "../db/db.js";
import { runFailurePrediction, mapStatus, savePrediction } from "../services/prediction/predictionService.js";

export const predictFailure = async (req, res, next) => {
  try {
    const payload = req.body;
    const required = ["Type", "air_temp", "process_temp", "rpm", "torque", "tool_wear"];
    for (const key of required) {
      if (payload[key] === undefined) {
        return res.status(400).json({ status: "error", message: `Missing field: ${key}` });
      }
    }

    const result = await runFailurePrediction(payload);
    const status = mapStatus(result.predicted_failure, result.confidence);
    const machineId = payload.machine_id ?? null;

    const saved = await savePrediction({
      machine_id: machineId,
      predicted_failure: result.predicted_failure,
      confidence: result.confidence,
      status,
      raw: result.raw,
    });

    globalThis._io?.emit("prediction:update", {
      machine_id: machineId,
      failure_type: saved.failure_type,
      failure_probability: saved.failure_probability,
      status: saved.status,
      timestamp: saved.created_at,
    });

    return res.json({ status: "success", data: saved });
  } catch (err) {
    next(err);
  }
};

export const getPredictionHistory = async (req, res) => {
  const r = await pool.query(`SELECT * FROM prediction_logs ORDER BY created_at DESC LIMIT 200`);
  res.json({ success: true, data: r.rows });
};

export const getLatestPredictionPerMachine = async (req, res) => {
  const r = await pool.query(`
    SELECT DISTINCT ON (machine_id)
      machine_id, failure_type, failure_probability, status, created_at
    FROM prediction_logs
    ORDER BY machine_id, created_at DESC
  `);
  res.json({ success: true, data: r.rows });
};

export const getPredictionHistoryByMachine = async (req, res) => {
  const id = Number(req.params.id);
  const range = req.query.range || "ALL";
  const status = req.query.status || "ALL";

  let filter = "";
  if (range === "1h") filter += " AND created_at >= NOW() - INTERVAL '1 hour'";
  if (range === "24h") filter += " AND created_at >= NOW() - INTERVAL '1 day'";
  if (range === "7d") filter += " AND created_at >= NOW() - INTERVAL '7 days'";
  if (status !== "ALL") filter += ` AND status='${status}'`;

  const r = await pool.query(
    `SELECT * FROM prediction_logs WHERE machine_id=$1 ${filter} ORDER BY created_at DESC LIMIT 200`,
    [id]
  );

  res.json({ data: r.rows });
};

export const getMachineByStatus = async (req, res) => {
  const status = req.params.status.toUpperCase();

  if (!["CRITICAL", "WARNING", "NORMAL"].includes(status)) {
    return res.status(400).json({ error: "Status harus NORMAL/WARNING/CRITICAL" });
  }

  const q = await pool.query(`
    SELECT DISTINCT ON(machine_id)
      machine_id, failure_type, failure_probability, status, created_at
    FROM prediction_logs
    WHERE status='${status}'
    ORDER BY machine_id, created_at DESC;
  `);

  res.json({ status, count: q.rowCount, data: q.rows });
};


export default {
  predictFailure,
  getPredictionHistory,
  getLatestPredictionPerMachine,
  getPredictionHistoryByMachine,
  getMachineByStatus,
};
