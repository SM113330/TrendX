"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getBackendTrends } from "@/services/api";
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

function statusFor(trend: Trend) {
  if (trend.direction === "rocket") return { label: "Exploding", className: "text-yellow-300" };
  if (trend.direction === "up") return { label: "Rising", className: "text-green-300" };
  return { label: "Cooling", className: "text-gray-400" };
}

export default function SearchableTrends() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getBackendTrends();
        if (!mounted) return;
        setTrends([...data].sort((a, b) => b.score - a.score));
        setError(false);
      } catch (loadError) {
        console.error("Trend board failed:", loadError);
        if (mounted) setError(true);
      }
    }

    load();
    const interval = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(trends.map((trend) => trend.category))).sort()],
    [trends]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return trends.filter((trend) => {
      const matchesQuery =
        q.length === 0 ||
        trend.title.toLowerCase().includes(q) ||
        trend.category.toLowerCase().includes(q) ||
        trend.source?.toLowerCase().includes(q);

      const matchesCategory = category === "All" || trend.category === category;

      return Boolean(matchesQuery && matchesCategory);
    });
  }, [trends, query, category]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Explore trends</h2>
            <p className="mt-1 text-sm text-gray-500">
              One ranked live feed. No repeated cards.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 xl:w-80">
            <Search size={16} className="text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && trends.length === 0 ? (
        <div className="p-6 text-sm text-red-300">Live trends are temporarily unavailable.</div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No matching live trends.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {filtered.map((trend, index) => {
            const status = statusFor(trend);

            return (
              <Link
                key={trend.slug ?? trend.id}
                href={`/insight/${slugFor(trend)}`}
                className="grid gap-3 px-5 py-5 transition hover:bg-white/[0.035] sm:grid-cols-[44px_1fr_auto] sm:items-center sm:px-6"
              >
                <div className="text-sm font-bold text-gray-600">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="line-clamp-2 font-bold text-white">{trend.title}</h3>
                    <span className={`text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{trend.category}</span>
                    {trend.source && <span>• {trend.source}</span>}
                    <span>• {trend.engagement.toLocaleString()} signals</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 text-right text-xs sm:min-w-56">
                  <MiniMetric label="Score" value={String(trend.score)} />
                  <MiniMetric label="Velocity" value={`${trend.velocity}%`} />
                  <MiniMetric label="Sentiment" value={`${trend.sentiment}%`} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-600">{label}</p>
      <p className="mt-1 font-bold text-gray-200">{value}</p>
    </div>
  );
}
