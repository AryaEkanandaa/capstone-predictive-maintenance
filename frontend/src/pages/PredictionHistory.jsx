import { useState, useEffect, useCallback } from "react";
import usePredictionHistoryFeed from "../hooks/usePredictionHistoryFeed";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PredictionHistory() {
  const [machineId, setMachineId] = useState(1);
  const [range, setRange] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 🔥 FILTER STATUS BARU
  const [logs, setLogs] = useState([]);
  const [flash, setFlash] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // ======================================================
  // 🔥 Fetch History berdasarkan Machine + Range + Status
  // ======================================================
  useEffect(() => {
    setLoading(true);

    const url = `${API_BASE}/predict/history-by-machine/${machineId}?range=${range}&status=${statusFilter}`;

    fetch(url, { headers })
      .then(r => r.json())
      .then(j => setLogs(j.data || []))
      .catch(err => console.error("Fetch history error:", err))
      .finally(() => setLoading(false));
  }, [machineId, range, statusFilter]);


  // ======================================================
  // 🔥 Realtime event datang dari socket
  // ======================================================
  const onRealtime = useCallback((event) => {
    if (event.machine_id !== machineId) return;

    // Filter status realtime
    if (statusFilter !== "ALL" && event.status !== statusFilter) return;

    const prob = Number(event.failure_probability ?? event.probability);

    // Cegah duplicate
    const duplicate = logs.some(
      l =>
        l.created_at === event.timestamp &&
        (l.failure_probability ?? l.probability) === prob &&
        l.failure_type === event.failure_type
    );
    if (duplicate) return;

    const newRow = {
      failure_type: event.failure_type,
      probability: prob,
      status: event.status,
      created_at: event.timestamp,
    };

    // Save ke DB (asynchronous)
    fetch(`${API_BASE}/predict/log/save`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        machine_id: event.machine_id,
        failure_type: event.failure_type,
        failure_probability: prob,
        status: event.status,
      }),
    }).catch(() => {});

    setLogs(prev => [newRow, ...prev]);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

  }, [logs, machineId, statusFilter]);

  usePredictionHistoryFeed(onRealtime);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-5">Live Prediction History</h2>

      {/* ================================ */}
      {/* 🔥 Machine + Time + Status Filter */}
      {/* ================================ */}
      <div className="flex gap-3 mb-6">
        <select value={machineId} onChange={(e) => setMachineId(Number(e.target.value))} className="border p-2 rounded">
          {[1,2,3,4,5].map(id => <option key={id} value={id}>Machine {id}</option>)}
        </select>

        <select value={range} onChange={(e) => setRange(e.target.value)} className="border p-2 rounded">
          <option value="ALL">All Time</option>
          <option value="1h">Last 1 Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>

        {/* 🔥 FILTER STATUS */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="ALL">All Status</option>
          <option value="NORMAL">Normal</option>
          <option value="WARNING">Warning</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* ================================ */}
      {/* Content */}
      {/* ================================ */}
      {loading && <p className="text-gray-500 mb-2">Loading...</p>}

      <div className="space-y-3">
        {!loading && logs.length === 0 && <p className="text-gray-500">No logs found.</p>}

        {logs.map((row, i) => {
          const prob = Number(row.probability ?? row.failure_probability) * 100;

          return (
            <div
              key={i}
              className={`p-4 rounded border shadow transition duration-500
                ${row.status === "CRITICAL" ? "bg-red-100 border-red-400" :
                  row.status === "WARNING" ? "bg-yellow-100 border-yellow-400" :
                  "bg-green-100 border-green-400"}
                ${i === 0 && flash ? "ring-4 ring-indigo-400 scale-[1.02]" : ""}
              `}
            >
              <p className="font-semibold">{row.failure_type}</p>
              <p>Probability: {prob.toFixed(2)}%</p>
              <p>Status: <b>{row.status}</b></p>

              <p className="text-xs text-gray-600 mt-1">
                {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
