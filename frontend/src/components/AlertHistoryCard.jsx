export default function AlertHistoryCard({ alerts = [] }) {
  return (
    <div className="p-4 bg-white shadow rounded-xl border">
      <h3 className="font-semibold mb-2">Alert History</h3>

      {alerts.length === 0 && (
        <p className="text-gray-500 text-sm">No alerts recorded.</p>
      )}

      {alerts.map((a, i) => (
        <div key={i} className="border-b py-2 text-sm">
          <p>
            <span className="font-semibold">{a.status}</span> — Score: {a.score}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(a.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
