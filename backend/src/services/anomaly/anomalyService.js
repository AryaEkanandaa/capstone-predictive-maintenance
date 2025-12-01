import { pool } from "../../db/db.js";
import { runAnomalyDetection } from "../modelService.js";

export const detectAndSave = async (payload) => {
  const result = await runAnomalyDetection(payload);

  const saved = await pool.query(
    `
    INSERT INTO anomaly_logs (is_anomaly, score)
    VALUES ($1, $2)
    RETURNING *
    `,
    [result.isAnomaly, result.score]
  );

  return { ...result, saved: saved.rows[0] };
};

export const getHistory = async () => {
  const r = await pool.query(`
    SELECT * FROM anomaly_logs ORDER BY created_at DESC
  `);
  return r.rows;
};
