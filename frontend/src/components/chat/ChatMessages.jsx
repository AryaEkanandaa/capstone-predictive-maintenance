import MessageUser from "./MessageUser";
import MessageAI from "./MessageAI";
import TypingDots from "./TypingDots";

export default function ChatMessages({ messages, loading, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((m) =>
          m.isBot ? (
            <MessageAI key={m.id} text={m.text} />
          ) : (
            <MessageUser key={m.id} text={m.text} />
          )
        )}

        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>
    </div>

  );
}
