"use client";

import { useEffect, useMemo, useState } from "react";

import TrendCard from "./TrendCard";
import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

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
        setTrends(data);
        setError(false);
      } catch (loadError) {
        console.error("Searchable trends failed:", loadError);
        if (!mounted) return;
        setError(true);
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
    () => [
      "All",
      ...Array.from(new Set(trends.map((trend) => trend.category))).sort(),
    ],
    [trends]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return trends.filter((trend) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        trend.title.toLowerCase().includes(normalizedQuery) ||
        trend.category.toLowerCase().includes(normalizedQuery) ||
        trend.source?.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        category === "All" || trend.category === category;

      return Boolean(matchesSearch && matchesCategory);
    });
  }, [trends, query, category]);

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
            SEARCH LIVE TRENDS
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Filter the current TRENDX feed by topic, category, or source.
          </p>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search live topics..."
          className="w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-gray-500 lg:w-96"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              category === item
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 text-gray-400 hover:border-cyan-400/30 hover:text-cyan-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && trends.length === 0 ? (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-200">
          Live search is temporarily unavailable. The rest of TRENDX will keep retrying automatically.
        </div>
      ) : trends.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-gray-400">
          Loading live trends...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((trend) => (
              <TrendCard key={trend.slug ?? trend.id} trend={trend} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-6 text-sm text-gray-500">
              No current trend matches this search.
            </p>
          )}
        </>
      )}
    </section>
  );
}
