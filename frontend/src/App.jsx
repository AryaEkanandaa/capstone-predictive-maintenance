import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PredictionHistory from "./pages/PredictionHistory";

// 🔥 Tambahkan halaman baru
import MaintenanceLogbook from "./pages/MaintenanceLogbook";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="history" element={<PredictionHistory />} />
          <Route path="logbook" element={<MaintenanceLogbook />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" />;
  return children;
}
