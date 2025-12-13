import { useState, useEffect, useCallback } from "react";
import usePredictionHistoryFeed from "../hooks/usePredictionHistoryFeed";
import PredictionCard from "../components/PredictionCard";

const API_BASE = import.meta.env.VITE_API_BASE;
const LIMIT = 12;

const MACHINE_OPTIONS = [
  { id: 1, name: "Mesin 1" },
  { id: 2, name: "Mesin 2" },
  { id: 3, name: "Mesin 3" },
  { id: 4, name: "Mesin 4" },
  { id: 5, name: "Mesin 5" },
];

const RANGE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "1h", label: "1 Jam Terakhir" },
  { value: "24h", label: "24 Jam Terakhir" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "NORMAL", label: "Normal" },
  { value: "WARNING", label: "Peringatan" },
  { value: "CRITICAL", label: "Kritis" },
];

const getPredictionText = (status, failureType, probability) => {
  const prob = Number(probability) * 100;

  if (status === "CRITICAL") {
    return `Potensi kegagalan terdeteksi: ${failureType}. Probabilitas: ${prob.toFixed(
      2
    )}%`;
  }
  if (status === "WARNING") {
    return `Keausan alat meningkat - pemeliharaan disarankan. (${failureType})`;
  }
  return "Mesin stabil. Tidak ada isu terdeteksi.";
};

export default function PredictionHistory() {
  const [machineId, setMachineId] = useState(1);
  const [range, setRange] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [flash, setFlash] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page,
      limit: LIMIT,
      range,
      status: statusFilter,
    });

    fetch(
      `${API_BASE}/predict/history-by-machine/${machineId}?${params}`,
      { headers }
    )
      .then((r) => r.json())
      .then((j) => {
        const normalized = (j.data || []).map(row => ({
          ...row,
          probability: row.failure_probability ?? 0
        }));

        setLogs(normalized);
        setTotalPages(j.totalPages || 1);
      })

      .catch(console.error)
      .finally(() => setLoading(false));
  }, [machineId, range, statusFilter, page]);

  const onRealtime = useCallback(
    (event) => {
      if (page !== 1) return;
      if (event.machine_id !== machineId) return;
      if (statusFilter !== "ALL" && event.status !== statusFilter) return;

      const prob = Number(event.failure_probability ?? event.probability);

      setLogs((prev) => {
        const next = [
          {
            failure_type: event.failure_type,
            probability: prob,
            status: event.status,
            created_at: event.timestamp,
            machine_id: event.machine_id,
          },
          ...prev,
        ];

        return next.slice(0, LIMIT);
      });

      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    },
    [page, machineId, statusFilter]
  );

  usePredictionHistoryFeed(onRealtime);

  const getMachineName = (id) =>
    MACHINE_OPTIONS.find((m) => m.id === id)?.name || `Machine ${id}`;

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6">Riwayat Prediksi</h2>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow mb-8 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {MACHINE_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMachineId(m.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full ${machineId === m.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
                }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                setRange(r.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full ${range === r.value ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full border ${statusFilter === s.value
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-300"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading && (
        <p className="text-center text-indigo-600 py-8">Memuat data...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && logs.length === 0 && (
          <div className="col-span-full bg-white p-8 text-center rounded shadow">
            Tidak ada data
          </div>
        )}

        {logs.map((row, i) => (
          <div
            key={i}
            className={
              i === 0 && flash
                ? "ring-4 ring-indigo-300 rounded-lg"
                : ""
            }
          >
            <PredictionCard
              machine_name={getMachineName(row.machine_id)}
              prediction_text={getPredictionText(
                row.status,
                row.failure_type,
                row.probability
              )}
              prediction_date={row.created_at}
              status={row.status}
            />
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="font-semibold">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
