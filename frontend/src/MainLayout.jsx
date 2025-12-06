import Sidebar from "./components/SideBar";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Right content */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        {/* Page content wrapper */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>

      </div>

    </div>
  );
}
