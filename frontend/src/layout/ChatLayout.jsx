import { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";

export default function ChatLayout() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadSessions() {
    const res = await fetch("http://localhost:5000/api/chat/history/sessions", {
      headers,
    });
    const json = await res.json();
    setSessions(json.data || []);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleNewChat() {
    const res = await fetch("http://localhost:5000/api/chat/history/sessions", {
      method: "POST",
      headers,
      body: JSON.stringify({ title: "New Chat" }),
    });

    const json = await res.json();
    const id = json.data.id;
    navigate(`/chat/${id}`);
    loadSessions();
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">

      {/* Sidebar */}
      <aside className="w-72 bg-[#1F2937] text-white p-4 flex flex-col border-r border-gray-800">

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold"
        >
          <Plus size={18} /> Chat Baru
        </button>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/chat/${s.id}`)}
              className="w-full flex gap-2 items-center text-left p-3 rounded hover:bg-gray-700 transition"
            >
              <MessageSquare size={18} />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

    </div>
  );
}
