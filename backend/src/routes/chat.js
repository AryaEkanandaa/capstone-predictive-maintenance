import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const n8nRes = await fetch("http://localhost:5678/webhook/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await n8nRes.json();

    return res.json({
      reply: data.reply ?? "Tidak ada balasan dari AI",
    });

  } catch (err) {
    console.error("Error chatbot:", err);
    return res.status(500).json({
      reply: "Terjadi kesalahan server."
    });
  }
});

export default router;
