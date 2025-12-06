import { pool } from "../db/db.js";
import { runFailurePrediction } from "../services/prediction/predictionService.js";

function getStatus(label, prob) {
  if (label === "No Failure") return "NORMAL";
  if (prob >= 0.8) return "CRITICAL";
  if (prob >= 0.4) return "WARNING";
  return "NORMAL";
}

export const predictFailure = async (req, res, next) => {
  try {
    const payload = req.body;

    const required = ["Type", "air_temp", "process_temp", "rpm", "torque", "tool_wear"];
    for (const key of required) {
      if (payload[key] === undefined) {
        return res.status(400).json({ status: "error", message: `Missing field: ${key}` });
      }
    }

    const prediction = await runFailurePrediction(payload);
    const machineId = payload.machine_id ?? null;

    const status = getStatus(prediction.predicted_failure, prediction.confidence);

    const insertQ = `
      INSERT INTO prediction_logs (machine_id, failure_type, failure_probability, status)
      VALUES ($1, $2, $3, $4)
      RETURNING created_at
    `;

    const insert = await pool.query(insertQ, [
      machineId,
      prediction.predicted_failure,
      prediction.confidence,
      status
    ]);

    const createdAt = insert.rows[0]?.created_at ?? new Date().toISOString();

    globalThis._io?.emit("prediction:update", {
      machine_id: machineId,
      failure_type: prediction.predicted_failure,
      failure_probability: prediction.confidence,
      status,
      timestamp: createdAt
    });

    return res.json({
      status: "success",
      data: { ...prediction, status }
    });

  } catch (err) {
    next(err);
  }
};

export const getPredictionHistory = async (req, res) => {
  const r = await pool.query(`
    SELECT * FROM prediction_logs
    ORDER BY created_at DESC LIMIT 200
  `);

  res.json({ success:true, data:r.rows });
};

export const getLatestPredictionPerMachine = async (req,res)=>{
  const r = await pool.query(`
    SELECT DISTINCT ON (machine_id)
      machine_id, failure_type, failure_probability, status, created_at
    FROM prediction_logs
    ORDER BY machine_id, created_at DESC
  `);

  res.json({ success:true, data:r.rows });
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

  const r = await pool.query(`
    SELECT * FROM prediction_logs
    WHERE machine_id=$1 ${filter}
    ORDER BY created_at DESC
    LIMIT 200
  `,[id]);

  res.json({ data: r.rows });
};


export default {
  predictFailure,
  getPredictionHistory,
  getLatestPredictionPerMachine,
  getPredictionHistoryByMachine,
};
