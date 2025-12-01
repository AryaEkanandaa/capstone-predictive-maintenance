// backend/src/services/modelService.js

// ===============================================
// Temporary Mock ML Service (no real ML required)
// Replace later when Python ML server is ready.
// ===============================================

// Dummy anomaly detection
export const runAnomalyDetection = async (payload = {}) => {
  const tw = Number(payload.toolWear ?? 0);
  const pt = Number(payload.processTemperature ?? 0);
  const rs = Number(payload.rotationalSpeed ?? 0);

  // Simple heuristic (you can change anytime)
  const score = Math.min(
    (tw / 100) * 0.5 +
      Math.abs(rs - 1200) / 2000 * 0.25 +
      Math.max((pt - 80) / 50, 0) * 0.25,
    1
  );

  return {
    isAnomaly: score > 0.75,
    score: Number(score.toFixed(3)),
  };
};

// Dummy failure prediction
export const runFailurePrediction = async (payload = {}) => {
  const tw = Number(payload.toolWear ?? 0);
  const pt = Number(payload.processTemperature ?? 0);

  let prob = (tw / 100) * 0.7 + Math.max((pt - 80) / 70, 0) * 0.3;

  prob = Math.min(1, Math.max(0, prob));

  return { failureProbability: Number(prob.toFixed(3)) };
};

export default {
  runAnomalyDetection,
  runFailurePrediction,
};
