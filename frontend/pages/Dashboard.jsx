import { useEffect, useState } from "react";
import MachineCard from "../components/MachineCard";
import PredictionCard from "../components/PredictionCard";

/**
 * Dashboard:
 * - fetch latest sensor (all machines)
 * - fetch prediction history
 * - polling tiap interval (realtime feel)
 * - uses Authorization header if token is stored in localStorage
 */

const API_BASE = "http://localhost:5000/api"; // backend base URL
const POLL_INTERVAL_MS = 3000; // ubah kalau mau lebih cepat / lambat

export default function Dashboard() {
  const [machines, setMachines] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // helper: ambil token dari localStorage dan buat headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken"); // pastikan frontend menyimpan token ini saat login
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // fetch latest all machines
  const fetchLatestAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/sensor/latest-all`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      // backend kita mengembalikan { status: "success", data: [...] }
      setMachines(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Error fetching latest-all:", err);
    }
  };

return (
    <div className="p-4 md:p-6"> 
        <h2 className="text-xl font-bold mb-4">Machine Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {machines.map(machine => (
        <MachineCard key={machine.id} {...machine} />
        ))}
        </div>

        <div className="mt-8 md:mt-10 p-4 md:p-6 bg-white rounded-xl shadow border border-gray-200"> 
        <h3 className="text-lg font-semibold mb-4">Prediction</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {predictions.length > 0 ? (
            predictions.map(p => (
                <PredictionCard key={p.id} {...p} />
            ))
          ) : (
            <p className="text-gray-600">No predictions available.</p>
            )}
        </div>
      </div>
    </div>
    );
}
