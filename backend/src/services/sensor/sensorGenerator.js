const MACHINE_COUNT = 5;

// STATE MESIN — base steady value
const machineStates = {};
for (let i = 1; i <= MACHINE_COUNT; i++) {
  machineStates[i] = {
    mode: Math.floor(Math.random() * 5),
    airTemperature: 70 + Math.random() * 10,
    processTemperature: 80 + Math.random() * 10,
    rotationalSpeed: 1200 + Math.random() * 200,
    torque: 35 + Math.random() * 10,
    toolWear: 0
  };
}

const noise = n => (Math.random() * 2 - 1) * n;


/**
 * MODE MESIN
 * 0 = Normal stabil
 * 1 = Heat rise (temp naik terus)
 * 2 = Power strain (torque tinggi, rpm drop)
 * 3 = Wear growth (tool wear naik cepat)
 * 4 = Anomaly spike 🔥 — data ekstrim agar ML mudah menangkap anomali
 */
export const generateSensorForMachine = (id) => {
  const s = machineStates[id];

  if (Math.random() < 0.01) s.mode = Math.floor(Math.random() * 5);

  switch (s.mode) {
    case 0: // NORMAL
      s.airTemperature += noise(0.3);
      s.processTemperature += noise(0.4);
      s.rotationalSpeed += noise(4);
      s.torque += noise(0.5);
      break;

    case 1: // HEAT FAILURE
      s.airTemperature += noise(1.2) + 1.0;
      s.processTemperature += noise(1.4) + 1.2;
      break;

    case 2: // POWER FAILURE (rpm drop)
      s.torque += noise(2.5) + 1.5;
      s.rotationalSpeed -= Math.abs(noise(10)) + 6;
      break;

    case 3: // TOOL WEAR GROWTH
      s.rotationalSpeed += noise(6) + 4;
      s.toolWear += 0.9 + Math.abs(noise(0.4));
      break;

    case 4: // **ANOMALY SPIKE (lebih ekstrim agar ML mendeteksi)**
      s.airTemperature += noise(3) + 3.5;
      s.processTemperature += noise(3.5) + 3.5;
      s.torque += noise(5) + 3;
      s.rotationalSpeed += noise(50) + 30;
      s.toolWear += 1.5 + Math.abs(noise(1.0));
      break;
  }

  // boundaries (supaya realistis)
  s.airTemperature = Math.max(40, Math.min(180, s.airTemperature));
  s.processTemperature = Math.max(50, Math.min(220, s.processTemperature));
  s.rotationalSpeed = Math.max(300, Math.min(6000, s.rotationalSpeed));
  s.torque = Math.max(5, Math.min(120, s.torque));
  s.toolWear = Math.max(0, Math.min(300, s.toolWear));

  // ============================
  // RETURN FORMAT LENGKAP SIAP ML
  // ============================
  return {
    machine_id: id,

    // format lama (agar FE tidak rusak)
    airTemperature: +s.airTemperature.toFixed(2),
    processTemperature: +s.processTemperature.toFixed(2),
    rotationalSpeed: +s.rotationalSpeed.toFixed(2),
    torque: +s.torque.toFixed(2),
    toolWear: +s.toolWear.toFixed(2),

    // format Machine Learning (WAJIB)
    Type: ["H","L","M"][Math.floor(Math.random()*3)],
    air_temp: +s.airTemperature.toFixed(2),
    process_temp: +s.processTemperature.toFixed(2),
    rpm: +s.rotationalSpeed.toFixed(2),
    tool_wear: +s.toolWear.toFixed(2),

    mode: s.mode // debugging
  };
};

export const getMachineCount = () => MACHINE_COUNT;
