import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function MachineTrendChart({ machine }) {

  const [show, setShow] = useState({
    rpm:true, temp:false, proc:false, torque:false, wear:false,
  });

  const data = machine.chartPoints.map(p => ({
    time:new Date(p.x).toLocaleTimeString("id-ID",{minute:"2-digit",second:"2-digit"}),
    rpm:p.rpm, temp:p.temp, proc:p.proc, torque:p.torque, wear:p.wear
  }));

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <h3 className="font-bold mb-2">Machine {machine.machine_id} — Trend</h3>

      {/* === PARAMETER FILTER === */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {Object.keys(show).map(k=>(
          <label key={k} className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={show[k]} onChange={()=>setShow({...show,[k]:!show[k]})}/>
            {k.toUpperCase()}
          </label>
        ))}
      </div>

      {/* === CHART === */}
      <div style={{ width:"100%", height:230 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
            <XAxis dataKey="time" fontSize={10}/>
            <YAxis fontSize={10}/>
            <Tooltip/>
            <Legend/>

            {show.rpm &&   <Line dataKey="rpm"   stroke="#3b82f6" strokeWidth={2}/> }
            {show.temp &&  <Line dataKey="temp"  stroke="#f97316" strokeWidth={2}/> }
            {show.proc &&  <Line dataKey="proc"  stroke="#06b6d4" strokeWidth={2}/> }
            {show.torque &&<Line dataKey="torque"stroke="#22c55e" strokeWidth={2}/> }
            {show.wear &&  <Line dataKey="wear"  stroke="#a855f7" strokeWidth={2}/> }

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
