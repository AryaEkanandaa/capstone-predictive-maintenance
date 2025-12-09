import { useEffect, useState } from "react";
import MaintenanceForm from "../components/MaintenanceForm";

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
  const [loadingHistory, setLoadingHistory] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    try {
      const decode = JSON.parse(atob(token.split(".")[1]));
      setForm(f => ({ ...f, technician: decode.full_name || decode.username || "Technician" }));
    } catch {
      console.warn("Token decode failed");
    }
  }, [token]); 

  const loadLogs = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/maintenance/history/${form.machine_id}`, { headers });
      const json = await res.json();
      setLogs(json.data || []);
    } catch (e) {
      console.error("Failed to load logs", e);
      setLogs([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const submitLog = async () => {
    if (!form.action_taken || !form.status_before || !form.status_after) {
        alert("Action Taken dan Status harus diisi.");
        return;
    }
    
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

  const getStatusClasses = (status) => {
    switch(status) {
        case 'CRITICAL':
            return 'bg-red-500 text-white';
        case 'WARNING':
            return 'bg-yellow-500 text-gray-900';
        case 'NORMAL':
            return 'bg-green-500 text-white';
        default:
            return 'bg-gray-300 text-gray-800';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
        🛠 Maintenance Logbook Management
      </h2>

      <div className="mb-10 max-w-4xl mx-auto">
          <MaintenanceForm 
              form={form} 
              setForm={setForm} 
              submitLog={submitLog} 
          />
      </div>


      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Riwayat Maintenance Mesin {form.machine_id}
        </h3>
        
        {loadingHistory && <p className="text-center text-indigo-600 py-6">Memuat riwayat...</p>}
        {!loadingHistory && logs.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                Belum ada riwayat maintenance untuk mesin ini.
            </div>
        )}

        <div className="space-y-4">
            {logs.map((log,i)=>(
                <div 
                    key={i} 
                    className="bg-white p-5 rounded-lg shadow hover:shadow-md transition duration-200 border-l-4 border-indigo-600"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-lg font-bold text-gray-900">{log.action_taken}</p>
                            <p className="text-sm text-gray-600">Oleh: <span className="font-semibold">{log.technician}</span></p>
                        </div>

                        <small className="text-gray-400 text-xs flex-shrink-0 ml-4">
                            {new Date(log.created_at).toLocaleString()}
                        </small>
                    </div>

                    <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(log.status_before)}`}>
                            {log.status_before}
                        </span>
                        <span className="text-lg font-bold text-gray-500">→</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(log.status_after)}`}>
                            {log.status_after}
                        </span>
                    </div>
                    
                    {log.notes && (
                        <p className="text-sm italic text-gray-500 mt-3 border-t pt-2">
                            Catatan: {log.notes}
                        </p>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}