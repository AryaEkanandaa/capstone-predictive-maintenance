import { pool } from "../../db/db.js";
import { runFailurePrediction } from "../modelService.js";

export const predictAndSave = async (payload) => {
  const result = await runFailurePrediction(payload);

  const saved = await pool.query(
    `
    INSERT INTO prediction_logs (failure_probability)
    VALUES ($1)
    RETURNING *
    `,
    [result.failureProbability]
  );

  return { ...result, saved: saved.rows[0] };
};

export const getHistory = async () => {
  const r = await pool.query(`
    SELECT * FROM prediction_logs ORDER BY created_at DESC
  `);
  return r.rows;
};
