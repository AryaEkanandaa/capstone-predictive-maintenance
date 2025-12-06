export default function PredictionCard({
  machine_name,
  prediction_text,
  prediction_date,
  status
}) {
  const color =
    status === "CRITICAL"
      ? "bg-red-100 text-red-700 border-red-300"
      : status === "WARNING"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : "bg-green-100 text-green-700 border-green-300";

  return (
    <div className="p-5 bg-white shadow rounded-xl border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900">{machine_name}</h3>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${color}`}>
          {status}
        </span>
      </div>

      <p className="text-gray-700 mb-2">{prediction_text}</p>

      <p className="text-gray-400 text-xs">
        {new Date(prediction_date).toLocaleString()}
      </p>
    </div>
  );
}
