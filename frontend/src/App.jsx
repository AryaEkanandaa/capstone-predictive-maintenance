import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./MainLayout";

import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PredictionHistory from "./pages/PredictionHistory";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import AnomalyHistory from "./pages/AnomalyHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
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
          <Route path="history" element={<PredictionHistory />} />
          <Route path="/anomaly-history" element={<AnomalyHistory />} />
          <Route path="chatbot" element={<Chatbot />} />

          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
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