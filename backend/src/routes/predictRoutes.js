import express from "express";
import predictController from "../controllers/predictController.js";

const router = express.Router();

// run prediction manually
router.post("/run", predictController.predictFailure);

// get history (Dashboard.jsx)
router.get("/history", predictController.getPredictionHistory);

// auto (optional)
router.post("/auto", predictController.autoPredict);

export default router;
