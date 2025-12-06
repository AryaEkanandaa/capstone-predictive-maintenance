// src/controllers/chatHistoryController.js
import * as service from "../services/chatHistoryService.js";

export async function listSessions(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const rows = await service.listSessions(userId);
    res.json(rows);
  } catch (err) {
    console.error("listSessions:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createSession(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { title } = req.body;
    const row = await service.createSession(userId, title);
    res.status(201).json(row);
  } catch (err) {
    console.error("createSession:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getSession(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId } = req.params;

    const row = await service.getSession(sessionId, userId);
    if (!row) return res.status(404).json({ error: "Not found" });

    res.json(row);
  } catch (err) {
    console.error("getSession:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function listMessages(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId } = req.params;

    const rows = await service.listMessages(sessionId, userId);
    res.json(rows);
  } catch (err) {
    console.error("listMessages:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function createMessage(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId } = req.params;
    const { sender, content, content_json } = req.body;

    const row = await service.createMessage(
      sessionId,
      userId,
      sender,
      content,
      content_json
    );

    // Emit via socket.io (global)
    try {
      const io = globalThis._io;
      if (io && sessionId) {
        io.to(sessionId).emit("new_message", { message: row });
      }
    } catch (e) {
      console.warn("Socket emit failed:", e);
    }

    res.status(201).json(row);
  } catch (err) {
    console.error("createMessage:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteMessage(req, res) {
  try {
    const userId = req.user?.userId ?? null;
    const { sessionId, messageId } = req.params;

    const ok = await service.deleteMessage(sessionId, messageId, userId);
    if (!ok) return res.status(404).json({ error: "Message not found" });

    // Emit deletion to connected clients
    try {
      const io = globalThis._io;
      if (io) io.to(sessionId).emit("delete_message", { messageId });
    } catch (e) {
      console.warn("Socket delete emit failed:", e);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteMessage:", err);
    res.status(500).json({ error: "Server error" });
  }
}
