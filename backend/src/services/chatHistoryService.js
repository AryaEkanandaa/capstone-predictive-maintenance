import { pool } from "../db/db.js";

async function query(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/* Sessions */
export async function listSessions(userId = null) {
  if (userId) {
    return query(
      "SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId]
    );
  }
  return query("SELECT * FROM chat_sessions ORDER BY updated_at DESC");
}

export async function createSession(userId = null, title = "Chat") {
  const q =
    "INSERT INTO chat_sessions (user_id, title) VALUES ($1,$2) RETURNING *";
  const rows = await query(q, [userId, title]);
  return rows[0];
}

export async function getSession(sessionId, userId = null) {
  const rows = await query("SELECT * FROM chat_sessions WHERE id = $1", [
    sessionId,
  ]);
  return rows.length ? rows[0] : null;
}

/* Messages */
export async function listMessages(sessionId, userId = null) {
  const session = await getSession(sessionId, userId);
  if (!session) throw new Error("Session not found");

  return query(
    `SELECT id, session_id, sender, content, content_json, is_deleted, created_at
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );
}

export async function createMessage(
  sessionId,
  userId = null,
  sender = "user",
  content = "",
  content_json = null
) {
  let session = null;
  if (sessionId) session = await getSession(sessionId, userId);
  if (!session) {
    session = await createSession(userId, "Chat");
  }

  const q =
    "INSERT INTO chat_messages (session_id, sender, content, content_json) VALUES ($1,$2,$3,$4) RETURNING *";
  const rows = await query(q, [
    session.id,
    sender,
    content,
    content_json,
  ]);

  await query("UPDATE chat_sessions SET updated_at = now() WHERE id = $1", [
    session.id,
  ]);

  return rows[0];
}

export async function deleteMessage(sessionId, messageId, userId = null) {
  const rows = await query(
    "UPDATE chat_messages SET is_deleted = true WHERE id = $1 AND session_id = $2 RETURNING id",
    [messageId, sessionId]
  );
  return rows.length > 0;
}
