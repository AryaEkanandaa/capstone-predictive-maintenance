import { Home, Activity, Database, Settings } from "lucide-react";

export default function Sidebar() {
return (
    <div className="w-64 h-screen bg-[#111827] text-white flex flex-col p-6 gap-6">
        <h1 className="text-2xl font-bold">Predictive Copilot</h1>

    <nav className="flex flex-col gap-3">
        <a className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
            <Home size={20} /> Dashboard
        </a>
        <a className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
            <Activity size={20} /> Chatbot
        </a>
    </nav>
    </div>
    );
}
