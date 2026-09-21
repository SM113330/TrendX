"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendTrends, getTrendingNow } from "@/services/api";
import { Trend } from "@/types/trend";

function getStatus(direction: Trend["direction"]) {
  if (direction === "rocket") {
    return {
      label: "🚀 Exploding",
      color: "text-yellow-400",
      glow: "bg-green-400",
    };
  }

  if (direction === "up") {
    return {
      label: "▲ Rising",
      color: "text-green-400",
      glow: "bg-cyan-300",
    };
  }

  return {
    label: "▼ Cooling",
    color: "text-red-400",
    glow: "bg-pink-400",
  };
}

const wave = [28, 44, 36, 58, 52, 76, 68, 88, 78, 96, 84, 100];

export default function TrendingNow() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [source, setSource] = useState<"backend" | "mock">("backend");

  useEffect(() => {
    async function loadTrends() {
      try {
        const data = await getBackendTrends();
        setTrends(data.slice(0, 5));
        setSource("backend");
      } catch (error) {
        console.error("Trending Now backend failed:", error);

        const fallback = getTrendingNow().map(([title, count], index) => ({
          id: index + 1,
          title,
          slug: title.replace("#", "").toLowerCase(),
          category: "Mock",
          engagement: Number(count.replace("K", "")) * 1000,
          velocity: 70,
          sentiment: 75,
          score: 75,
          direction: index === 0 ? "rocket" : "up",
        })) as Trend[];

        setTrends(fallback);
        setSource("mock");
      }
    }

    loadTrends();

    const interval = setInterval(loadTrends, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-2xl border border-purple-400/20 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold tracking-[0.25em] text-purple-300">
          TRENDING NOW
        </p>

        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            source === "backend"
              ? "border-green-400/20 bg-green-400/10 text-green-400"
              : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
          }`}
        >
          {source === "backend" ? "Live" : "Mock"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {trends.map((trend, index) => {
          const status = getStatus(trend.direction);

          return (
            <Link
              key={trend.slug ?? trend.id}
              href={`/insight/${trend.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              <p className="text-lg font-black text-cyan-300">
                0{index + 1}
              </p>

              <div>
                <p className="line-clamp-2 font-bold leading-snug">
                  {trend.title}
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <span className={`text-xs font-bold ${status.color}`}>
                    {status.label}
                  </span>

                  <span className="text-xs text-gray-500">
                    {trend.category}
                  </span>
                </div>

                <div className="mt-3 flex h-8 items-end gap-1">
                  {wave.map((height, i) => (
                    <div
                      key={i}
                      className={`${status.glow} w-1 rounded-full opacity-80 shadow-[0_0_10px_currentColor] transition group-hover:opacity-100`}
                      style={{
                        height: `${Math.max(height - index * 7, 18)}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-cyan-300">
                  {Math.round(trend.engagement / 1000)}K
                </p>
                <p className="text-xs text-gray-500">signals</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}