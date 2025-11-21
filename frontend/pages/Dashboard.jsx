import { useEffect, useState } from "react";
import MachineCard from "../components/MachineCard";
import PredictionCard from "../components/PredictionCard";

export default function Dashboard() {
const [machines, setMachines] = useState([]);
const [predictions, setPredictions] = useState([]);

useEffect(() => {
    fetch("http://localhost:3000/api/machines")
        .then(res => res.json())
        .then(data => setMachines(data))
        .catch(err => console.error("Error fetching machines:", err));

    fetch("http://localhost:3000/api/predictions")
        .then(res => res.json())
        .then(data => setPredictions(data))
        .catch(err => console.error("Error fetching predictions:", err));
    }, []);

return (
    <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Machine Overview</h2>

        <div className="grid grid-cols-3 gap-6">
        {machines.map(machine => (
            <MachineCard key={machine.id} {...machine} />
        ))}
    </div>

    <div className="mt-10 p-6 bg-white rounded-xl shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Prediction</h3>

        <div className="grid grid-cols-3 gap-4">
            {predictions.length > 0 ? (
            predictions.map(p => (
        <PredictionCard key={p.id} {...p} />
            ))
            ) : (
            <p className="text-gray-600">No predictions available.</p>
        )}
        </div>
    </div>
    </div>
    );
}
