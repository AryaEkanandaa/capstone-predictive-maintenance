import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { pool } from "../db/db.js";

const router = express.Router();

/* CREATE ── logbook maintenance */
router.post("/log", verifyAuth, async (req, res) => {
  try {
    const { machine_id, action_taken, notes, status_before, status_after } = req.body;

    // 🔥 GANTI — gunakan nama lengkap dari token (lebih profesional)
    const technician = req.user.full_name;  

    if (!machine_id || !action_taken || !status_before || !status_after) {
      return res.status(400).json({ success: false, message: "Missing mandatory fields" });
    }

    await pool.query(`
      INSERT INTO maintenance_logs 
      (machine_id, action_taken, technician, notes, status_before, status_after)
      VALUES ($1,$2,$3,$4,$5,$6)
    `,[machine_id, action_taken, technician, notes, status_before, status_after]);

    return res.json({ success: true, message: "Maintenance log added." });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* READ ── semua log */
router.get("/history", verifyAuth, async (req, res) => {
  const r = await pool.query(`SELECT * FROM maintenance_logs ORDER BY created_at DESC`);
  res.json({ success: true, data: r.rows });
});

/* READ ── log per machine */
router.get("/history/:id", verifyAuth, async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    `SELECT * FROM maintenance_logs WHERE machine_id=$1 ORDER BY created_at DESC`,
    [id]
  );
  res.json({ success: true, data: r.rows });
});

export default router;
