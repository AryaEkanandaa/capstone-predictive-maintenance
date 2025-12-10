import { pool } from "../db/db.js";
import { chatToN8N } from "./chatAiController.js";
import { buildChatPrompt } from "../prompts/promptChat.js";

import {
  getLatestByMachine as getLatestMachineData,
  getLatestAll as getAllLatestMachineData,
  getMachineTrend,
} from "../services/sensor/sensorService.js";

import { getLatestPrediction } from "../services/prediction/predictionService.js";
import { getLatestAnomaly } from "../services/anomaly/anomalyService.js";
import { getTrendResponse } from "../services/chat/chatTrendService.js";
import { getMachineSnapshot } from "../services/chat/chatMachineSnapshot.js";


// ================================
// 🔧 Helper: JSON ➜ Markdown
// ================================
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function jsonToMarkdown(data, level = 0) {
  if (data == null) return "–";
  if (["string", "number", "boolean"].includes(typeof data)) return String(data);

  if (Array.isArray(data)) {
    if (!data.length) return "–";
    return data.map(v => `- ${jsonToMarkdown(v, level + 1)}`).join("\n");
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => {
        const label = capitalize(k.replace(/_/g, " "));
        const title = level === 0 ? `### ${label}` : `**${label}**`;
        const body = jsonToMarkdown(v, level + 1);
        return `${title}\n\n${body}`;
      })
      .join("\n\n");
  }

  return String(data);
}

function extractAndConvertJsonBlock(text) {
  if (!text) return text;

  const trimmed = text.trim();
  const fence = trimmed.match(/```json([\s\S]*?)```/i);

  if (fence) {
    try {
      return jsonToMarkdown(JSON.parse(fence[1]));
    } catch {
      return text;
    }
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return jsonToMarkdown(JSON.parse(trimmed));
    } catch {
      return text;
    }
  }

  return text;
}

function ensureHeading(reply) {
  if (!reply) return "";
  const first = reply.trim().split("\n")[0];
  if (/^#+\s/.test(first)) return reply;
  return "## Jawaban Teknisi\n\n" + reply;
}


// =============================================================
// 1) Get list of sessions
// =============================================================
export const getSessions = async (req, res) => {
  try {
    const { userId } = req.query;
    const r = await pool.query(
      `SELECT * FROM chat_sessions WHERE user_id=$1 ORDER BY updated_at DESC`,
      [userId]
    );
    res.json(r.rows);
  } catch {
    res.status(500).json({ message: "Gagal mengambil session" });
  }
};


// =============================================================
// 🔥 Long-Term Memory
// =============================================================
async function getLongTermMemory(userId) {
  const q = await pool.query(
    `SELECT summary FROM chat_memory WHERE user_id=$1 LIMIT 1`,
    [userId]
  );
  return q.rows[0]?.summary || null;
}

async function saveLongTermMemory(userId, text) {
  const exist = await pool.query(
    `SELECT id FROM chat_memory WHERE user_id=$1`,
    [userId]
  );

  if (exist.rowCount === 0) {
    await pool.query(
      `INSERT INTO chat_memory (user_id,summary) VALUES ($1,$2)`,
      [userId, text]
    );
  } else {
    await pool.query(
      `UPDATE chat_memory SET summary=$2,last_update=NOW() WHERE user_id=$1`,
      [userId, text]
    );
  }
}

async function summarizeHistory(history, userId) {
  const result = await chatToN8N(
    `Ringkas poin penting ini menjadi memory permanen:\n\n${history}`,
    userId
  );
  await saveLongTermMemory(userId, result);
}


// =============================================================
// 2) Create new session
// =============================================================
export const createSession = async (req, res) => {
  try {
    const { userId, title } = req.body;

    const r = await pool.query(
      `INSERT INTO chat_sessions (user_id,title)
       VALUES ($1,$2) RETURNING *`,
      [userId, title || "Chat Baru"]
    );

    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ message: "Gagal membuat sesi" });
  }
};


// =============================================================
// 3) Get messages
// =============================================================
export const getMessages = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM chat_messages
       WHERE session_id=$1 AND is_deleted=false
       ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json(r.rows);
  } catch {
    res.status(500).json({ message: "Gagal mengambil pesan" });
  }
};


