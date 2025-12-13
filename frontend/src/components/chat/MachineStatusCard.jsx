import { AlertTriangle, CheckCircle, Activity } from "lucide-react";

export default function MachineStatusCard({ data }) {
    const { sensor, prediction, anomaly, machine_id } = data;

    // Tentukan status berdasarkan prediction
    const getStatus = () => {
        if (prediction.failure_type !== "No Failure") {
            return "CRITICAL";
        }
        if (anomaly.is_anomaly) {
            return "WARNING";
        }
        return "NORMAL";
    };

    const status = getStatus();

    const statusStyle = {
        CRITICAL: "border-red-400 bg-red-50",
        WARNING: "border-yellow-400 bg-yellow-50",
        NORMAL: "border-green-400 bg-green-50",
    };

    const textColor = {
        CRITICAL: "text-red-700",
        WARNING: "text-yellow-700",
        NORMAL: "text-green-700",
    };

    // Helper function untuk format nilai sensor
    const formatValue = (value, unit = '') => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return `${value}${unit}`;
    };

    // Helper untuk handle kedua format field names
    const getSensorValue = (field1, field2) => {
        return sensor[field1] ?? sensor[field2];
    };

    return (
        <div className={`max-w-md w-full border-2 rounded-xl overflow-hidden ${statusStyle[status]}`}>
            {/* HEADER */}
            <div className={`px-4 py-3 flex items-center gap-2 text-sm font-semibold ${textColor[status]}`}>
                <Activity className="w-5 h-5" />
                Status Mesin {machine_id}
            </div>

            {/* BODY */}
            <div className="px-4 py-4 space-y-4 text-sm bg-white">

                {/* SENSOR */}
                <div>
                    <p className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        📡 Data Sensor
                    </p>
                    <div className="grid grid-cols-2 gap-y-2 text-gray-600">
                        <span>Air Temp</span>
                        <span className="text-right">
                            {formatValue(getSensorValue('air_temperature', 'air_temp'), ' °K')}
                        </span>

                        <span>Process Temp</span>
                        <span className="text-right">
                            {formatValue(getSensorValue('process_temperature', 'process_temp'), ' °K')}
                        </span>

                        <span>RPM</span>
                        <span className="text-right">
                            {formatValue(getSensorValue('rotational_speed', 'rpm'))}
                        </span>

                        <span>Torque</span>
                        <span className="text-right">
                            {formatValue(sensor.torque, ' Nm')}
                        </span>

                        <span>Tool Wear</span>
                        <span className="text-right">
                            {formatValue(sensor.tool_wear, ' min')}
                        </span>
                    </div>
                </div>

                {/* PREDIKSI */}
                <div>
                    <p className="font-semibold mb-2 text-gray-700">Prediksi ML</p>
                    <div className="flex items-center gap-2">
                        {prediction.failure_type !== "No Failure" ? (
                            <AlertTriangle className="text-red-600 w-5 h-5" />
                        ) : (
                            <CheckCircle className="text-green-600 w-5 h-5" />
                        )}
                        <span className="font-medium">
                            {prediction.failure_type || 'Unknown'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Confidence {prediction.probability ? `${(prediction.probability * 100).toFixed(1)}%` : 'NaN%'}
                    </p>
                </div>

                {/* ANOMALI */}
                <div>
                    <p className="font-semibold mb-2 text-gray-700">Anomali</p>
                    <p className={`font-medium ${anomaly.is_anomaly ? "text-red-600" : "text-green-600"}`}>
                        {anomaly.is_anomaly ? "Terdeteksi" : "Normal"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Score {anomaly.score || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}