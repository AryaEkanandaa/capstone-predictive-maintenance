import { Send } from "lucide-react";
import { useRef, useEffect } from "react";

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  isFocused,
  setIsFocused,
  handleKeyPress,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    const el = textareaRef.current;
    el.style.height = "auto"; 
    el.style.height = `${el.scrollHeight}px`; 
  }, [input]);

  return (
    <div className="p-4 bg-white border-t flex-shrink-0">
      <div
        className={`
          flex items-end gap-3 
          bg-gray-50 rounded-2xl px-4 py-3 
          border-2 transition-all
          ${isFocused ? "border-indigo-500 bg-white" : "border-transparent"}
        `}
      >
        <textarea
          ref={textareaRef}
          id="chat-message-input"
          name="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ketik pesan Anda... (Shift + Enter untuk baris baru)"
          className="
            flex-1 bg-transparent resize-none 
            text-sm leading-relaxed
            focus:outline-none
            overflow-hidden
            min-h-[24px]
          "
          rows={1}
          disabled={loading}
          autoComplete="off"
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input || !input.trim()}
          className={`
            p-2.5 rounded-xl transition-all flex-shrink-0
            ${
              loading || !input || !input.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            }
          `}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        PrediX AI dapat membuat kesalahan. Periksa informasi penting.
      </p>
    </div>
  );
}
