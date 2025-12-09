import express from "express";
import { 
  getSessions, 
  createSession, 
  getMessages, 
  sendMessage 
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/sessions", getSessions);
router.post("/session", createSession);
router.get("/messages/:id", getMessages);
router.post("/message", sendMessage);

export default router;
