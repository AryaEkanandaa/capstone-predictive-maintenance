import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default function PredictionCard({
  machine_name,
  prediction_text,
  prediction_date,
  status,
}) {
  const isCritical = status === "CRITICAL";
  const isWarning = status === "WARNING";

  const statusStyle = isCritical
    ? "border-red-400 bg-red-50 text-red-700"
    : isWarning
    ? "border-yellow-400 bg-yellow-50 text-yellow-700"
    : "border-green-400 bg-green-50 text-green-700";

  const statusLabel = isCritical
    ? "KRITIS"
    : isWarning
    ? "PERINGATAN"
    : "NORMAL";

  return (
    <div
      className={`w-full max-w-md border rounded-xl overflow-hidden ${statusStyle}`}
    >
      {/* HEADER */}
      <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold">
        <Activity className="w-4 h-4" />
        Hasil Prediksi Mesin
      </div>

      {/* BODY */}
      <div className="px-4 py-3 space-y-3 text-sm bg-white">

        {/* MACHINE */}
        <div>
          <p className="text-gray-500 text-xs">Mesin</p>
          <p className="font-semibold text-gray-800">
            {machine_name}
          </p>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          <span className="font-semibold">
            Status: {statusLabel}
          </span>
        </div>

        {/* PREDICTION TEXT */}
        <div>
          <p className="text-gray-500 text-xs mb-1">
            Ringkasan Prediksi
          </p>
          <p className="text-gray-800 leading-relaxed">
            {prediction_text}
          </p>
        </div>

        {/* TIME */}
        <div>
          <p className="text-gray-500 text-xs">Waktu Prediksi</p>
          <p>
            {new Date(prediction_date).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