// =============================================================
// 4) SEND MESSAGE (AI + ML + Memory + TREND)
// =============================================================
export const sendMessage = async (req, res) => {
  try {
    const { session_id, message, userId } = req.body;

    // Rename session automatically (judul = pesan pertama)
    const count = await pool.query(
      `SELECT COUNT(*) FROM chat_messages WHERE session_id=$1`,
      [session_id]
    );
    if (Number(count.rows[0].count) === 0) {
      await pool.query(
        `UPDATE chat_sessions SET title=$1 WHERE id=$2`,
        [message.slice(0, 40), session_id]
      );
    }

    // SAVE USER MESSAGE
    await pool.query(
      `INSERT INTO chat_messages (session_id,sender,content)
       VALUES ($1,'user',$2)`,
      [session_id, message]
    );

    // LOAD last 20 messages
    const rawHistory = await pool.query(
      `SELECT sender,content FROM chat_messages
       WHERE session_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [session_id]
    );

    const shortHistory = rawHistory.rows
      .reverse()
      .map(m => `${m.sender === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");

    const mem = await getLongTermMemory(userId);

    // ============================================================
    // 🔍 MACHINE CONTEXT
    // ============================================================
    let machineInfo = "";

    // detect machine number → "mesin 2", "machine 3"
    const match = message.match(/(?:mesin|machine)\s*(\d+)/i);

    // ============================================================
    // FILTER: STATUS GLOBAL (CRITICAL / WARNING / NORMAL / ANOMALI)
// ============================================================
    if (/kritis|critical/i.test(message)) {
      const q = await pool.query(`
        SELECT DISTINCT ON(machine_id)
          machine_id, failure_type, failure_probability
        FROM prediction_logs
        WHERE status='CRITICAL'
        ORDER BY machine_id, created_at DESC;
      `);

      machineInfo =
        q.rowCount > 0
          ? "### Mesin Status CRITICAL\n\n" +
            q.rows
              .map(
                m =>
                  `• Mesin ${m.machine_id} → ${m.failure_type} (${(
                    m.failure_probability * 100
                  ).toFixed(1)}%)`
              )
              .join("\n")
          : "### Tidak ada mesin CRITICAL";
    } else if (/warning|waspada/i.test(message)) {
      const q = await pool.query(`
        SELECT DISTINCT ON(machine_id)
          machine_id, failure_type, failure_probability
        FROM prediction_logs
        WHERE status='WARNING'
        ORDER BY machine_id, created_at DESC;
      `);

      machineInfo =
        q.rowCount > 0
          ? "### Mesin Status WARNING\n\n" +
            q.rows
              .map(
                m =>
                  `• Mesin ${m.machine_id} → ${m.failure_type} (${(
                    m.failure_probability * 100
                  ).toFixed(1)}%)`
              )
              .join("\n")
          : "### Tidak ada mesin WARNING";
    } else if (/normal/i.test(message)) {
      const q = await pool.query(`
        SELECT DISTINCT ON(machine_id)
          machine_id, failure_probability
        FROM prediction_logs
        WHERE status='NORMAL'
        ORDER BY machine_id, created_at DESC;
      `);

      machineInfo =
        q.rowCount > 0
          ? "### Mesin Status NORMAL\n\n" +
            q.rows
              .map(
                m =>
                  `• Mesin ${m.machine_id} (OK — ${(
                    m.failure_probability * 100
                  ).toFixed(1)}%)`
              )
              .join("\n")
          : "### Tidak ada mesin NORMAL";
    } else if (/anomali|anomaly/i.test(message)) {
      const q = await pool.query(`
        SELECT DISTINCT ON(machine_id)
          machine_id, score
        FROM anomaly_logs
        WHERE is_anomaly=true
        ORDER BY machine_id, created_at DESC;
      `);

      machineInfo =
        q.rowCount > 0
          ? "### Mesin Dengan Anomali\n\n" +
            q.rows
              .map(
                m => `• Mesin ${m.machine_id} → anomaly score ${m.score.toFixed(3)}`
              )
              .join("\n")
          : "### Tidak ada mesin anomali";
    }

// ============================================================
// 📈 TREND MODE (USER MINTA RIWAYAT / TREND)
// ============================================================
const isTrend = match && /trend|tren|history|riwayat|grafik|perubahan/i.test(message);

if (isTrend) {
  machineInfo = await getTrendResponse(message, match); // ← FIX UTAMA
}


    // ============================================================
    // SINGLE MACHINE SNAPSHOT (HANYA JIKA BUKAN TREND MODE)
// ============================================================
if (!isTrend && match && !machineInfo) {
  const id = Number(match[1]);
  machineInfo = await getMachineSnapshot(id); // ⬅ pakai file service baru
}

    // ============================================================
    // SEMUA MESIN (SUMMARY)
// ============================================================
    if (!machineInfo && /semua mesin|status semua/i.test(message)) {
      const all = await getAllLatestMachineData();
      machineInfo =
        `### Status Semua Mesin\n\n` +
        all
          .map(
            m =>
              `• Mesin ${m.machine_id} → Temp:${m.air_temperature}°C | RPM:${m.rotational_speed}`
          )
          .join("\n");
    }

    // ============================================================
    // FINAL PROMPT
    // ============================================================
    const FINAL_PROMPT = buildChatPrompt(machineInfo, shortHistory, message);

    // ============================================================
    // PANGGIL AI
    // ============================================================
    let reply;
    try {
      reply = await chatToN8N(FINAL_PROMPT, userId);
    } catch (err) {
      console.error("N8N ERROR:", err);
      reply = "⚠ Sistem AI tidak merespon. Coba lagi sebentar.";
    }

    if (!reply || typeof reply !== "string") {
      reply = "⚠ AI tidak memberikan jawaban valid.";
    }

    reply = extractAndConvertJsonBlock(reply);
    reply = ensureHeading(reply);

    // SAVE BOT REPLY
    await pool.query(
      `INSERT INTO chat_messages (session_id,sender,content)
       VALUES ($1,'bot',$2)`,
      [session_id, reply]
    );

    await pool.query(
      `UPDATE chat_sessions SET updated_at=NOW() WHERE id=$1`,
      [session_id]
    );

    if (rawHistory.rowCount >= 20) {
      await summarizeHistory(shortHistory, userId);
    }

    res.json({ reply });

  } catch (e) {
    console.error("CHAT_ERROR", e);
    res.status(500).json({ message: "Gagal mengirim pesan" });
  }
};
