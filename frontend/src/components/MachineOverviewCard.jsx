export default function MachineOverviewCard({ machine }) {
  return (
    <div className="bg-white shadow p-5 rounded-xl border">
      <h2 className="text-lg font-semibold mb-3">Machine Overview</h2>

      <p className="font-semibold">Machine {machine.machine_id}</p>

      <div className="text-xs text-gray-500 mt-2">Prediction</div>
      <div className="font-bold text-sm">
        {machine.prediction || "No Failure"} ({(machine.probability * 100 || 0).toFixed(1)}%)
      </div>

      <div className="mt-3 text-sm">
        <p>Air Temp: {machine.air_temperature}°K</p>
        <p>Process Temp: {machine.process_temperature}°K</p>
        <p>RPM: {machine.rotational_speed}</p>
        <p>Torque: {machine.torque} Nm</p>
        <p>Wear: {machine.tool_wear} min</p>

        <p className="mt-2">
          Anomaly:{" "}
          <span className={machine.anomaly ? "text-red-600" : "text-green-600"}>
            {machine.anomaly ? "YES" : "NO"}
          </span>
        </p>
      </div>
    </div>
  );
}
