"use client";

import { useEffect, useState } from "react";
import { Trend } from "@/types/trend";
import { getLiveTrendFeed } from "@/services/api";

export default function MomentumEngine() {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    setTrends(getLiveTrendFeed());

    const interval = setInterval(() => {
      setTrends(getLiveTrendFeed());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const rising = trends.filter((trend) => trend.direction === "up");
  const exploding = trends.filter((trend) => trend.direction === "rocket");
  const cooling = trends.filter((trend) => trend.direction === "down");

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-bold tracking-[0.25em] text-cyan-300">
        MOMENTUM ENGINE
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <MomentumColumn title="EXPLODING" color="text-yellow-400" trends={exploding} />
        <MomentumColumn title="RISING" color="text-green-400" trends={rising} />
        <MomentumColumn title="COOLING" color="text-red-400" trends={cooling} />
      </div>
    </section>
  );
}

function MomentumColumn({
  title,
  color,
  trends,
}: {
  title: string;
  color: string;
  trends: Trend[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className={`mb-4 text-sm font-bold tracking-[0.2em] ${color}`}>
        {title}
      </p>

      {trends.length === 0 ? (
        <p className="text-sm text-gray-500">No signals</p>
      ) : (
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.id} className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <p className="font-bold">{trend.title}</p>
                <p className={color}>{trend.velocity}%</p>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${trend.velocity}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Sentiment {trend.sentiment}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}