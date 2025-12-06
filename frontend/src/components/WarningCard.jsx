export default function WarningCard({ machine_id, failure_type, probability, status }) {
  return (
    <div className={`p-4 rounded-lg border shadow
      ${status === "CRITICAL" ? "bg-red-100 border-red-300" : "bg-yellow-100 border-yellow-300"}`}>
      
      <h4 className="font-bold text-lg">
        Machine {machine_id}
      </h4>

      <p className="text-gray-700">
        {failure_type} ({(probability * 100).toFixed(1)}%)
      </p>

      <span className="text-sm font-semibold">
        Status: {status}
      </span>
    </div>
  );
}
