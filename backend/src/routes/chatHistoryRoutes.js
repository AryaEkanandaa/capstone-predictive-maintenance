// src/routes/chatHistoryRoutes.js
import express from "express";
import {
  listSessions,
  createSession,
  getSession,
  listMessages,
  deleteMessage
} from "../controllers/chatHistoryController.js";

import { verifyAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();

// semua route butuh auth
router.use(verifyAuth);

// sessions
router.get("/sessions", listSessions);
router.post("/sessions", createSession);
router.get("/sessions/:sessionId", getSession);

// messages (read + delete only)
router.get("/sessions/:sessionId/messages", listMessages);
router.delete("/sessions/:sessionId/messages/:messageId", deleteMessage);

export default router;
