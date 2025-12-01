// backend/server.js
import "./src/config/env.js";
import app from "./src/app.js";
import { pool } from "./src/db/db.js";
import sensorService from "./src/services/sensor/sensorService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Real-time sensor simulation (non-blocking)
    const intervalMs = 3000; // ms, ubah sesuai kebutuhan
    console.log(`Real-time sensor simulation started (${intervalMs} ms interval)`);

    setInterval(async () => {
      try {
        const inserted = await sensorService.autoGenerateAllMachines();
        console.log(`[SENSOR] Generated ${inserted.length} machine data`);
      } catch (err) {
        console.error("[SENSOR ERROR]", err.message);
      }
    }, intervalMs);

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
