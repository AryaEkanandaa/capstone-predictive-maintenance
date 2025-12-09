import fetch from "node-fetch";
import { pool } from "../../db/db.js";

export async function autoAnomalyMonitor() {
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

    if (!latestSensor.rowCount) return;

    for (const m of latestSensor.rows) {

      const payload = {
        Type: "M",  // sementara default
        air_temp: m.air_temperature,
        process_temp: m.process_temperature,
        rpm: m.rotational_speed,
        torque: m.torque,
        tool_wear: m.tool_wear
      };

      // 🔥 panggil ML API anomaly
      const response = await fetch("http://localhost:8001/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[ANOMALY ML ERROR]", data);
        continue;
      }

      // 💡 FIX ERROR — variabel harus didefinisikan
      const is_anomaly = data.is_anomaly ?? false;
      const score = data.score ?? null;
      const status = data.status ?? "UNKNOWN";

      // 🔥 simpan hasil anomaly ke database
      await pool.query(
        `INSERT INTO anomaly_logs (machine_id, type, air_temp, process_temp, rpm, torque, tool_wear, is_anomaly, score, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [m.machine_id, "M", m.air_temperature, m.process_temperature, m.rotational_speed, m.torque, m.tool_wear, is_anomaly, score, status]
      );

      // 🔥 emit realtime ke dashboard UI
      globalThis._io?.emit("anomaly_update", {
        machine_id: m.machine_id,
        is_anomaly,
        score,
        status,
        timestamp: new Date()
      });
    }

    console.log(`[ANOMALY] Scanned ${latestSensor.rowCount} machines`);
    
  } catch (err) {
    console.error("[AUTO-ANOMALY ERROR]", err);
  }
}
