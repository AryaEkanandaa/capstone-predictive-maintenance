import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";

export default function App() {
const [currentPage, setCurrentPage] = useState("Dashboard");

return (
    <div className="flex">
        <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />

        <div className="flex-1">
        <Navbar currentPage={currentPage} />

        {currentPage === "Dashboard" && <Dashboard />}
        {currentPage === "Chatbot" && <Chatbot />}
        </div>
    </div>
    );
}
