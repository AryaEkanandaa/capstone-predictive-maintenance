export default function ChatBubble({ message, isBot }) {
const alignment = isBot ? "justify-start" : "justify-end";
const bgColor = isBot ? "bg-gray-200 text-gray-800" : "bg-indigo-500 text-white";
const bubbleShape = isBot ? "rounded-br-xl rounded-t-xl" : "rounded-bl-xl rounded-t-xl";

    return (
    <div className={`flex w-full ${alignment} mb-4`}>
        <div className={`max-w-xs md:max-w-md p-3 ${bgColor} ${bubbleShape} shadow-md`}>
        <p>{message}</p>
        </div>
    </div>
    );
}