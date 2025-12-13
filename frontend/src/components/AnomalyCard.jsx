import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default function AnomalyCard({
  machine_name,
  is_anomaly,
  score,
  created_at,
}) {
  const isCritical = Boolean(is_anomaly);

  const statusStyle = isCritical
    ? "border-red-400 bg-red-50 text-red-700"
    : "border-green-400 bg-green-50 text-green-700";

  return (
    <div className={`w-full max-w-md border rounded-xl overflow-hidden ${statusStyle}`}>
      
      {/* HEADER */}
      <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold">
        <Activity className="w-4 h-4" />
        Hasil Deteksi Anomali
      </div>

      {/* BODY */}
      <div className="px-4 py-3 space-y-3 text-sm bg-white">

        {/* MACHINE */}
        <div>
          <p className="text-gray-500 text-xs">Mesin</p>
          <p className="font-semibold text-gray-800">{machine_name}</p>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          <span className="font-semibold">
            {isCritical ? "ANOMALI " : " NORMAL"}
          </span>
        </div>

        {/* SCORE */}
        <div>
          <p className="text-gray-500 text-xs">Skor Anomali</p>
          <p className="font-mono">
            {Number(score).toFixed(5)}
          </p>
        </div>

        {/* TIME */}
        <div>
          <p className="text-gray-500 text-xs">Waktu</p>
          <p>
            {new Date(created_at).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
