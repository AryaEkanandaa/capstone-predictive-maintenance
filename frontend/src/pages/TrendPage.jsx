import { useState, useEffect } from "react";
import useSocket from "../hooks/useSocket";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const MACHINE_COUNT = Number(import.meta.env.VITE_MACHINE_COUNT) || 5;

export default function TrendPage() {

  const [machineId, setMachineId] = useState(1);
  const [range, setRange] = useState("1h");
  const [rows, setRows] = useState([]);

  // ============================
  // FETCH HISTORY DARI /sensor/history
  // ============================
  async function loadTrend() {
    const url = `${API_BASE}/sensor/history?machine_id=${machineId}&range=${range}&limit=500`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return;

    // history hasilnya DESCENDING → kita balikin ASCENDING
    const ordered = [...json.data].reverse();

    setRows(ordered);
  }

  useEffect(() => {
    loadTrend();
  }, [machineId, range]);

  // ============================
  // SOCKET → TAMBAHKAN DATA BARU
  // ============================
  useSocket({
    "sensor:update": (u) => {
      if (u.machine_id !== machineId) return;

      setRows(prev => [
        ...prev,
        {
          created_at: u.created_at,
          rotational_speed: u.rotational_speed,
          air_temperature: u.air_temperature,
          process_temperature: u.process_temperature,
          torque: u.torque,
          tool_wear: u.tool_wear
        }
      ]);
    }
  });

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">📋 Mesin {machineId} — Tabel Tren Sensor</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={machineId}
          onChange={(e) => setMachineId(Number(e.target.value))}
        >
          {Array.from({ length: MACHINE_COUNT }).map((_, i) => (
            <option key={i} value={i + 1}>Machine {i + 1}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="10m">10 Menit</option>
          <option value="30m">30 Menit</option>
          <option value="1h">1 Jam</option>
          <option value="6h">6 Jam</option>
          <option value="24h">24 Jam</option>
          <option value="7d">7 Hari</option>
        </select>

        <button onClick={loadTrend} className="px-4 py-2 bg-blue-600 text-white rounded">
          Reload
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded-lg shadow bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="border p-2">Waktu</th>
              <th className="border p-2">RPM</th>
              <th className="border p-2">Air Temp</th>
              <th className="border p-2">Proc Temp</th>
              <th className="border p-2">Torque</th>
              <th className="border p-2">Wear</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">
                  {new Date(r.created_at).toLocaleString("id-ID")}
                </td>
                <td className="border p-2">{r.rotational_speed}</td>
                <td className="border p-2">{r.air_temperature}</td>
                <td className="border p-2">{r.process_temperature}</td>
                <td className="border p-2">{r.torque}</td>
                <td className="border p-2">{r.tool_wear}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  Tidak ada data untuk range ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
