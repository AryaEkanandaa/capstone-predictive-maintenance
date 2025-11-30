import { Home, MessageSquare, Settings } from "lucide-react"; 

export default function Sidebar({ setCurrentPage, currentPage }) { 

const navItems = [
    { name: "Dashboard", icon: Home, page: "Dashboard" },
    { name: "Chatbot", icon: MessageSquare, page: "Chatbot" },
    ];

return (
    <div className="w-64 h-screen bg-[#111827] text-white flex flex-col p-6 gap-6 sticky top-0">
        <h1 className="text-2xl font-bold">Predictive Copilot</h1>

    <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
            <a 
            key={item.name}
            className={`flex items-center gap-3 p-2 cursor-pointer rounded transition 
                ${currentPage === item.page ? "bg-indigo-600 font-semibold" : "hover:bg-gray-700"}`}
            onClick={() => setCurrentPage(item.page)}
            >
            <item.icon size={20} /> {item.name}
        </a>
        ))}
    </nav>
    </div>
    );
}
