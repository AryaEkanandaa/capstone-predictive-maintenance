import React, { useEffect, useState, useCallback } from "react";
import MachineCard from "../components/MachineCard";
import useSocket from "../hooks/useSocket";
import MachineTrendChart from "../components/MachineTrendChart";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const MACHINE_COUNT = Number(import.meta.env.VITE_MACHINE_COUNT) || 5;
const CHART_MAX_POINTS = 40;

export default function Dashboard() {

  const token = localStorage.getItem("accessToken");

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
      anomaly: 0,
      anomaly_score: null,
      chartPoints: []
    }))
  );

  // =========================== INITIAL DATA ==========================
  useEffect(() => {
    async function init() {
      try {
        const [sRes, pRes, aRes] = await Promise.all([
          fetch(`${API_BASE}/sensor/latest-all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/predict/latest-by-machine`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/anomaly/latest`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        ]);

        const sensorData = sRes.data || [];
        const predData = (pRes.data || []).reduce((m, p) => { m[p.machine_id] = p; return m }, {});
        const anomalyData = (aRes.data || []).reduce((m, a) => { m[a.machine_id] = a; return m }, {});

        setMachines(prev => prev.map(m => {
          const s = sensorData.find(x => x.machine_id === m.machine_id) || {};
          const p = predData[m.machine_id] || {};
          const a = anomalyData[m.machine_id] || {};
          const rpm = s.rotational_speed ?? m.rotational_speed ?? 0;
          const t = s.created_at || p.created_at || a.created_at || new Date().toISOString();
          const chart = [...m.chartPoints, {
            x: new Date(t).getTime(),
            rpm: rpm,
            temp: s.air_temperature,
            proc: s.process_temperature,
            torque: s.torque,
            wear: s.tool_wear
          }].slice(-CHART_MAX_POINTS);

          return {
            ...m,
            air_temperature: s.air_temperature,
            process_temperature: s.process_temperature,
            rotational_speed: rpm,
            torque: s.torque,
            tool_wear: s.tool_wear,
            prediction: p.failure_type,
            probability: p.failure_probability || 0,
            status: p.status || "NORMAL",
            anomaly: a.is_anomaly ? 1 : 0,
            anomaly_score: a.score || null,
            timestamp: t,
            chartPoints: chart
          };
        }));
        sensorData.forEach(s => s?.machine_id && loadTrend(s.machine_id, "10m"));
      } catch (err) { console.log("INIT ERROR", err); }
    }
    init();
  }, [token]);


  // ================= SOCKET REALTIME STREAM =================
  const handleSensorUpdate = useCallback(u => {
    setMachines(prev => prev.map(m => {
      if (m.machine_id !== u.machine_id) return m;
      const t = u.created_at || new Date().toISOString();
      const chart = [...m.chartPoints, {
        x: new Date(t).getTime(),
        rpm: u.rotational_speed,
        temp: u.air_temperature,
        proc: u.process_temperature,
        torque: u.torque,
        wear: u.tool_wear
      }].slice(-CHART_MAX_POINTS);


      return {
        ...m,
        rotational_speed: u.rotational_speed,
        air_temperature: u.air_temperature,
        process_temperature: u.process_temperature,
        torque: u.torque,
        tool_wear: u.tool_wear,
        timestamp: t,
        chartPoints: chart
      };
    }));
  }, []);

  const handlePredictionUpdate = useCallback(u => {
    setMachines(prev => prev.map(m =>
      m.machine_id !== u.machine_id ? m : {
        ...m, prediction: u.failure_type, probability: u.failure_probability, status: u.status, timestamp: u.created_at
      }
    ));
  }, []);

  const handleAnomalyUpdate = useCallback(u => {
    setMachines(prev => prev.map(m =>
      m.machine_id !== u.machine_id ? m : {
        ...m, anomaly: u.is_anomaly ? 1 : 0, anomaly_score: u.score, anomaly_status: u.status, timestamp: u.timestamp
      }
    ));
  }, []);

  useSocket({
    "sensor:update": handleSensorUpdate,
    "prediction:update": handlePredictionUpdate,
    "anomaly:update": handleAnomalyUpdate,
    connect: () => console.log("Socket Connected ⚡"),
    disconnect: () => console.log("Socket Disconnected ❌")
  });


  // ===================== UI ORDERING RULE =====================
  const hasAnomaly = machines.some(m => m.anomaly === 1);
  const hasFailure = machines.some(m => m.status !== "NORMAL");
  const normalLayout = !hasAnomaly && !hasFailure; // machine overview di atas

  async function loadTrend(machine_id, range="30m") {
  try {
    const res = await fetch(`${API_BASE}/sensor/${machine_id}/trend?range=${range}`, {
      headers:{ Authorization:`Bearer ${token}` }
    });
    const d = await res.json();
    if(d.status !== "success") return;

    setMachines(prev => prev.map(m=>{
      if(m.machine_id !== machine_id) return m;

      const history = d.trend.map(p=>({
        x:new Date(p.created_at).getTime(),
        rpm:p.rotational_speed,
        temp:p.air_temperature,
        proc:p.process_temperature,
        torque:p.torque,
        wear:p.tool_wear
      }));

      return { ...m, chartPoints:[...history, ...m.chartPoints].slice(-CHART_MAX_POINTS) };
    }));
  } catch{}
}

  return (
    <div>

      {/* ===================== MACHINE OVERVIEW (JIKA NORMAL) ===================== */}
      {normalLayout && (
        <>
          <h2 className="text-xl font-bold mb-6">Machine Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {machines.map(m => <MachineCard key={m.machine_id} {...m} />)}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">📈 Live Trend Realtime</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {machines.map(m => <MachineTrendChart key={m.machine_id} machine={m} />)}
      </div>

      {/* ===================== ANOMALY ===================== */}
      {hasAnomaly && (
        <>
          <h2 className="text-xl font-bold mb-3">🧨 Realtime Anomaly Detection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {machines.filter(m => m.anomaly === 1).map(m => (
              <div key={m.machine_id} className="p-4 border rounded-lg bg-orange-50 border-orange-400 shadow">
                <h3 className="font-bold text-lg text-orange-700">{m.name}</h3>
                <p className="text-sm font-semibold">⚠ Anomaly Detected</p>
                <p className="text-xs text-gray-600 mt-1">Score: {m.anomaly_score?.toFixed(3)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================== FAILURE ALERT ===================== */}
      {hasFailure && (
        <>
          <h2 className="text-xl font-bold mb-4">⚠ Active Failure Alerts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {machines.filter(m => m.status !== "NORMAL").map(m => (
              <div key={m.machine_id} className={`p-4 rounded-lg shadow text-sm ${m.status === "CRITICAL" ? "bg-red-50 border border-red-400" : "bg-yellow-50 border border-yellow-400"}`}>
                <h3 className="font-bold">{m.name}</h3>
                <p>{m.prediction} — {(m.probability * 100).toFixed(1)}%</p>
                <p>Status: {m.status}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================== MACHINE OVERVIEW (JIKA ADA ALERT) ===================== */}
      {!normalLayout && (
        <>
          <h2 className="text-xl font-bold mb-6">Machine Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map(m => <MachineCard key={m.machine_id} {...m} />)}
          </div>
        </>
      )}

    </div>
  );
}
