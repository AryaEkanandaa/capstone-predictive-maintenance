import express from "express";

import sensorRoutes from "./sensorRoutes.js";
import anomalyRoutes from "./anomalyRoutes.js";
import predictRoutes from "./predictRoutes.js";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import maintenanceRoutes from "./maintenanceRoutes.js";

import chatRoutes from "./chatRoutes.js";  // ⬅ gunakan ini (NEW)

import { verifyAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/sensor", verifyAuth, sensorRoutes);
router.use("/anomaly", verifyAuth, anomalyRoutes);
router.use("/predict", verifyAuth, predictRoutes);
router.use("/health", verifyAuth, healthRoutes);
router.use("/maintenance", verifyAuth, maintenanceRoutes);

// 🔥 CHAT BARU DENGAN DB (bukan /ask lagi)
// router.use("/chat", verifyAuth, chatRoutes);
router.use("/chat", chatRoutes);
export default router;
