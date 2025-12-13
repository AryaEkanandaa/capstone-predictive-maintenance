import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity } from "lucide-react";

export default function TrendCard({ title, data, color }) {

  // EMPTY STATE
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Activity className="w-4 h-4" />
          {title}
        </div>

        <p className="text-xs text-gray-500">
          Belum ada data tren untuk ditampilkan.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <Activity className="w-4 h-4" />
        {title}
      </div>

      {/* CHART */}
      <div className="w-full h-[180px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="x" hide />
            <YAxis hide />

            <Tooltip
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
              labelFormatter={() => "Waktu"}
              formatter={(value) => [`${value}`, "Nilai"]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
