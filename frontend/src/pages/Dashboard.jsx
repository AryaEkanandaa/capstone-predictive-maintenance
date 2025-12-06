import React, { useEffect, useState, useCallback } from "react";
import MachineCard from "../components/MachineCard";
import useSocket from "../hooks/useSocket";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const MACHINE_COUNT = Number(import.meta.env.VITE_MACHINE_COUNT) || 5;
const CHART_MAX_POINTS = 40;

export default function Dashboard() {

  const token = localStorage.getItem("accessToken"); // 🔥 diambil disini!

  const [machines, setMachines] = useState(() =>
    Array.from({ length: MACHINE_COUNT }).map((_, i) => ({
      id: i + 1,
      machine_id: i + 1,
      name: `Machine ${i + 1}`,
      status: "NORMAL",
      prediction: null,
      probability: 0,
      air_temperature: null,
      process_temperature: null,
      rotational_speed: 0,
      torque: 0,
      tool_wear: null,
      timestamp: null,
      chartPoints: []
    }))
  );

  // 🔥 Fetch awal + token
  useEffect(() => {
    async function init() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/sensor/latest-all`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.json()),

          fetch(`${API_BASE}/predict/latest-by-machine`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.json())
        ]);

        const sensorData = sRes.data || [];
        const predData = (pRes.data || []).reduce((a, p) => { a[p.machine_id] = p; return a }, {});

        setMachines(prev => prev.map(m => {
          const s = sensorData.find(x => x.machine_id === m.machine_id) || {};
          const p = predData[m.machine_id] || {};
          const rpm = s.rotational_speed ?? m.rotational_speed ?? 0;
          const t = s.created_at || p.created_at || new Date().toISOString();
          const pt = { x: new Date(t).getTime(), y: rpm };
          const chart = [...m.chartPoints, pt].slice(-CHART_MAX_POINTS);

          return {
            ...m,
            air_temperature: s.air_temperature ?? m.air_temperature,
            process_temperature: s.process_temperature ?? m.process_temperature,
            rotational_speed: rpm,
            torque: s.torque ?? m.torque,
            tool_wear: s.tool_wear ?? m.tool_wear,
            prediction: p.failure_type ?? m.prediction,
            probability: p.failure_probability ?? m.probability,
            status: p.status ?? m.status,
            timestamp: t,
            chartPoints: chart
          }
        }));

      } catch (e) { console.log("INIT ERROR", e); }
    }
    init();
  }, [token]);

  // SOCKET EVENT HANDLER (TETAP)
  const handleSensorUpdate = useCallback((u) => {
    setMachines(prev => prev.map(m => {
      if (m.machine_id !== u.machine_id) return m;
      const rpm = u.rotational_speed ?? m.rotational_speed ?? 0;
      const t = u.created_at || new Date().toISOString();
      const chart = [...m.chartPoints, { x: new Date(t).getTime(), y: rpm }].slice(-CHART_MAX_POINTS);

      return {
        ...m,
        rotational_speed: rpm,
        air_temperature: u.air_temperature ?? m.air_temperature,
        process_temperature: u.process_temperature ?? m.process_temperature,
        torque: u.torque ?? m.torque,
        tool_wear: u.tool_wear ?? m.tool_wear,
        timestamp: t,
        chartPoints: chart
      };
    }))
  }, []);

  const handlePredictionUpdate = useCallback((u) => {
    setMachines(prev => prev.map(m =>
      m.machine_id !== u.machine_id ? m : {
        ...m,
        prediction: u.failure_type,
        probability: u.failure_probability,
        status: u.status,
        timestamp: u.created_at
      }
    ))
  }, []);

  useSocket({
    "sensor:update": handleSensorUpdate,
    "prediction:update": handlePredictionUpdate,
    connect: () => console.log("socket connected"),
    disconnect: () => console.log("socket disconnected"),
  });
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">⚠ Active Alerts</h2>

      {machines.some(m => m.status !== "NORMAL") ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {machines
            .filter(m => m.status !== "NORMAL")
            .map((m) => (
              <div
                key={`alert-${m.machine_id}`}
                className={`p-4 border rounded-lg shadow bg-white ${m.status === "CRITICAL"
                  ? "border-red-400 bg-red-50"
                  : "border-yellow-400 bg-yellow-50"
                  }`}
              >
                <h3 className="font-bold text-lg">{m.name}</h3>
                <p className="text-sm">
                  {m.prediction} – {(m.probability * 100).toFixed(1)}%
                </p>
                <p className="text-xs mt-1 text-gray-600">
                  Status: {m.status}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-10">No warnings — all machines normal ✔</p>
      )}

      <h2 className="text-xl font-bold mb-6">Machine Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((m) => (
          <MachineCard key={`machine-${m.machine_id}`} {...m} />
        ))}
      </div>

    </div>
  );

}