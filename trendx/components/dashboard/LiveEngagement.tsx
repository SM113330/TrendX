"use client";

import { useEffect, useMemo, useState } from "react";

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

  const stats = useMemo(() => {
    const signals = trends.reduce((sum, trend) => sum + trend.engagement, 0);
    const exploding = trends.filter((trend) => trend.direction === "rocket").length;
    const rising = trends.filter((trend) => trend.direction === "up").length;

    return {
      topics: trends.length,
      signals,
      exploding,
      rising,
    };
  }, [trends]);

  return (
    <section className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
      <Stat label="Live topics" value={String(stats.topics)} />
      <Stat label="Tracked signals" value={compact(stats.signals)} />
      <Stat label="Exploding" value={String(stats.exploding)} />
      <Stat label="Rising" value={String(stats.rising)} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0a0a0c] px-5 py-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
