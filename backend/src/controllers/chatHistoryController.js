// src/controllers/chatHistoryController.js
import * as service from "../services/chatHistoryService.js";

/* ===========================
   LIST ALL SESSIONS
   =========================== */
export async function listSessions(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const rows = await service.listSessions(userId);
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listSessions:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ===========================
   CREATE NEW SESSION
   =========================== */
export async function createSession(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { title } = req.body;

    const row = await service.createSession(userId, title || "New Chat");
    res.status(201).json({ status: "success", data: row });
  } catch (err) {
    console.error("createSession:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ===========================
   GET SINGLE SESSION DETAIL
   =========================== */
export async function getSession(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId } = req.params;

    const row = await service.getSession(sessionId, userId);
    if (!row) return res.status(404).json({ error: "Not found" });

    res.json({ status: "success", data: row });
  } catch (err) {
    console.error("getSession:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ===========================
   LIST MESSAGES IN SESSION
   =========================== */
export async function listMessages(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId } = req.params;

    const rows = await service.listMessages(sessionId, userId);
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listMessages:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ===========================
   DELETE MESSAGE
   =========================== */
export async function deleteMessage(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId, messageId } = req.params;

    const ok = await service.deleteMessage(sessionId, messageId, userId);
    if (!ok) return res.status(404).json({ error: "Message not found" });

    res.json({ status: "success" });
  } catch (err) {
    console.error("deleteMessage:", err);
    res.status(500).json({ error: "Server error" });
  }
}
