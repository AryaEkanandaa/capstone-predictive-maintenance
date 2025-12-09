// ==========================================
// 📌 CHAT CONTROLLER — FINAL + MEMORY Markdown Clean
// ==========================================

import { pool } from "../db/db.js";
import { chatToN8N } from "./chatAiController.js";


// =============================================================
// 1) Get list session user
// GET /api/chat/sessions?userId=xx
// =============================================================
export const getSessions = async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await pool.query(
      `SELECT * FROM chat_sessions
       WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
  const exist = await pool.query(`SELECT id FROM chat_memory WHERE user_id=$1`, [userId]);

  if (exist.rowCount === 0) {
    await pool.query(`INSERT INTO chat_memory (user_id,summary) VALUES ($1,$2)`, [userId,text]);
  } else {
    await pool.query(`
      UPDATE chat_memory SET summary=$2,last_update=NOW()
      WHERE user_id=$1
    `, [userId,text]);
  }
}

async function summarizeHistory(history,userId) {
  const summaryPrompt = `
Ringkas poin penting percakapan ini menjadi knowledge permanen:

${history}

Buat ringkasan padat namun jelas.
Jangan ulangi percakapan mentah.
`;

  const result = await chatToN8N(summaryPrompt,userId);
  await saveLongTermMemory(userId,result);
}



// =============================================================
// 2) Create new session
// POST /api/chat/session
// =============================================================
export const createSession = async (req, res) => {
  try {
    const { userId,title } = req.body;
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id,title)
       VALUES ($1,$2) RETURNING *`,
      [userId,title || "Chat Baru"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:"Gagal membuat sesi" });
  }
};



// =============================================================
// 3) Load messages
// GET /api/chat/messages/:id
// =============================================================
export const getMessages = async (req,res) => {
  try {
    const { id } = req.params;

    const r = await pool.query(
      `SELECT * FROM chat_messages
       WHERE session_id=$1 AND is_deleted=false
       ORDER BY created_at ASC`,
      [id]
    );

    res.json(r.rows);
  } catch {
    res.status(500).json({ message:"Gagal mengambil pesan" });
  }
};



// =============================================================
// 4) Send message — AI response + Memory
// POST /api/chat/message
// =============================================================
export const sendMessage = async (req,res) => {
  try {
    const { session_id,message,userId } = req.body;


    // ==== Rename first message as chat title ====
    const count = await pool.query(`SELECT COUNT(*) FROM chat_messages WHERE session_id=$1`,[session_id]);
    if(Number(count.rows[0].count)===0){
      const title = message.length>40 ? message.slice(0,40)+"..." : message;
      await pool.query(`UPDATE chat_sessions SET title=$1 WHERE id=$2`,[title,session_id]);
    }


    // ==== Save user message ====
    await pool.query(
      `INSERT INTO chat_messages (session_id,sender,content)
       VALUES ($1,'user',$2)`,
      [session_id,message]
    );


    // ==== Load last 20 messages ====
    const rawHistory = await pool.query(`
      SELECT sender,content FROM chat_messages
      WHERE session_id=$1
      ORDER BY created_at DESC LIMIT 20
    `,[session_id]);

    const shortHistory = rawHistory.rows.reverse()
      .map(m=>`${m.sender==="user"?"User":"AI"}: ${m.content}`)
      .join("\n");


    // ==== Load Long-Term Memory ====
    const mem = await getLongTermMemory(userId);


    // ==== FINAL AI PROMPT — Markdown only ====
    const FINAL_PROMPT = `
Gunakan konteks berikut untuk menjawab user dengan akurat:

=== 🧠 Long-term Memory ===
${mem || "- Belum ada memori"}

=== 💬 Recent Chat (Last 20) ===
${shortHistory}

=== ❓ User bertanya ===
${message}

⚠ Aturan Format Jawaban:
- Jawab FULL menggunakan **MARKDOWN**
- Gunakan heading, bullet list, tabel jika relevan
- Jangan menjawab dalam JSON
- Berikan penjelasan yang natural, terstruktur, tidak terpotong
`;

    const reply = await chatToN8N(FINAL_PROMPT,userId);


    // ==== Save AI reply ====
    await pool.query(
      `INSERT INTO chat_messages (session_id,sender,content)
       VALUES ($1,'bot',$2)`,
      [session_id,reply]
    );

    await pool.query(`UPDATE chat_sessions SET updated_at=NOW() WHERE id=$1`,[session_id]);


    // ==== If history too long → convert to memory ====
    if(rawHistory.rowCount>=20) await summarizeHistory(shortHistory,userId);


    res.json({ reply });

  } catch (e){
    console.error(e);
    res.status(500).json({ message:"Gagal mengirim pesan" });
  }
};
