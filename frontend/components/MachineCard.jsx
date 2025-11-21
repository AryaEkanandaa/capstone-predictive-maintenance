export default function MachineCard({
name,
status,
air_temperature,
process_temperature,
rotational_speed,
torque,
tool_wear,
}) {
return (
    <div className="p-4 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-200">
    <h3 className="font-semibold text-lg">{name}</h3>
    <p className="text-sm text-gray-500 mb-3">Status: {status}</p>

    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div>
            <p className="text-gray-600">Air Temp</p>
            <p className="font-semibold">{air_temperature}°C</p>
        </div>

        <div>
            <p className="text-gray-600">Process Temp</p>
            <p className="font-semibold">{process_temperature}°C</p>
        </div>

        <div>
            <p className="text-gray-600">Rotational Speed</p>
            <p className="font-semibold">{rotational_speed} RPM</p>
        </div>

        <div>
            <p className="text-gray-600">Torque</p>
            <p className="font-semibold">{torque} Nm</p>
        </div>

        <div>
            <p className="text-gray-600">Tool Wear</p>
            <p className="font-semibold">{tool_wear}</p>
        </div>
        </div>
    </div>
    );
}
