import axios from "axios";

export async function processChatMessage(message, userId) {
  const res = await axios.post("http://localhost:5678/webhook/chatbot", {
    message,
    userId
  });
  return res.data.reply; // pastikan N8N reply dalam bentuk STRING
}
