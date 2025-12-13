// src/api/chatService.js
const API_URL = "http://localhost:5000/api";

export async function createSession(userId) {
  const token = localStorage.getItem("accessToken");

  const r = await fetch(`${API_URL}/chat/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!r.ok) {
    throw new Error("Gagal membuat session");
  }

  const d = await r.json();
  return d.id;
}

export async function sendChatMessage({ sessionId, message, userId }) {
  const token = localStorage.getItem("accessToken");

  const r = await fetch(`${API_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      userId,
    }),
  });

  if (!r.ok) {
    throw new Error("Gagal mengirim pesan");
  }

  return r.json();
}

export async function getChatMessages(sessionId) {
  const token = localStorage.getItem("accessToken");

  const r = await fetch(`${API_URL}/chat/messages/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) {
    throw new Error("Gagal mengambil riwayat chat");
  }

  return r.json();
}

export async function deleteChatSession(sessionId) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_URL}/chat/session/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus session");
  }

  return res.json();
}