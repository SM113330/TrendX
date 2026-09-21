"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getBackendTrends, getLiveTrendFeed } from "@/services/api";
import { Trend } from "@/types/trend";

function slugFor(trend: Trend) {
  if (trend.slug) return trend.slug;

  return trend.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function MomentumEngine() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [source, setSource] = useState<"backend" | "mock">("backend");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const live = await getBackendTrends();
        if (!mounted) return;
        setTrends(live);
        setSource("backend");
      } catch (error) {
        console.error("Momentum feed failed:", error);
        if (!mounted) return;
        setTrends(getLiveTrendFeed());
        setSource("mock");
      }
    }

    load();
    const interval = window.setInterval(load, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const groups = useMemo(
    () => ({
      exploding: trends
        .filter((trend) => trend.direction === "rocket")
        .sort((a, b) => b.score - a.score),
      rising: trends
        .filter((trend) => trend.direction === "up")
        .sort((a, b) => b.score - a.score),
      cooling: trends
        .filter((trend) => trend.direction === "down")
        .sort((a, b) => b.score - a.score),
    }),
    [trends]
  );

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
            MOMENTUM ENGINE
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Ranked by current velocity and TRENDX score.
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            source === "backend"
              ? "border-green-400/20 bg-green-400/10 text-green-400"
              : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
          }`}
        >
          {source === "backend" ? "Live Signals" : "Fallback Signals"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MomentumColumn
          title="EXPLODING"
          color="text-yellow-400"
          trends={groups.exploding}
        />
        <MomentumColumn
          title="RISING"
          color="text-green-400"
          trends={groups.rising}
        />
        <MomentumColumn
          title="COOLING"
          color="text-red-400"
          trends={groups.cooling}
        />
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
        <p className="text-sm text-gray-500">No current signals</p>
      ) : (
        <div className="space-y-3">
          {trends.slice(0, 5).map((trend) => (
            <Link
              key={trend.slug ?? trend.id}
              href={`/insight/${slugFor(trend)}`}
              className="block border-b border-white/10 pb-3 transition hover:opacity-80"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="line-clamp-1 font-bold">{trend.title}</p>
                <p className={`shrink-0 ${color}`}>{trend.velocity}%</p>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${Math.max(4, Math.min(trend.velocity, 100))}%` }}
                />
              </div>

              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Sentiment {trend.sentiment}%</span>
                <span>Score {trend.score}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
