import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function LiveChart({ points = [], label = "RPM", status = "NORMAL" }) {

  // 🔥 Dynamic color based on machine status
  const color =
    status === "CRITICAL" ? "rgba(255,0,0,0.9)" :
    status === "WARNING"  ? "rgba(255,200,0,0.9)" :
                            "rgba(0,200,120,0.9)";

  const data = {
    datasets: [
      {
        label,
        data: points,
        tension: 0.35,
        borderWidth: 1.8,
        borderColor: color,
        backgroundColor: color,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 120 },
    plugins: { legend: { display: false } },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { type: "time", ticks: { display: false }, grid: { display: false } },
      y: { ticks: { display: false }, grid: { display: false } }
    }
  };

  return (
    <div style={{ width: "100%", height: 60 }}>
      <Line data={data} options={options} />
    </div>
  );
}
