// src/api/ticketApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

export async function fetchTickets(filters = {}) {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE}/tickets${qs ? `?${qs}` : ""}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch tickets failed: ${res.status}`);

  const data = await res.json();
  console.log("🔥 Fetched tickets from backend:", data);
  return data;
}


export async function fetchTicketById(id) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Fetch ticket failed");
  return res.json();
}

export async function fetchTicketActivity(ticketId) {
  // backend route expected: GET /api/ticket-activity/:id
  const res = await fetch(`${API_BASE}/ticket-activity/${ticketId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Fetch ticket activity failed");
  return res.json();
}

export async function createTicket(payload) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Create ticket failed");
  }
  return res.json();
}

export async function updateTicketStatus(ticketId, status, comment) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, comment }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Update ticket failed");
  }
  return res.json();
}

export async function triggerAutoTickets() {
  const res = await fetch(`${API_BASE}/tickets/auto/trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Trigger auto ticket failed");
  return res.json();
}
