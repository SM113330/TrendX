"use client";

import { useEffect, useState } from "react";
import TrendCard from "./TrendCard";
import { Trend } from "@/types/trend";
import { getBackendTrends, getLiveTrendFeed } from "@/services/api";

export default function TrendFeed() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [source, setSource] = useState<"backend" | "mock">("backend");

  useEffect(() => {
    async function loadTrends() {
      try {
        const data = await getBackendTrends();
        setTrends(data);
        setSource("backend");
      } catch (error) {
        console.error("Backend failed. Falling back to mock data.", error);
        setTrends(getLiveTrendFeed());
        setSource("mock");
      }
    }

    loadTrends();

    const interval = setInterval(() => {
      loadTrends();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
          TREND FEED
        </h2>

        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            source === "backend"
              ? "border-green-400/20 bg-green-400/10 text-green-400"
              : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
          }`}
        >
          {source === "backend" ? "Backend Live" : "Mock Fallback"}
        </span>
      </div>

      {trends.length === 0 ? (
        <div className="rounded-xl border border-cyan-400/20 bg-black/40 p-5 text-cyan-300">
          Loading trends from TRENDX API...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </section>
  );
}