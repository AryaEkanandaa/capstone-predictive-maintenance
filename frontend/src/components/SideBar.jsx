import { Home, MessageSquare, History, ClipboardList, LogOut, LineChart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const nav = useNavigate();
  const loc = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    nav('/login');
  };

  const items = [
    { name: "Dashboard", icon: Home, to: "/dashboard" },
    { name: "Chatbot", icon: MessageSquare, to: "/chatbot" },
    { name: "Trend Monitoring", icon: LineChart, to: "/trend" },
    { name: "Prediction History", icon: History, to: "/history" },
    { name: "Logbook", icon: ClipboardList, to: "/logbook" },
  ];

  return (
    <div className="w-64 bg-[#111827] text-white p-6 flex flex-col gap-6 h-screen sticky top-0">
      <h1 className="text-2xl font-bold">Predictive Copilot</h1>

      <nav className="flex flex-col gap-2">
        {items.map((i) => {
          const active = loc.pathname === i.to;
          return (
            <button
              onClick={() => nav(i.to)}
              key={i.name}
              className={`flex items-center gap-3 p-3 rounded-lg transition
                ${active ? "bg-indigo-600 font-semibold" : "hover:bg-gray-700"}`}
            >
              <i.icon size={20} />
              {i.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
