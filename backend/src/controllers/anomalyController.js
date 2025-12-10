// backend/src/controllers/anomalyController.js
import { runAnomalyDetection, saveAnomaly } from "../services/anomaly/anomalyService.js";

/**
 * POST /api/anomaly
 * Body: { Type, air_temp, process_temp, rpm, torque, tool_wear, machine_id (optional) }
 */
export const detectAnomaly = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await runAnomalyDetection(payload);

    const saved = await saveAnomaly({
      machine_id: payload.machine_id ?? null,
      type: payload.Type ?? "M",
      air_temp: payload.air_temp ?? null,
      process_temp: payload.process_temp ?? null,
      rpm: payload.rpm ?? null,
      torque: payload.torque ?? null,
      tool_wear: payload.tool_wear ?? null,
      is_anomaly: result.is_anomaly,
      score: result.score,
      status: result.status,
      raw: result.raw,
    });

    globalThis._io?.emit("anomaly:update", {
      machine_id: saved.machine_id,
      is_anomaly: saved.is_anomaly,
      score: saved.score,
      status: saved.status,
      timestamp: saved.created_at,
    });

    return res.json({
      status: "success",
      data: saved,
    });
  } catch (err) {
    next(err);
  }
};

export const getAnomalyMachines = async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT DISTINCT ON(machine_id)
        machine_id, score, is_anomaly, created_at
      FROM anomaly_logs
      WHERE is_anomaly=true
      ORDER BY machine_id, created_at DESC;
    `);

    res.json({
      success: true,
      count: q.rowCount,
      data: q.rows
    });

  } catch (error) {
    console.error("[ANOMALY_FETCH_ERROR]", error);
    res.status(500).json({ error: "Gagal mengambil data anomaly mesin" });
  }
};

export default {
  detectAnomaly,
  getAnomalyMachines,
};
