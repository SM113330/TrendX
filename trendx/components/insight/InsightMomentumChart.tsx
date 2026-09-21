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

interface InsightMomentumChartProps {
  momentum: number[];
}

export default function InsightMomentumChart({
  momentum,
}: InsightMomentumChartProps) {
  const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  const data = momentum.map((score, index) => ({
    time: labels[index],
    score,
  }));

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
        24H MOMENTUM
      </h2>

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
              dataKey="score"
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