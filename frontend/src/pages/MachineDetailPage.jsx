import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MachineOverviewCard from "../components/MachineOverviewCard";
import TrendCard from "../components/TrendCard";
import AlertHistoryCard from "../components/AlertHistoryCard";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function MachineDetailPage() {
  const { id } = useParams(); // GET /machine/:id
  const [machine, setMachine] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const res1 = await fetch(`${API}/sensor/${id}/latest`);
      const latest = await res1.json();

      const res2 = await fetch(`${API}/sensor/${id}/trend?range=3h`);
      const trendRes = await res2.json();

      const res3 = await fetch(`${API}/alerts/${id}`);
      const alertRes = await res3.json();

      setMachine(latest.data || null);
      setTrends(trendRes.chartPoints || []);
      setAlerts(alertRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error("Machine Detail Error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000); 
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="p-10 text-gray-500 text-lg">Loading machine data...</div>;
  }

  if (!machine) {
    return <div className="p-10 text-red-500 text-lg">Machine not found.</div>;
  }

  const trendRPM = trends.map(t => ({ x: t.x, value: t.rpm }));
  const trendAir = trends.map(t => ({ x: t.x, value: t.temp }));
  const trendProc = trends.map(t => ({ x: t.x, value: t.proc }));
  const trendTorque = trends.map(t => ({ x: t.x, value: t.torque }));
  const trendWear = trends.map(t => ({ x: t.x, value: t.wear }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="grid grid-cols-12 gap-4">

        {/* LEFT — Machine Overview */}
        <div className="col-span-3">
          <MachineOverviewCard machine={machine} />
        </div>

        {/* RIGHT — Trend Charts */}
        <div className="col-span-9 grid grid-cols-3 gap-4">
          <TrendCard title="RPM Trend" data={trendRPM} color="#3b82f6" />
          <TrendCard title="Air Temp Trend" data={trendAir} color="#ef4444" />
          <TrendCard title="Process Temp Trend" data={trendProc} color="#f59e0b" />
          <TrendCard title="Torque Trend" data={trendTorque} color="#22c55e" />
          <TrendCard title="Wear Trend" data={trendWear} color="#a855f7" />
        </div>

        {/* FULL WIDTH — ALERT HISTORY */}
        <div className="col-span-12 mt-4">
          <AlertHistoryCard alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
