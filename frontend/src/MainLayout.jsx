import Sidebar from "./components/SideBar";
import Navbar from "./components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isChatbot = pathname === "/chatbot"; // deteksi

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar />  {/* Tetap ada di chatbot */}

      <div className="flex-1 flex flex-col">

        {!isChatbot && <Navbar />}   {/* Navbar hilang khusus chatbot */}
        
        <div className={`flex-1 ${isChatbot ? "p-0" : "p-6"}`}>
          <div className={`${isChatbot ? "w-full" : "max-w-7xl mx-auto w-full"}`}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
