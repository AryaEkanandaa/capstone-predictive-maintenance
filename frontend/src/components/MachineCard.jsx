import React, { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import useCountUp from "../hooks/useCountUp";
import { useNavigate } from "react-router-dom";

function MachineCard({
  name,
  machine_id,
  status,
  prediction,
  probability,
  air_temperature,
  process_temperature,
  rotational_speed,
  torque,
  tool_wear,
  timestamp,
  anomaly,
  anomaly_score,
}) {
  const navigate = useNavigate();

  const [highlight, setHighlight] = useState(false);
  const prev = useRef({ status, prediction, probability });

  const rpm = useCountUp(rotational_speed ?? 0, 400);
  const torqueSmooth = useCountUp(torque ?? 0, 400);

  useEffect(() => {
    const curr = { status, prediction, probability };
    if (JSON.stringify(prev.current) !== JSON.stringify(curr)) {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 300);
      prev.current = curr;
      return () => clearTimeout(t);
    }
  }, [status, prediction, probability]);

  const statusStyle =
    status === "CRITICAL"
      ? "border-red-400 bg-red-50 text-red-700"
      : status === "WARNING"
      ? "border-yellow-400 bg-yellow-50 text-yellow-700"
      : "border-green-400 bg-green-50 text-green-700";

  const statusLabel =
    status === "CRITICAL"
      ? "KRITIS"
      : status === "WARNING"
      ? "PERINGATAN"
      : "NORMAL";

  return (
    <div
      onClick={() => navigate(`/machine/${machine_id}`)}
      className={`cursor-pointer w-full max-w-md border rounded-xl overflow-hidden
        ${statusStyle}
        ${highlight ? "ring-2 ring-indigo-300" : ""}
        transition-all duration-200 hover:shadow-md`}
    >
      {/* HEADER */}
      <div className="px-3 py-2 flex justify-between items-center text-sm font-semibold">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {name}
        </div>

        <span className="text-xs font-bold">
          {statusLabel}
        </span>
      </div>

      {/* BODY */}
      <div className="px-4 py-3 space-y-3 text-sm bg-white">

        {/* PREDIKSI */}
        <div>
          <p className="text-gray-500 text-xs mb-1">Prediksi Terakhir</p>
          {prediction ? (
            <div className="flex items-center gap-2">
              {status === "CRITICAL" ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="font-semibold text-gray-800">
                {prediction}
              </span>
              <span className="text-xs text-gray-500">
                ({((probability ?? 0) * 100).toFixed(1)}%)
              </span>
            </div>
          ) : (
            <p className="italic text-gray-400 text-xs">
              Belum ada prediksi
            </p>
          )}
        </div>

        {/* ANOMALI */}
        {anomaly === 1 && (
          <div className="p-2 rounded-md bg-orange-50 border border-orange-300">
            <p className="text-xs font-semibold text-orange-700">
              ⚠ Anomali Terdeteksi
            </p>
            <p className="text-[11px] text-orange-600">
              Skor Anomali: {anomaly_score?.toFixed(4)}
            </p>
          </div>
        )}

        {/* SENSOR */}
        <div>
          <p className="text-gray-500 text-xs mb-1">Data Sensor</p>
          <div className="grid grid-cols-2 gap-y-1 text-gray-800">
            <Info label="Air Temp" value={`${air_temperature} °K`} />
            <Info label="Process Temp" value={`${process_temperature} °K`} />
            <Info label="RPM" value={Math.round(rpm)} />
            <Info label="Torque" value={`${torqueSmooth.toFixed(1)} Nm`} />
            <Info label="Tool Wear" value={`${tool_wear ?? "-"} min`} />
            <Info
              label="Update"
              value={timestamp ? new Date(timestamp).toLocaleTimeString("id-ID") : "-"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <>
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-sm">{value}</span>
    </>
  );
}

export default React.memo(MachineCard);
