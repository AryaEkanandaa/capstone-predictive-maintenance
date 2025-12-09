import { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";

export default function ChatSidebar({ username, onNewChat, onSelectChat }) {

  const [sessions, setSessions] = useState([]);

  const token = localStorage.getItem("accessToken");
  const userId = JSON.parse(atob(token?.split(".")[1] || ""))?.id; // decode ID

  /* 🔥 Load daftar sesi chat */
  const loadSessions = async () => {
    const res = await fetch(`http://localhost:5000/api/chat/sessions?userId=${userId}`,{
      headers:{ Authorization:`Bearer ${token}` }
    });
    const data = await res.json();
    setSessions(data);
  };

  useEffect(()=>{ loadSessions(); },[]);


  return (
    <aside className="hidden md:flex w-64 bg-white border-r flex-col p-5">

      <h1 className="text-lg font-bold mb-2">PrediX AI</h1>
      <p className="text-xs text-gray-500 mb-4">Selamat datang, {username}</p>

      {/* 🔥 BUTTON NEW CHAT */}
      <button 
        onClick={()=>{ onNewChat(); loadSessions(); }}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        <Plus size={16}/> Chat Baru
      </button>

      {/* 🔥 Riwayat Chat */}
      <div className="mt-6 space-y-1 overflow-y-auto flex-1">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-400 mt-5 text-center">Belum ada riwayat chat</p>
        )}

        {sessions.map(s => (
          <button 
            key={s.id}
            onClick={()=> onSelectChat(s.id)}       // ⬅ when clicked → open chat!
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
          >
            <MessageSquare size={16} className="text-indigo-500"/>
            <span className="truncate text-sm">{s.title}</span>
          </button>
        ))}
      </div>

    </aside>
  );
}
