"use client";

import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(requestedCategory ?? "All");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCategory(requestedCategory ?? "All");
  }, [requestedCategory]);

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
    <section id="explore" className="scroll-mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Explore trends</h2>
            <p className="mt-1 text-sm text-gray-500">
              One ranked live feed. Open any story for the full signal view.
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
        <div className="p-6 text-sm text-gray-500">
          No live trends in this category right now. Try All.
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {filtered.map((trend, index) => {
            const status = statusFor(trend);

            return (
              <div
                key={trend.slug ?? trend.id}
                className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.035] sm:grid-cols-[96px_1fr_auto] sm:items-center sm:px-6"
              >
                <Link href={`/insight/${slugFor(trend)}`} className="block">
                  {trend.image_url ? (
                    <img
                      src={trend.image_url}
                      alt=""
                      loading="lazy"
                      className="h-16 w-24 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 text-xs font-bold text-gray-600">
                      TX
                    </div>
                  )}
                </Link>

                <div className="min-w-0">
                  <Link href={`/insight/${slugFor(trend)}`} className="block">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="line-clamp-2 font-bold text-white transition hover:text-cyan-200">
                        {trend.title}
                      </h3>
                      <span className={`text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => setCategory(trend.category)}
                      className="rounded bg-white/[0.05] px-2 py-1 transition hover:bg-white/[0.1] hover:text-white"
                    >
                      {trend.category}
                    </button>

                    {trend.source && <span>{trend.source}</span>}
                    <span>• {trend.engagement.toLocaleString()} signals</span>

                    {trend.link && (
                      <a
                        href={trend.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gray-400 transition hover:text-cyan-300"
                      >
                        Source <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                <Link
                  href={`/insight/${slugFor(trend)}`}
                  className="grid grid-cols-3 gap-5 text-right text-xs sm:min-w-56"
                >
                  <MiniMetric label="Score" value={String(trend.score)} />
                  <MiniMetric label="Velocity" value={`${trend.velocity}%`} />
                  <MiniMetric label="Sentiment" value={`${trend.sentiment}%`} />
                </Link>
              </div>
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
