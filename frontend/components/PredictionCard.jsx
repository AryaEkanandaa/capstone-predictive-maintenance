export default function PredictionCard({ machine_name, prediction_text, prediction_date }) {
return (
    <div className="p-4 bg-gray-50 border rounded-lg shadow-sm">
        <h4 className="font-semibold">{machine_name}</h4>
        <p className="text-gray-600 text-sm mt-1">{prediction_text}</p>
        <p className="text-xs text-gray-400 mt-2">
        {new Date(prediction_date).toLocaleString()}
        </p>
    </div>
    );
}
