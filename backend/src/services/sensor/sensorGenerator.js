const MACHINE_COUNT = 5;

// Simpan state tiap mesin agar sensor bergerak smooth
const machineStates = {};

for (let i = 1; i <= MACHINE_COUNT; i++) {
  machineStates[i] = {
    airTemperature: 70 + Math.random() * 10,
    processTemperature: 80 + Math.random() * 10,
    rotationalSpeed: 1200 + Math.random() * 200,
    torque: 35 + Math.random() * 10,
    toolWear: 0
  };
}

const noise = () => Math.random() * 2 - 1;

export const generateSensorForMachine = (machine_id) => {
  const s = machineStates[machine_id];

  s.airTemperature += noise();
  s.processTemperature += noise();
  s.rotationalSpeed += noise() * 5;
  s.torque += noise();
  s.toolWear += Math.abs(noise() * 0.2);

  return {
    machine_id,
    airTemperature: Number(s.airTemperature.toFixed(2)),
    processTemperature: Number(s.processTemperature.toFixed(2)),
    rotationalSpeed: Number(s.rotationalSpeed.toFixed(2)),
    torque: Number(s.torque.toFixed(2)),
    toolWear: Number(s.toolWear.toFixed(2))
  };
};

export const getMachineCount = () => MACHINE_COUNT;
