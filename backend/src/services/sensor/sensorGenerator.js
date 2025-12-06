const MACHINE_COUNT = 5;

// STATE MESIN (tetap smooth & berkelanjutan)
const machineStates = {};

for (let i = 1; i <= MACHINE_COUNT; i++) {
  machineStates[i] = {
    mode: Math.floor(Math.random() * 5), // tiap mesin berbeda karakter!
    airTemperature: 70 + Math.random() * 10,
    processTemperature: 80 + Math.random() * 10,
    rotationalSpeed: 1200 + Math.random() * 200,
    torque: 35 + Math.random() * 10,
    toolWear: 0
  };
}

// Utility noise
const noise = (n = 1) => (Math.random() * 2 - 1) * n;

/**
 * MODE MESIN:
 * 0 = normal
 * 1 = overheating trend
 * 2 = torque overload
 * 3 = high-speed wear
 * 4 = random instability (pakai 10–20%)
 */
export const generateSensorForMachine = (machine_id) => {
  const s = machineStates[machine_id];
  
  // Ubah mode secara periodik agar bervariasi
  if (Math.random() < 0.01) s.mode = Math.floor(Math.random() * 5);

  switch (s.mode) {
    case 0: // NORMAL
      s.airTemperature += noise(0.3);
      s.processTemperature += noise(0.4);
      s.rotationalSpeed += noise(4);
      s.torque += noise(0.5);
      break;

    case 1: // HEAT FAILURE POTENTIAL
      s.airTemperature += noise(1.2) + 0.9;
      s.processTemperature += noise(1.4) + 1.1;
      break;

    case 2: // POWER FAILURE POTENTIAL (torque naik, rpm turun)
      s.torque += noise(2.5) + 1.5;
      s.rotationalSpeed -= Math.abs(noise(5)) + 3;
      break;

    case 3: // TOOL WEAR FAILURE TREND (rpm tinggi + wear naik)
      s.rotationalSpeed += noise(6) + 4;
      s.toolWear += 0.8 + Math.abs(noise(0.4));
      break;

    case 4: // RANDOM / ANOMALY (trigger failure lain)
      s.airTemperature += noise(3) + 1.5;
      s.processTemperature += noise(3) + 1.5;
      s.torque += noise(3) + 1.2;
      s.rotationalSpeed += noise(12) + 6;
      s.toolWear += Math.abs(noise(1.2));
      break;
  }

  // KEEP values reasonable
  s.airTemperature = Math.max(40, Math.min(150, s.airTemperature));
  s.processTemperature = Math.max(50, Math.min(200, s.processTemperature));
  s.rotationalSpeed = Math.max(300, Math.min(6000, s.rotationalSpeed));
  s.torque = Math.max(5, Math.min(120, s.torque));
  s.toolWear = Math.max(0, Math.min(400, s.toolWear));

  return {
    machine_id,
    airTemperature: Number(s.airTemperature.toFixed(2)),
    processTemperature: Number(s.processTemperature.toFixed(2)),
    rotationalSpeed: Number(s.rotationalSpeed.toFixed(2)),
    torque: Number(s.torque.toFixed(2)),
    toolWear: Number(s.toolWear.toFixed(2)),
    mode: s.mode // 👁 bisa dipakai untuk debugging
  };
};

export const getMachineCount = () => MACHINE_COUNT;
