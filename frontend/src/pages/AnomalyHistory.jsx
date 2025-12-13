import { useState, useEffect, useCallback } from "react";
import useSocket from "../hooks/useSocket";
import AnomalyCard from "../components/AnomalyCard";

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
    { value: "ANOMALY", label: "Anomali" },
    { value: "NORMAL", label: "Normal" },
];  

function getAnomalyText(isAnomaly, score) {
    return isAnomaly
        ? `Anomali terdeteksi. Skor: ${Number(score).toFixed(4)}`
        : "Kondisi mesin normal.";
}

export default function AnomalyHistory() {
    const [machineId, setMachineId] = useState(1);
    const [range, setRange] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [flash, setFlash] = useState(false);

    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        setLoading(true);

        const params = new URLSearchParams({
            page,
            limit: LIMIT,
            machineId,
        });

        if (range !== "ALL") params.append("range", range);
        if (status !== "ALL") params.append("status", status);

        fetch(`${API_BASE}/anomaly/history?${params}`, { headers })
            .then(r => r.json())
            .then(j => {
                setLogs(j.data || []);
                setTotalPages(j.totalPages || 1);
            })
            .finally(() => setLoading(false));

    }, [machineId, range, status, page]);

    const onRealtime = useCallback((event) => {
        if (event.machine_id !== machineId) return;

        setLogs(prev => {
            const next = [{
                machine_id: event.machine_id,
                is_anomaly: event.is_anomaly,
                score: event.score,
                created_at: event.timestamp
            }, ...prev];

            return next.slice(0, LIMIT);
        });

        setFlash(true);
        setTimeout(() => setFlash(false), 500);
    }, [machineId]);

    useSocket({ "anomaly:update": onRealtime });

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6">Riwayat Anomali</h2>

            {/* FILTER */}
            <div className="bg-white p-4 rounded-xl shadow mb-8 space-y-4">

                {/* MACHINE */}
                <div className="flex gap-2 flex-wrap">
                    {MACHINE_OPTIONS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setMachineId(m.id); setPage(1); }}
                            className={`px-4 py-2 rounded-full ${machineId === m.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>

                {/* RANGE */}
                <div className="flex gap-2 flex-wrap">
                    {RANGE_OPTIONS.map(r => (
                        <button
                            key={r.value}
                            onClick={() => { setRange(r.value); setPage(1); }}
                            className={`px-4 py-2 rounded-full ${range === r.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* STATUS */}
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => { setStatus(s.value); setPage(1); }}
                            className={`px-4 py-2 rounded-full border ${status === s.value
                                    ? "border-indigo-600 bg-indigo-50"
                                    : "border-gray-300"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-center">Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && logs.length === 0 && (
                    <div className="col-span-full text-center bg-white p-8 rounded shadow">
                        Tidak ada data
                    </div>
                )}

                {logs.map((row, i) => (
                    <div
                        key={i}
                        className={i === 0 && flash ? "ring-4 ring-red-300 rounded-xl" : ""}
                    >
                        <AnomalyCard
                            machine_name={`Mesin ${row.machine_id}`}
                            is_anomaly={row.is_anomaly}
                            score={row.score}
                            created_at={row.created_at}
                        />
                    </div>
                ))}

            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="font-semibold">
                    Page {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
