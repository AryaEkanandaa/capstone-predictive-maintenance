import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default function MLResultCard({ data }) {
  const { input, prediction, anomaly } = data;

  const statusStyle = {
    CRITICAL: "border-red-400 bg-red-50 text-red-700",
    WARNING: "border-yellow-400 bg-yellow-50 text-yellow-700",
    NORMAL: "border-green-400 bg-green-50 text-green-700",
  };

  return (
    <div
      className={`max-w-md w-full border rounded-xl overflow-hidden
      ${statusStyle[prediction.status]}`}
    >
      {/* HEADER */}
      <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold">
        <Activity className="w-4 h-4" />
        Hasil Prediksi ML
      </div>

      {/* BODY */}
      <div className="px-3 py-3 space-y-3 text-sm bg-white">

        {/* INPUT */}
        <div>
          <p className="font-medium mb-1 text-gray-700">📥 Data Sensor</p>
          <div className="grid grid-cols-2 gap-y-1 text-gray-800">
            <span className="text-gray-500">Air Temp</span>
            <span>{input.air_temp} °K</span>

            <span className="text-gray-500">Process Temp</span>
            <span>{input.process_temp} °K</span>

            <span className="text-gray-500">RPM</span>
            <span>{input.rpm}</span>

            <span className="text-gray-500">Torque</span>
            <span>{input.torque} Nm</span>

            <span className="text-gray-500">Tool Wear</span>
            <span>{input.tool_wear} min</span>
          </div>
        </div>

        {/* PREDICTION */}
        <div>
          <p className="font-medium mb-1 text-gray-700"> Prediksi</p>
          <div className="flex items-center gap-2">
            {prediction.status === "CRITICAL" ? (
              <AlertTriangle className="text-red-600 w-4 h-4" />
            ) : (
              <CheckCircle className="text-green-600 w-4 h-4" />
            )}
            <span className="font-semibold">
              {prediction.predicted_failure}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Confidence {(prediction.confidence * 100).toFixed(1)}%
          </p>
        </div>

        {/* ANOMALY */}
        <div>
          <p className="font-medium mb-1 text-gray-700"> Anomali</p>
          <p
            className={`font-semibold ${
              anomaly.is_anomaly ? "text-red-600" : "text-green-600"
            }`}
          >
            {anomaly.is_anomaly ? "Terdeteksi" : "Normal"}
          </p>
          <p className="text-xs text-gray-500">
            Score {anomaly.score}
          </p>
        </div>
      </div>
    </div>
  );
}
