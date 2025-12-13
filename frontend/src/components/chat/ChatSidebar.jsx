import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

const API = "http://localhost:5000/api/chat";

export default function ChatSidebar({
  username,
  onNewChat,
  onSelectChat,
  activeSessionId,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const token = localStorage.getItem("accessToken");
  const userId = token ? JSON.parse(atob(token.split(".")[1]))?.id : null;

  // =====================================================
  // LOAD SESSIONS
  // =====================================================
  async function loadSessions() {
    if (!userId) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/sessions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setSessions(d);
    } catch (e) {
      console.error("Load session gagal", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // =====================================================
  // DELETE SESSION
  // =====================================================
  async function handleDelete(sessionId) {
    try {
      await fetch(`${API}/session/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (sessionId === activeSessionId) {
        onSelectChat(null);
      }

      setConfirmId(null);
      loadSessions();
    } catch (e) {
      console.error("Gagal hapus session", e);
    }
  }

  return (
    <>
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col overflow-x-hidden">

        {/* HEADER */}
        <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <h1 className="text-lg font-bold text-gray-800">PrediX AI</h1>
          <p className="text-xs text-gray-600">
            Selamat datang, <b>{username}</b>
          </p>
        </div>

        {/* NEW CHAT */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <Plus size={16} className="inline mr-1" />
            Chat Baru
          </button>
        </div>

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loading && (
            <p className="text-xs text-gray-400 text-center py-4">
              Memuat riwayat...
            </p>
          )}

          {!loading && sessions.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              Belum ada riwayat chat
            </p>
          )}

          <div className="space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md transition
                  ${s.id === activeSessionId
                    ? "bg-indigo-50"
                    : "hover:bg-gray-50"}
                `}
              >
                {/* SELECT CHAT */}
                <button
                  onClick={() => onSelectChat(s.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <MessageSquare
                    size={14}
                    className="text-indigo-500 flex-shrink-0"
                  />
                  <span className="truncate text-sm text-gray-700 max-w-[160px] block">
                    {s.title || "Chat Baru"}
                  </span>
                </button>

                {/* DELETE */}
                <button
                  onClick={() => setConfirmId(s.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CONFIRM MODAL */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">
              Hapus chat ini?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Riwayat percakapan akan dihapus permanen.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-1.5 rounded bg-gray-200 text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                className="px-4 py-1.5 rounded bg-red-600 text-white text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
