import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // ambil current page dari URL
  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("chatbot")) return "Chatbot";

    return "Predictive Copilot"; // default
  };

  const currentPage = getPageTitle();

  return (
    <div className="w-full bg-white border-b h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">{currentPage}</h2>

      <div className="flex items-center gap-4">
        {currentPage === "Dashboard" && (
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 border rounded-lg"
          />
        )}
      </div>
    </div>
  );
}
