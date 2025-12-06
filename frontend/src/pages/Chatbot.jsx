import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text:
        "Halo Yande! Saya Predictive Copilot AI Bot. Ada yang bisa saya bantu terkait kondisi mesin Anda?",
      isBot: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Send chat to backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBotTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      // 🔵 Clean reply
      let botReply = data.reply && typeof data.reply === "string"
        ? data.reply
        : "Maaf, bot tidak memberikan respon.";

      // ✨ Cleaning
      botReply = botReply
        .replace(/[\[\]{}"]/g, "")      // hapus karakter []
        .replace(/\\/g, "")             // hapus backslash
        .replace(/\n|\r/g, " ")         // newline → spasi
        .replace(/,/g, "")              // hapus koma
        .replace(/^\s*(response|jawaban|output)\s*:/i, "") // 🔥 hapus prefix "response:"
        .trim();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: botReply,
            isBot: true,
          },
        ]);
        setIsBotTyping(false);
      }, Math.random() * 700 + 300);
    } catch (err) {
      console.error("Chat error:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Maaf, terjadi kesalahan server. Coba lagi nanti.",
          isBot: true,
        },
      ]);

      setIsBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.isBot ? "justify-start" : "justify-end"
              }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl shadow text-sm leading-relaxed ${msg.isBot
                ? "bg-white text-gray-900"
                : "bg-indigo-600 text-white"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isBotTyping && (
          <div className="text-gray-500 italic">Bot sedang mengetik...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isBotTyping}
            className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
            placeholder="Ketik pesan..."
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isBotTyping}
            className="p-3 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 transition disabled:bg-indigo-300"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
