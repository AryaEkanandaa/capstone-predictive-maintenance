import React, { useEffect, useRef, useState } from "react";
import useCountUp from "../hooks/useCountUp";
import LiveChart from "./LiveChart";

function MachineCard({
  id,
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
  chartPoints = []
}) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef({ rotational_speed, torque, air_temperature, prediction, probability, status });

  const rpm = useCountUp(rotational_speed ?? 0, 500);
  const torqueSm = useCountUp(torque ?? 0, 500);

  // Overlay highlight saat data baru masuk 🔥
  useEffect(() => {
    const curr = { rotational_speed, torque, air_temperature, prediction, probability, status };
    if (JSON.stringify(prev.current) !== JSON.stringify(curr)) {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 300);
      prev.current = curr;
      return () => clearTimeout(t);
    }
  }, [rotational_speed, torque, air_temperature, prediction, probability, status]);


  const statusStyle =
    status === "CRITICAL" ? "bg-red-100 text-red-700 border-red-300" :
    status === "WARNING"  ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                            "bg-green-100 text-green-700 border-green-300";


  return (
    <div
      className={`p-4 bg-white rounded-xl border ${
        highlight ? "ring-2 ring-indigo-300" : "border-gray-200"
      } transition-all duration-200 shadow-sm hover:shadow-md`}
    >

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold">{name}</h3>

        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyle}`}>
          {status}
        </span>
      </div>

      {/* Prediction */}
      <div className="mb-2 text-xs text-gray-500">Prediction</div>
      <div className="mb-3">
        {prediction ? (
          <div className="flex items-baseline gap-2">
            <div className="font-semibold text-gray-900 text-sm">{prediction}</div>
            <div className="text-xs text-gray-500">({((probability ?? 0) * 100).toFixed(1)}%)</div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">No prediction</div>
        )}
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-2 gap-1 text-sm mb-3">

        <Info label="Air Temp" value={`${air_temperature}°C`} />
        <Info label="Process Temp" value={`${process_temperature}°C`} />
        <Info label="RPM" value={Math.round(rpm)} />
        <Info label="Torque" value={`${torqueSm.toFixed(1)} Nm`} />
        <Info label="Wear" value={`${tool_wear ?? "-"} min`} />
        <Info label="Updated" value={timestamp ? new Date(timestamp).toLocaleTimeString() : "-"} />
      </div>

      {/* 🔥 LIVE MINI CHART */}
      <LiveChart points={chartPoints} label="RPM" status={status} />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-[13px] text-gray-900">{value}</div>
    </div>
  );
}

export default React.memo(MachineCard);
