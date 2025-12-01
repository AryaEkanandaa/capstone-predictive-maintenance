import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import TypingIndicator from "../components/TypingIndicator";
import { Send } from "lucide-react";

export default function Chatbot() {
const [messages, setMessages] = useState([
    { id: 1, text: "Halo Yande! Saya Predictive Copilot AI Bot. Ada yang bisa saya bantu terkait kondisi mesin Anda?", isBot: true },
    ]);
const [inputMessage, setInputMessage] = useState("");
const [isBotTyping, setIsBotTyping] = useState(false);
const messagesEndRef = useRef(null);

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isBotTyping]);


const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBotTyping) return; 

    const userMessage = { id: Date.now(), text: inputMessage.trim(), isBot: false };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    setIsBotTyping(true);

    try {
        const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
        });

    const data = await response.json();
    const botResponseText = data.reply; 

    setTimeout(() => {
        const botMessage = { id: Date.now() + 1, text: botResponseText, isBot: true };
        
        setIsBotTyping(false);
        setMessages((prev) => [...prev, botMessage]);

      }, Math.random() * 1500 + 1000); 
    
    } catch (error) {
        console.error("Error sending message:", error);
        setTimeout(() => {
        setIsBotTyping(false);
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Maaf, terjadi kesalahan server. Coba lagi.", isBot: true }]);
        }, 1500);
    }
    };

return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-100"> 
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            {msg.isBot && (
                <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm7 4c0 3.866-3.582 7-8 7s-8-3.134-8-7 3.582-7 8-7 8 3.134 8 7z"></path>
                    </svg>
                </div>
                </div>
            )}

            <ChatBubble message={msg.text} isBot={msg.isBot} />

            {!msg.isBot && (
                <div className="flex-shrink-0 ml-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                </div>
                </div>
            )}
            </div>
        ))}
        {isBotTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
        </div>

    <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
            <input
            type="text"
            placeholder={isBotTyping ? "AI Bot sedang menjawab..." : "Send Message"}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isBotTyping}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            />
            <button
            type="submit"
            disabled={!inputMessage.trim() || isBotTyping}
            className="ml-3 p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition disabled:bg-indigo-300"
            >
            <Send size={20} />
            </button>
        </form>
        </div>
    </div>
    );
}