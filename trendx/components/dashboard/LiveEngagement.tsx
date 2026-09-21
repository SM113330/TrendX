"use client";

import { useEffect, useMemo, useState } from "react";
import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

function sumMetric(trends: Trend[], key: "news" | "youtube" | "x" | "instagram") {
  return trends.reduce(
    (sum, trend) => sum + (trend.platform_metrics?.[key] ?? 0),
    0
  );
}

function formatCompact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  return `${(value / 1000).toFixed(1)}K`;
}

export default function LiveEngagement() {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      const data = await getBackendTrends();
      setTrends(data);
    }

    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const news = sumMetric(trends, "news");
    const youtube = sumMetric(trends, "youtube");
    const x = sumMetric(trends, "x");
    const instagram = sumMetric(trends, "instagram");

    const total = news + youtube + x + instagram;

    return {
      news,
      youtube,
      x,
      instagram,
      total,
      topics: trends.length,
      exploding: trends.filter((trend) => trend.direction === "rocket").length,
      rising: trends.filter((trend) => trend.direction === "up").length,
      cooling: trends.filter((trend) => trend.direction === "down").length,
    };
  }, [trends]);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
          LIVE ENGAGEMENT
        </p>

        <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-400">
          Backend Live
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <PlatformCard label="News" value={metrics.news} />
        <PlatformCard label="YouTube" value={metrics.youtube} />
        <PlatformCard label="X" value={metrics.x} />
        <PlatformCard label="Instagram" value={metrics.instagram} />
      </div>

      <div className="mt-6 rounded-xl border border-green-400/20 bg-green-400/5 p-4">
        <p className="text-sm text-gray-400">Total Cross-Platform Signals</p>

        <h3 className="mt-1 text-3xl font-black">
          {formatCompact(metrics.total)}
          <span className="ml-2 text-sm text-green-400">LIVE</span>
        </h3>
      </div>

      <div className="mt-6 flex-1 rounded-xl border border-cyan-400/20 bg-black/40 p-5">
        <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
          PLATFORM MOMENTUM
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Metric label="Topics Tracked" value={metrics.topics} />
          <Metric label="Exploding" value={metrics.exploding} />
          <Metric label="Rising" value={metrics.rising} />
          <Metric label="Cooling" value={metrics.cooling} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs text-gray-500">Signal Distribution</p>

          <div className="flex h-16 items-end gap-2">
            {[
              metrics.news,
              metrics.youtube,
              metrics.x,
              metrics.instagram,
            ].map((value, index) => {
              const maxValue = Math.max(
                metrics.news,
                metrics.youtube,
                metrics.x,
                metrics.instagram,
                1
              );

              const height = Math.max((value / maxValue) * 100, 18);

              const gradient =
                index === 0
                  ? "from-cyan-400 via-blue-400 to-purple-500"
                  : index === 1
                  ? "from-red-400 via-pink-500 to-orange-400"
                  : index === 2
                  ? "from-gray-300 via-cyan-300 to-blue-400"
                  : "from-purple-400 via-pink-500 to-orange-400";

              return (
                <div
                  key={index}
                  className={`w-full rounded-t bg-gradient-to-t ${gradient} shadow-[0_0_14px_rgba(0,240,255,0.5)]`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[10px] text-gray-500">
            <span>News</span>
            <span>YouTube</span>
            <span>X</span>
            <span>Instagram</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-cyan-400/10 bg-black/40 p-4">
      <p className="text-xs text-gray-400">{label}</p>

      <h3 className="mt-3 text-2xl font-bold text-cyan-300">
        {formatCompact(value)}
      </h3>

      <div className="mt-4 h-20 rounded bg-gradient-to-t from-cyan-500/40 to-transparent" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-cyan-300">{value}</p>
    </div>
  );
}