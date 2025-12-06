// backend/src/services/prediction/autoPredictionService.js
import { pool } from "../../db/db.js";
import { runFailurePrediction } from "./predictionService.js";

/** =============================
 * Hitung status berdasarkan ML
 * ============================= */
function mapStatus(predictedFailure, probability) {
  if (predictedFailure === "No Failure") return "NORMAL";
  if (probability >= 0.8) return "CRITICAL";
  if (probability >= 0.4) return "WARNING";
  return "NORMAL";
}

/** ===========================================================
 *  AUTO PREDICT setiap 5 detik → emit realtime ke front-end UI
 * =========================================================== */
export async function autoPredictAllMachines() {
  try {
    const latestSensor = await pool.query(`
      SELECT DISTINCT ON (machine_id)
          machine_id,
          air_temperature,
          process_temperature,
          rotational_speed,
          torque,
          tool_wear,
          created_at
      FROM sensor_logs
      ORDER BY machine_id, created_at DESC
    `);

    if (!latestSensor.rowCount) return 0;
    const machines = latestSensor.rows;

    for (const m of machines) {
      const payload = {
        Type: "M",
        air_temp: m.air_temperature,
        process_temp: m.process_temperature,
        rpm: m.rotational_speed,
        torque: m.torque,
        tool_wear: m.tool_wear,
      };

      const prediction = await runFailurePrediction(payload);
      const status = mapStatus(prediction.predicted_failure, prediction.confidence);

      // **Simpan ke DB lengkap**
      await pool.query(`
        INSERT INTO prediction_logs (machine_id, failure_type, failure_probability, status)
        VALUES ($1,$2,$3,$4)
      `, [
        m.machine_id,
        prediction.predicted_failure,
        prediction.confidence,
        status
      ]);

      // 🔥 EMIT SOCKET ke UI secara realtime
      globalThis._io?.emit("prediction_update", {
        machine_id: m.machine_id,
        failure_type: prediction.predicted_failure,
        failure_probability: prediction.confidence,
        status,
        timestamp: new Date().toISOString()
      });
    }

    return machines.length;
    
  } catch (err) {
    console.error("[AUTO-PREDICT ERROR]", err);
    return 0;
  }
}
