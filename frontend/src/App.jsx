import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./MainLayout";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PredictionHistory from "./pages/PredictionHistory";
import MaintenanceLogbook from "./pages/MaintenanceLogbook";
import TrendPage from "./pages/TrendPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Semua halaman yang memakai sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />     {/* Chatbot juga melewati MainLayout agar sidebar muncul */}
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/login" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<PredictionHistory />} />
          <Route path="logbook" element={<MaintenanceLogbook />} />
          <Route path="/trend" element={<TrendPage />} />



          {/* 🔥 Chatbot di sini, jadi sidebar tetap ada */}
          <Route path="chatbot" element={<Chatbot />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
