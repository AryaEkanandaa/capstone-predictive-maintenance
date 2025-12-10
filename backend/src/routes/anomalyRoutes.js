import express from "express";
import { detectAnomaly, getAnomalyMachines } from "../controllers/anomalyController.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();

router.post("/", verifyAuth, detectAnomaly);

// 🔥 Tambahkan endpoint baru
router.get("/machines", verifyAuth, getAnomalyMachines);

export default router;
