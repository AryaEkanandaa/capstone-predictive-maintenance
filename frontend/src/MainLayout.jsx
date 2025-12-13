import Sidebar from "./components/SideBar";
import Navbar from "./components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const { pathname } = useLocation();
  
  // ✅ Chatbot has special layout (no navbar, full height)
  const isChatbot = pathname.startsWith("/chatbot");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      {/* 🌐 GLOBAL SIDEBAR - Always visible */}
      <Sidebar />

      {/* ✅ RIGHT SIDE - Dynamic based on route */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* 🧭 Navbar - Hidden di chatbot */}
        {!isChatbot && <Navbar />}

        {/* 🔥 Content Area */}
        {isChatbot ? (
          // ✅ CHATBOT: Full height, no padding
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          // ✅ OTHER PAGES: With padding and max-width
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}