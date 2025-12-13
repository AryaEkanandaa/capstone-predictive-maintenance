import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MachineTrendChart({ machine }) {
  // 🛡️ Guard
  if (!machine || !Array.isArray(machine.chartPoints)) {
    return (
      <div className="p-4 bg-white border rounded-xl shadow text-gray-500 text-sm">
        Tidak ada data tren tersedia
      </div>
    );
  }

  const [show, setShow] = useState({
    rpm: true,
    temp: false,
    proc: false,
    torque: false,
    wear: false,
  });

  // 🔄 Format data chart
  const data = useMemo(() => {
    return machine.chartPoints.map((p) => ({
      waktu: p.x
        ? new Date(p.x).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "-",
      rpm: p.rpm ?? null,
      suhu_udara: p.temp ?? null,
      suhu_proses: p.proc ?? null,
      torsi: p.torque ?? null,
      keausan: p.wear ?? null,
    }));
  }, [machine.chartPoints]);

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition">
      {/* HEADER */}
      <div className="mb-2 sm:mb-3">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
          Tren Parameter — Mesin {machine.machine_id}
        </h3>
        <p className="text-xs text-gray-500">
          Perubahan nilai sensor secara realtime
        </p>
      </div>

      {/* FILTER PARAMETER */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-xs">
        <Toggle label="RPM" active={show.rpm} onClick={() => setShow(s => ({ ...s, rpm: !s.rpm }))} />
        <Toggle label="Suhu Udara" active={show.temp} onClick={() => setShow(s => ({ ...s, temp: !s.temp }))} />
        <Toggle label="Suhu Proses" active={show.proc} onClick={() => setShow(s => ({ ...s, proc: !s.proc }))} />
        <Toggle label="Torsi" active={show.torque} onClick={() => setShow(s => ({ ...s, torque: !s.torque }))} />
        <Toggle label="Keausan" active={show.wear} onClick={() => setShow(s => ({ ...s, wear: !s.wear }))} />
      </div>

      {/* CHART - FIXED HEIGHT SOLUTION */}
      <div className="w-full" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="waktu" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />

            {show.rpm && (
              <Line type="monotone" dataKey="rpm" name="RPM" stroke="#3b82f6" strokeWidth={2} dot={false} />
            )}
            {show.temp && (
              <Line type="monotone" dataKey="suhu_udara" name="Suhu Udara" stroke="#f97316" strokeWidth={2} dot={false} />
            )}
            {show.proc && (
              <Line type="monotone" dataKey="suhu_proses" name="Suhu Proses" stroke="#06b6d4" strokeWidth={2} dot={false} />
            )}
            {show.torque && (
              <Line type="monotone" dataKey="torsi" name="Torsi" stroke="#22c55e" strokeWidth={2} dot={false} />
            )}
            {show.wear && (
              <Line type="monotone" dataKey="keausan" name="Keausan Alat" stroke="#a855f7" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* =========================
   TOGGLE COMPONENT
========================= */
function Toggle({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 sm:px-3 py-1 rounded-full border text-xs font-medium transition
        ${
          active
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
        }`}
    >
      {label}
    </button>
  );
}