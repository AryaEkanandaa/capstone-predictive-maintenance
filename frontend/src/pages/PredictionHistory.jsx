import { useState, useEffect, useCallback } from "react";
import usePredictionHistoryFeed from "../hooks/usePredictionHistoryFeed";
import PredictionCard from "../components/PredictionCard";

const API_BASE = import.meta.env.VITE_API_BASE;

const MACHINE_OPTIONS = [
    { id: 1, name: "Machine 1" },
    { id: 2, name: "Machine 2" },
    { id: 3, name: "Machine 3" },
    { id: 4, name: "Machine 4" },
    { id: 5, name: "Machine 5" },
];

const RANGE_OPTIONS = [
    { value: "ALL", label: "All Time" },
    { value: "1h", label: "Last 1 Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
];

const STATUS_OPTIONS = [
    { value: "ALL", label: "All Status" },
    { value: "NORMAL", label: "Normal" },
    { value: "WARNING", label: "Warning" },
    { value: "CRITICAL", label: "Critical" },
];

const getPredictionText = (status, failureType, probability) => {
    const prob = Number(probability) * 100;
    
    if (status === "CRITICAL") {
        return `Potensi kegagalan terdeteksi: ${failureType}. Probabilitas: ${prob.toFixed(2)}%`;
    }
    if (status === "WARNING") {
        return `Keausan alat meningkat - pemeliharaan disarankan segera. Tipe: ${failureType}`;
    }
    return `Mesin stabil. Tidak ada isu terdeteksi.`;
};


export default function PredictionHistory() {
  const [machineId, setMachineId] = useState(1);
  const [range, setRange] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [logs, setLogs] = useState([]);
  const [flash, setFlash] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    setLoading(true);

    const url = `${API_BASE}/predict/history-by-machine/${machineId}?range=${range}&status=${statusFilter}`;

    fetch(url, { headers })
      .then(r => r.json())
      .then(j => setLogs(j.data || []))
      .catch(err => console.error("Fetch history error:", err))
      .finally(() => setLoading(false));
  }, [machineId, range, statusFilter]);

  const onRealtime = useCallback((event) => {
    if (event.machine_id !== machineId) return;

    if (statusFilter !== "ALL" && event.status !== statusFilter) return;

    const prob = Number(event.failure_probability ?? event.probability);

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
      machine_id: event.machine_id 
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

  const getMachineName = (id) => {
      return MACHINE_OPTIONS.find(m => m.id === id)?.name || `Machine ${id}`;
  }


  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
        Prediction History ⚙️
      </h2>

      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter Hasil</h3>
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mesin</label>
            <div className="flex flex-wrap gap-2">
                {MACHINE_OPTIONS.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMachineId(m.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out ${
                            machineId === m.id
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
                        }`}
                    >
                        {m.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Waktu</label>
            <div className="flex flex-wrap gap-2">
                {RANGE_OPTIONS.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setRange(r.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ease-in-out ${
                            range === r.value
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Prediksi</label>
            <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                    <button
                        key={s.value}
                        onClick={() => setStatusFilter(s.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-full border transition duration-150 ease-in-out ${
                            statusFilter === s.value
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {loading && <p className="text-lg text-indigo-600 font-medium text-center py-10">Memuat Riwayat...</p>}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'opacity-50' : ''}`}>
        {!loading && logs.length === 0 && (
          <div className="col-span-full bg-white p-8 text-center rounded-lg shadow">
            <p className="text-xl text-gray-500">Tidak ada riwayat prediksi yang ditemukan untuk filter ini.</p>
          </div>
        )}

        {logs.map((row, i) => {
          const machine_name = getMachineName(row.machine_id ?? machineId); 
          const prediction_text = getPredictionText(
              row.status, 
              row.failure_type, 
              row.probability ?? row.failure_probability
          );
          
          return (
            <div
              key={i}
              className={`transition-transform duration-500 ease-in-out ${
                i === 0 && flash ? "scale-[1.02] ring-4 ring-indigo-300 rounded-lg shadow-xl" : ""
              }`}
            >
              <PredictionCard
                machine_name={machine_name}
                prediction_text={prediction_text}
                prediction_date={row.created_at}
                status={row.status}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}