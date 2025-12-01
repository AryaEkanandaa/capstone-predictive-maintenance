import { pool } from "../db/db.js";
import { runAnomalyDetection } from "../services/modelService.js";

export const detectAnomaly = async (req, res, next) => {
  try {
    const payload = req.body;

    const result = await runAnomalyDetection(payload);

    await pool.query(
      `INSERT INTO anomaly_logs (is_anomaly) VALUES ($1)`,
      [result.isAnomaly]
    );

    return res.json({
      status: "success",
      message: "Anomaly detection complete",
      data: result
    });

  } catch (err) {
    next(err);
  }
};
