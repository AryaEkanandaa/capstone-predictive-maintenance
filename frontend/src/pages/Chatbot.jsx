
import { useState, useRef, useEffect } from "react";
import {
  Zap,
  Search,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Wrench,
} from "lucide-react";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWelcome from "../components/chat/ChatWelcome";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import {
  createSession,
  sendChatMessage,
  getChatMessages,
} from "../api/chatService";

import toTitleCase from "../utils/toTitleCase";

export default function Chatbot() {
  const [USER_NAME, setUSER_NAME] = useState("Pengguna");
  const [USER_ID, setUSER_ID] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const d = JSON.parse(atob(token.split(".")[1]));
      setUSER_NAME(toTitleCase(d.full_name));
      setUSER_ID(d.id);
    } catch { }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickActions = [
    {
      icon: Zap,
      title: "Prediksi Manual (ML)",
      description: "Isi data sensor & jalankan prediksi kerusakan otomatis",
      template: `Prediksi Manual ML
Air Temp = 
Process Temp = 
RPM = 
Torque = 
Wear = `,
    },
    {
      icon: Search,
      title: "Cek Mesin Tertentu",
      description: "Periksa kondisi mesin berdasarkan ID",
      prompt: "Cek mesin 5",
    },
    {
      icon: Activity,
      title: "Trend Mesin",
      description: "Lihat perubahan performa mesin",
      prompt: "Trend mesin 3",
    },
    {
      icon: AlertTriangle,
      title: "Mesin Critical",
      description: "Lihat mesin kritis",
      prompt: "Apakah ada mesin kritis?",
    },
    {
      icon: AlertOctagon,
      title: "Cek Anomali",
      description: "Deteksi mesin anomali",
      prompt: "Apakah ada mesin dengan anomali?",
    },
    {
      icon: Wrench,
      title: "Buat Ticket Maintenance",
      description: "Laporkan mesin bermasalah & buat tiket maintenance",
      template: `Buat ticket maintenance
Mesin = 
Catatan Tambahan = `,
    },
  ];

  const sendMessage = async (text) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    setMessages((prev) => [...prev, { id: Date.now(), text, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      let sid = sessionId;

      if (!sid) {
        sid = await createSession(USER_ID);
        setSessionId(sid);
      }

      const res = await sendChatMessage({
        sessionId: sid,
        message: text,
        userId: USER_ID,
      });

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: res.reply, isBot: true },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: " Server error", isBot: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = async () => {
    setSessionId(null);
    setMessages([]);
    setInput("");

    const sid = await createSession(USER_ID);
    setSessionId(sid);
  };


  const handleSelectChat = async (sid) => {
    // 🔄 JIKA SESSION DIHAPUS
    if (!sid) {
      setSessionId(null);
      setMessages([]);
      setInput("");
      return;
    }

    setSessionId(sid);
    setLoading(true);

    try {
      const data = await getChatMessages(sid);

      setMessages(
        data.map((m) => ({
          id: m.id,
          text: m.content,
          isBot: m.sender === "bot",
        }))
      );
    } catch (err) {
      console.error("Gagal load chat history", err);
    } finally {
      setLoading(false);
    }
  };  


  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-full overflow-hidden">

      <ChatSidebar
        username={USER_NAME}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        activeSessionId={sessionId}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-50 to-gray-100">

        {showWelcome && (
          <ChatWelcome
            userName={USER_NAME}
            quickActions={quickActions}
            setInput={setInput}
          />
        )}

        {messages.length > 0 && (
          <ChatMessages
            messages={messages}
            loading={loading}
            bottomRef={bottomRef}
          />
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          handleKeyPress={handleKeyPress}
        />
      </div>

    </div>
  );
}