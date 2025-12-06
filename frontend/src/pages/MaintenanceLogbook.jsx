import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE;

export default function MaintenanceLogbook() {
  const token = localStorage.getItem("accessToken");

  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    machine_id: 1,
    technician: "",
    action_taken: "",
    notes: "",
    status_before: "",
    status_after: ""
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  /** 🔥 Auto isi nama teknisi dari token */
  useEffect(() => {
    try {
      const decode = JSON.parse(atob(token.split(".")[1]));
      setForm(f => ({ ...f, technician: decode.full_name || decode.username || "Technician" }));
    } catch {
      console.warn("Token decode failed");
    }
  }, []);

  /** Fetch log */
  const loadLogs = async () => {
    const res = await fetch(`${API}/maintenance/history/${form.machine_id}`, { headers });
    const json = await res.json();
    setLogs(json.data || []);
  };

  /** Submit */
  const submitLog = async () => {
    await fetch(`${API}/maintenance/log`, {
      method: "POST",
      headers,
      body: JSON.stringify(form)
    });

    setForm(f => ({
      ...f,
      action_taken: "",
      notes: "",
      status_before: "",
      status_after: ""
    }));

    loadLogs();
  };

  useEffect(() => { loadLogs(); }, [form.machine_id]);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🛠 Maintenance Logbook</h2>

      {/* ========== FORM ========== */}
      <div className="grid gap-3 mb-8 bg-white p-4 rounded shadow w-full sm:w-2/3 lg:w-1/2">

        {/* PILIH MESIN */}
        <label className="font-semibold">Machine:</label>
        <select
          className="border p-2"
          value={form.machine_id}
          onChange={e=>setForm({...form, machine_id:Number(e.target.value)})}
        >
          {[1,2,3,4,5].map(id => <option key={id} value={id}>Machine {id}</option>)}
        </select>

        {/* TEKNISI - READ ONLY */}
        <label className="font-semibold">Technician:</label>
        <input
          className="border p-2 bg-gray-100"
          value={form.technician}
          readOnly
        />

        <label className="font-semibold">Action Taken:</label>
        <input
          className="border p-2"
          placeholder="Contoh: Ganti bearing, pelumasan ulang..."
          value={form.action_taken}
          onChange={e=>setForm({...form,action_taken:e.target.value})}
        />

        <label className="font-semibold">Notes (optional):</label>
        <textarea
          className="border p-2"
          placeholder="Catatan tambahan teknisi..."
          value={form.notes}
          onChange={e=>setForm({...form,notes:e.target.value})}
        />

        <label className="font-semibold">Previous Status:</label>
        <select
          className="border p-2"
          value={form.status_before}
          onChange={e=>setForm({...form,status_before:e.target.value})}
        >
          <option value="">Select status</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
          <option value="NORMAL">NORMAL</option>
        </select>

        <label className="font-semibold">Fixed to Status:</label>
        <select
          className="border p-2"
          value={form.status_after}
          onChange={e=>setForm({...form,status_after:e.target.value})}
        >
          <option value="">Pilih status</option>
          <option value="NORMAL">NORMAL</option>
          <option value="WARNING">WARNING</option>
        </select>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
          onClick={submitLog}
        >
          Save Maintenance Log
        </button>
      </div>

      {/* ========== LIST HISTORY ========== */}
      <h3 className="text-xl font-semibold mb-2">Riwayat Maintenance</h3>
      {logs.map((log,i)=>(
        <div key={i} className="border p-4 rounded mb-2 bg-gray-50 shadow-sm">
          <p><b>{log.technician}</b> — {log.action_taken}</p>
          <small>{new Date(log.created_at).toLocaleString()}</small><br/>
          <span className="text-xs text-gray-600">
            Status: {log.status_before} → <b>{log.status_after}</b>
          </span>
          {log.notes && <p className="text-xs italic mt-1">{log.notes}</p>}
        </div>
      ))}
    </div>
  );
}
