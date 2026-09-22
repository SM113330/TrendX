"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Flame, Radio, TrendingUp } from "lucide-react";

import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export default function LiveEngagement() {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getBackendTrends();
        if (mounted) setTrends(data);
      } catch (error) {
        console.error("Pulse metrics failed:", error);
      }
    }

    load();
    const interval = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => ({
    topics: trends.length,
    signals: trends.reduce((sum, trend) => sum + trend.engagement, 0),
    exploding: trends.filter((trend) => trend.direction === "rocket").length,
    rising: trends.filter((trend) => trend.direction === "up").length,
  }), [trends]);

  const cards = [
    { label: "Live topics", value: String(stats.topics), icon: Radio },
    { label: "Signals", value: compact(stats.signals), icon: Activity },
    { label: "Exploding", value: String(stats.exploding), icon: Flame },
    { label: "Rising", value: String(stats.rising), icon: TrendingUp },
  ];

  return (
    <section className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="min-w-[136px] flex-1 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-500">{card.label}</p>
              <Icon size={14} className="text-cyan-300/80" />
            </div>
            <p className="mt-2 text-xl font-black text-white">{card.value}</p>
          </div>
        );
      })}
    </section>
  );
}
