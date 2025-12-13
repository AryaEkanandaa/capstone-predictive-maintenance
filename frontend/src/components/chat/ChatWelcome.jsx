import QuickActionCard from "./QuickActionCard";
import LogoPredix from "../../assets/logo.png";

export default function ChatWelcome({ userName, quickActions, setInput }) {
    return (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 overflow-y-auto">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-2 mb-6">
                    {/* LOGO */}
                    <img
                        src={LogoPredix}
                        alt="PrediX Logo"
                        className="mx-auto w-36 h-36 object-contain mb-6"
                    />
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        Hai, {userName}
                    </h1>

                    <p className="text-xl text-gray-600">
                        Saya siap membantu Anda mengelola dan menganalisis sistem mesin
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, i) => (
                        <QuickActionCard key={i} {...action} setInput={setInput} />
                    ))}
                </div>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Atau ketik pertanyaan Anda di bawah untuk memulai percakapan
                </p>
            </div>
        </div>
    );
}

