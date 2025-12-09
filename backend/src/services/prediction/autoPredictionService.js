// backend/src/services/prediction/autoPredictionService.js
import { pool } from "../../db/db.js";
import { runFailurePrediction } from "./predictionService.js";


/* ===============================================
📌 Status Mapping — berdasarkan Failure + Probabilitas
=============================================== */
export function mapStatus(predictedFailure, probability) {
    if (predictedFailure === "No Failure") return "NORMAL";
    if (probability >= 0.80) return "CRITICAL";
    if (probability >= 0.40) return "WARNING";
    return "NORMAL";
}


/* =====================================================
📌 AUTO PREDICT — jalankan periodik (misal 5 detik sekali)
===================================================== */
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

        for (const m of latestSensor.rows) {
            const payload = {
                Type: "M", // sementara static — nanti bisa dibuat dynamic per mesin
                air_temp: m.air_temperature,
                process_temp: m.process_temperature,
                rpm: m.rotational_speed,
                torque: m.torque,
                tool_wear: m.tool_wear,
            };

            // 🔥 Dapatkan prediksi dari FastAPI ML
            const result = await runFailurePrediction(payload);
            const status = mapStatus(result.predicted_failure, result.confidence);

            // simpan log
            await pool.query(
                `INSERT INTO prediction_logs (machine_id,failure_type,failure_probability,status)
                 VALUES ($1,$2,$3,$4)`,
                [m.machine_id, result.predicted_failure, result.confidence, status]
            );

            // Realtime emit ke dashboard UI
            globalThis._io?.emit("prediction_update", {
                machine_id: m.machine_id,
                failure_type: result.predicted_failure,
                probability: result.confidence,
                status,
                timestamp: new Date().toISOString()
            });
        }

        return latestSensor.rowCount;

    } catch (err) {
        console.error("[AUTO-PREDICT ERROR]", err);
        return 0;
    }
}
