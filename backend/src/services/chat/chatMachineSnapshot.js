import { getLatestPrediction } from "../../services/prediction/predictionService.js";
import { getLatestByMachine } from "../../services/sensor/sensorService.js";
import { getLatestAnomaly } from "../../services/anomaly/anomalyService.js";

export async function getMachineSnapshot(id) {
  const s = await getLatestByMachine(id);
  const p = await getLatestPrediction(id);
  const a = await getLatestAnomaly(id);

  return `
### Kondisi Mesin ${id}

| Parameter    | Value |
|--------------|-------|
| Air Temp     | ${s?.air_temperature ?? "-"} |
| Process Temp | ${s?.process_temperature ?? "-"} |
| RPM          | ${s?.rotational_speed ?? "-"} |
| Torque       | ${s?.torque ?? "-"} |
| Tool Wear    | ${s?.tool_wear ?? "-"} |

**Prediction:** ${p?.failure_type ?? "No Failure"}
**Prob:** ${(p?.failure_probability * 100 || 0).toFixed(1)}%
**Anomaly:** ${a?.is_anomaly ? "⚠ Yes" : "✔ None"}
`;
}
