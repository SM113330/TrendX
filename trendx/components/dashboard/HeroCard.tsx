"use client";

import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

function fallbackSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getHeroLabel(trend: Trend) {
  if (trend.direction === "rocket") return "LIVE TREND EXPLODING";
  if (trend.direction === "up") return "LIVE TREND RISING";
  return "LIVE TREND COOLING";
}

function shortText(text?: string) {
  if (!text) {
    return "This live topic is gaining attention across news and social discovery signals.";
  }

  return text.length > 220 ? `${text.slice(0, 220)}...` : text;
}

function shortTitle(title: string) {
  return title.length > 90 ? `${title.slice(0, 90)}...` : title;
}

export default function HeroCard() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [index, setIndex] = useState(0);
  const [source, setSource] = useState<"backend" | "mock">("backend");

  useEffect(() => {
    async function loadHeroTrends() {
      try {
        const data = await getBackendTrends();
        setTrends(data.slice(0, 5));
        setSource("backend");
      } catch (error) {
        console.error("Hero live backend failed:", error);
        setSource("mock");
      }
    }

    loadHeroTrends();

    const refresh = setInterval(loadHeroTrends, 15000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (trends.length === 0) return;

    const rotate = setInterval(() => {
      setIndex((current) => (current + 1) % trends.length);
    }, 8000);

    return () => clearInterval(rotate);
  }, [trends.length]);

  const active = trends[index];

  if (!active) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-8 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,240,255,0.18),transparent_35%)]" />

        <div className="relative z-10">
          <p className="mb-3 text-sm font-bold tracking-[0.35em] text-cyan-300">
            LIVE TREND SPOTLIGHT
          </p>

          <h2 className="text-5xl font-black tracking-widest text-yellow-400">
            LOADING LIVE SIGNALS
          </h2>

          <p className="mt-5 max-w-md text-sm leading-6 text-gray-300">
            TRENDX is connecting to the live news intelligence backend.
          </p>
        </div>
      </section>
    );
  }

  const slug = active.slug ?? fallbackSlug(active.title);
  const heroTitle = shortTitle(active.title);
  const related = trends.filter((trend) => trend.id !== active.id).slice(0, 5);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-8 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,240,255,0.18),transparent_35%)]" />

      {active.image_url && (
        <>
          <img
            src={active.image_url}
            alt={active.title}
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/85 to-transparent" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <p className="mb-3 text-sm font-bold tracking-[0.35em] text-cyan-300">
            {getHeroLabel(active)}
          </p>

          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              source === "backend"
                ? "border-green-400/20 bg-green-400/10 text-green-400"
                : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
            }`}
          >
            {source === "backend" ? "Backend Live" : "Mock"}
          </span>
        </div>

        <Link href={`/insight/${slug}`}>
          <h2 className="max-w-4xl cursor-pointer break-words text-3xl font-black leading-tight tracking-wide text-cyan-300 transition hover:text-cyan-200 md:text-4xl">
            {heroTitle.toUpperCase()}
          </h2>
        </Link>

        <p className="mt-3 text-lg tracking-[0.25em] text-orange-300">
          {active.category}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-cyan-400/20 px-3 py-1 text-xs text-cyan-300">
            Score {active.score}
          </span>

          <span className="rounded-full border border-green-400/20 px-3 py-1 text-xs text-green-400">
            Velocity {active.velocity}%
          </span>

          <span className="rounded-full border border-purple-400/20 px-3 py-1 text-xs text-purple-300">
            Sentiment {active.sentiment}%
          </span>

          {active.source && (
            <span className="rounded-full border border-orange-400/20 px-3 py-1 text-xs text-orange-300">
              {active.source}
            </span>
          )}
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-300">
          {shortText(active.summary)}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href={`/insight/${slug}`}
            className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-bold text-black shadow-[0_0_25px_rgba(0,240,255,0.45)]"
          >
            Track Trend
          </Link>

          {active.link ? (
            <a
              href={active.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 px-5 py-3 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
            >
              <ExternalLink size={16} />
              Read Original
            </a>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                active.title
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 px-5 py-3 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
            >
              <Play size={16} />
              Watch Related
            </a>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {trends.map((trend, trendIndex) => (
            <button
              key={trend.slug ?? trend.id}
              onClick={() => setIndex(trendIndex)}
              className={`h-2 rounded-full transition-all ${
                index === trendIndex
                  ? "w-8 bg-cyan-400"
                  : "w-2 bg-white/20 hover:bg-cyan-400/60"
              }`}
            />
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-300">
            RELATED NOW
          </p>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {related.map((item) => {
              const itemSlug = item.slug ?? fallbackSlug(item.title);

              return (
                <Link
                  key={itemSlug}
                  href={`/insight/${itemSlug}`}
                  className="min-w-44 rounded-xl border border-cyan-400/20 bg-black/40 p-3 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="mb-3 h-28 w-full rounded-lg object-cover opacity-85"
                    />
                  ) : (
                    <div className="mb-3 h-28 rounded-lg bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
                  )}

                  <p className="line-clamp-2 text-sm font-bold leading-tight">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Score {item.score} · {item.category}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}