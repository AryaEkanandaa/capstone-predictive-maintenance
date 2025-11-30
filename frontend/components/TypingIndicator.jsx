export default function TypingIndicator() {
return (
    <div className="flex w-full justify-start mb-4">
        <div className="max-w-xs md:max-w-md p-3 bg-gray-200 text-gray-800 rounded-br-xl rounded-t-xl shadow-md">
        <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-0"></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
        </div>
    </div>
    </div>
    );
}