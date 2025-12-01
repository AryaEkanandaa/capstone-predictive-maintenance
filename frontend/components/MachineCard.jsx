export default function MachineCard({
  name,
  status,
  air_temperature,
  process_temperature,
  rotational_speed,
  torque,
  tool_wear,
  timestamp,
}) {
  return (
    <div className="p-5 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{name || "Unknown Machine"}</h3>

        <span
          className={`text-sm font-semibold ${
            status === "Failure Risk"
              ? "text-red-500"
              : status === "Warning"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {status || "Unknown"}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p className="text-gray-500">Air Temp</p>
          <p className="font-semibold">{air_temperature ?? "-"} °C</p>
        </div>

        <div>
          <p className="text-gray-500">Process Temp</p>
          <p className="font-semibold">{process_temperature ?? "-"} °C</p>
        </div>

        <div>
          <p className="text-gray-500">Rotational Speed</p>
          <p className="font-semibold">{rotational_speed ?? "-"} RPM</p>
        </div>

        <div>
          <p className="text-gray-500">Torque</p>
          <p className="font-semibold">{torque ?? "-"} Nm</p>
        </div>

        <div>
          <p className="text-gray-500">Tool Wear</p>
          <p className="font-semibold">{tool_wear ?? "-"}</p>
        </div>
      </div>

      {/* Timestamp */}
      {timestamp && (
        <p className="text-xs text-gray-400 mt-4">
          Last updated: {new Date(timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
