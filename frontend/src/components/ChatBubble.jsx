export default function ChatBubble({ message, isBot }) {
  const bubbleStyles = isBot
    ? "bg-white text-gray-900 rounded-xl"
    : "bg-indigo-600 text-white rounded-xl";

  return (
    <div className={`flex w-full ${isBot ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`${bubbleStyles} px-4 py-3 shadow 
                    max-w-[75%] leading-relaxed text-sm`}
      >
        {message}
      </div>
    </div>
  );
}
