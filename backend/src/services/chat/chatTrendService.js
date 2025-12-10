import { getMachineTrend } from "../../services/sensor/sensorService.js";

// Smart extractor waktu → mendukung: 2m, 2 m, 2min, 2 menit, 2mnt, 2 minutes, 2mins
function extractRange(text) {
  const format = text.toLowerCase();

  //============== MENIT ==============//
  if (/(\d+)\s*(m|menit|min|mnt|minutes|mins)/i.test(format)) {
    return format.match(/(\d+)/)[1] + "m"; // output → "2m"
  }

  //============== JAM ==============//
  if (/(\d+)\s*(j|jam|hours|hour|h)/i.test(format)) {
    return format.match(/(\d+)/)[1] + "h"; // output → "2h"
  }

  //============== HARI ==============//
  if (/(\d+)\s*(d|hari|day|days)/i.test(format)) {
    return format.match(/(\d+)/)[1] + "d"; // output → "2d"
  }

  return "24h"; // fallback aman
}

export async function getTrendResponse(message, match) {
  if (!match || !/trend|tren|history|riwayat|grafik|perubahan/i.test(message)) return null;

  const id = Number(match[1]);
  const range = extractRange(message);

  try {
    const trendResult = await getMachineTrend(id, range);
    const rows = trendResult.rows || trendResult;

    if (!rows || rows.length === 0) {
      return `### 📊 Trend Mesin ${id} — **Tidak ada data (${range})**`;
    }

    const list = rows.map(
      t => `• ${t.created_at} → Temp:${t.air_temperature}°C | Proc:${t.process_temperature}°C | RPM:${t.rotational_speed} | Tq:${t.torque} | Wear:${t.tool_wear}`
    ).join("\n");

    return `
### 📊 Ringkasan Tren Mesin ${id}
Range: **${range}**

### 📄 Tabel Tren Parameter
\`\`\`markdown
${formatTrendTable(rows)}
\`\`\`

### 🔍 Detail Log Tren
${list}

`; // <── tabel finally active!
  } catch (err) {
    console.error("TREND ERROR:", err);
    return `### 🚨 Gagal memuat trend Mesin ${id} (range ${range})`;
  }
}


export function formatTrendTable(rows) {
  if (!rows || rows.length < 2) return null;

  const first = rows[0];
  const last = rows[rows.length - 1];

  const diff = (a, b) => (b - a).toFixed(2);
  const trend = (a, b) => b > a ? "↑" : b < a ? "↓" : "Stabil";

  return `
| Parameter | Nilai Awal | Nilai Akhir | Perubahan | Arah Tren |
|----------|------------|-------------|-----------|-----------|
| Temp     | ${first.air_temperature} | ${last.air_temperature} | ${diff(first.air_temperature,last.air_temperature)} | ${trend(first.air_temperature,last.air_temperature)} |
| ProcTemp | ${first.process_temperature} | ${last.process_temperature} | ${diff(first.process_temperature,last.process_temperature)} | ${trend(first.process_temperature,last.process_temperature)} |
| RPM      | ${first.rotational_speed} | ${last.rotational_speed} | ${diff(first.rotational_speed,last.rotational_speed)} | ${trend(first.rotational_speed,last.rotational_speed)} |
| Torque   | ${first.torque} | ${last.torque} | ${diff(first.torque,last.torque)} | ${trend(first.torque,last.torque)} |
| Wear     | ${first.tool_wear} | ${last.tool_wear} | ${diff(first.tool_wear,last.tool_wear)} | ${trend(first.tool_wear,last.tool_wear)} |
`;
}

