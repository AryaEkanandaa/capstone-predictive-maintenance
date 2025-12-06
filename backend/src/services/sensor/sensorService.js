// backend/src/services/sensor/sensorService.js
import { pool } from "../../db/db.js";
import { generateSensorForMachine, getMachineCount } from "./sensorGenerator.js";

/* REALTIME GENERATION */
export const autoGenerateAllMachines = async () => {
  const machineCount = getMachineCount();
  const results = [];

  for (let id = 1; id <= machineCount; id++) {
    const data = generateSensorForMachine(id);
    const saved = await saveSensorLog(data);
    results.push(saved);
  }

  return results;
};

/* SAVE SENSOR LOG */
export const saveSensorLog = async (payload) => {
  const {
    machine_id,
    airTemperature,
    processTemperature,
    rotationalSpeed,
    torque,
    toolWear,
  } = payload;

  const q = `
    INSERT INTO sensor_logs
      (machine_id, air_temperature, process_temperature, rotational_speed, torque, tool_wear)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `;

  const r = await pool.query(q, [
    machine_id,
    airTemperature,
    processTemperature,
    rotationalSpeed,
    torque,
    toolWear,
  ]);

  const saved = r.rows[0];

  // Emit socket event for sensor update
  try {
    const io = globalThis._io;
    if (io) {
      io.emit("sensor:update", {
        machine_id: saved.machine_id,
        air_temperature: saved.air_temperature,
        process_temperature: saved.process_temperature,
        rotational_speed: saved.rotational_speed,
        torque: saved.torque,
        tool_wear: saved.tool_wear,
        created_at: saved.created_at
      });
    }
  } catch (e) {
    console.error("Socket emit error (saveSensorLog)", e);
  }

  return saved;
};

/* LATEST SENSOR */
export const getLatestByMachine = async (machine_id) => {
  const r = await pool.query(
    `
    SELECT *
    FROM sensor_logs
    WHERE machine_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [machine_id]
  );

  return r.rows[0] || null;
};

export const getLatestAll = async () => {
  const count = getMachineCount();
  const result = [];

  for (let id = 1; id <= count; id++) {
    result.push(await getLatestByMachine(id));
  }

  return result;
};

/* SENSOR HISTORY */
export const getSensorHistory = async ({
  page = 1,
  limit = 50,
  date_from,
  date_to,
  machine_id,
  range,
}) => {
  const offset = (page - 1) * limit;
  const filters = [];
  const values = [];

  if (machine_id) {
    values.push(machine_id);
    filters.push(`machine_id = $${values.length}`);
  }

  if (date_from) {
    values.push(date_from);
    filters.push(`created_at >= $${values.length}`);
  }

  if (date_to) {
    values.push(date_to);
    filters.push(`created_at <= $${values.length}`);
  }

  if (range) {
    const map = { "1h": "1 hour", "24h": "1 day", "7d": "7 days", "30d": "30 days" };
    if (map[range]) {
      filters.push(`created_at >= NOW() - INTERVAL '${map[range]}'`);
    }
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const countQ = `SELECT COUNT(*)::int AS total FROM sensor_logs ${where}`;

  const dataQ = `
    SELECT *
    FROM sensor_logs
    ${where}
    ORDER BY created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limit, offset);

  const [countRes, rowsRes] = await Promise.all([
    pool.query(countQ, values.slice(0, -2)),
    pool.query(dataQ, values),
  ]);

  return {
    page,
    limit,
    total: countRes.rows[0].total,
    data: rowsRes.rows,
  };
};

/* STATS (PER MACHINE) */
export const getSensorStats = async (machine_id) => {
  const r = await pool.query(
    `
    SELECT 
      AVG(air_temperature)::numeric(10,2) AS avgTemp,
      MIN(air_temperature) AS minTemp,
      MAX(air_temperature) AS maxTemp,
      AVG(torque)::numeric(10,2) AS avgTorque,
      MAX(rotational_speed) AS maxSpeed,
      COUNT(*) AS dataPoints
    FROM sensor_logs
    WHERE machine_id = $1
    `,
    [machine_id]
  );

  return r.rows[0];
};

export default {
  autoGenerateAllMachines,
  saveSensorLog,
  getLatestAll,
  getLatestByMachine,
  getSensorHistory,
  getSensorStats,
};
