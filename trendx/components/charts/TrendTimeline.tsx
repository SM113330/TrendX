"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "08:00", engagement: 12000 },
  { time: "09:00", engagement: 28000 },
  { time: "10:00", engagement: 46000 },
  { time: "11:00", engagement: 72000 },
  { time: "12:00", engagement: 96000 },
  { time: "13:00", engagement: 128000 },
];

export default function TrendTimeline() {
  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
        TREND TIMELINE
      </p>

      <div className="mt-5 h-72 w-full min-w-0">
        
        <ResponsiveContainer width="100%" height={288}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.12)" />
            <XAxis dataKey="time" stroke="#67e8f9" />
            <YAxis stroke="#67e8f9" />
            <Tooltip
              contentStyle={{
                background: "#050507",
                border: "1px solid rgba(0,240,255,0.3)",
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.18}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}