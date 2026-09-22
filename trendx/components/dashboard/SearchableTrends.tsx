"use client";

import Link from "next/link";
import { Globe2, MessageCircleMore, Search, Play, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

type PlatformMode = "overall" | "google" | "youtube" | "x" | "facebook";

const modes: Array<{
  id: PlatformMode;
  label: string;
  icon: typeof Search;
  connected: boolean;
}> = [
  { id: "overall", label: "Overall", icon: Globe2, connected: true },
  { id: "google", label: "Google", icon: Search, connected: true },
  { id: "youtube", label: "YouTube", icon: Play, connected: true },
  { id: "x", label: "X", icon: MessageCircleMore, connected: false },
  { id: "facebook", label: "Facebook", icon: Globe2, connected: false },
];

function slugFor(trend: Trend) {
  if (trend.slug) return trend.slug;
  return trend.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function statusFor(trend: Trend) {
  if (trend.direction === "rocket") return { label: "Exploding", className: "text-amber-300" };
  if (trend.direction === "up") return { label: "Rising", className: "text-emerald-300" };
  return { label: "Cooling", className: "text-gray-400" };
}

function rankValue(trend: Trend, mode: PlatformMode) {
  if (mode === "google") {
    return trend.platform_metrics?.news ?? 0;
  }

  if (mode === "youtube") {
    return trend.platform_metrics?.youtube ?? 0;
  }

  return trend.score * 0.6 + trend.velocity * 0.4;
}

function compact(value?: number) {
  if (!value || value <= 0) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export default function SearchableTrends() {
  const searchParams = useSearchParams();
  const requestedPlatform = (searchParams.get("platform") ?? "overall") as PlatformMode;
  const activeMode = modes.some((mode) => mode.id === requestedPlatform)
    ? requestedPlatform
    : "overall";

  const [query, setQuery] = useState("");
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

  const selectedMode = modes.find((mode) => mode.id === activeMode) ?? modes[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return trends
      .filter((trend) =>
        q.length === 0 ||
        trend.title.toLowerCase().includes(q) ||
        trend.category.toLowerCase().includes(q) ||
        trend.source?.toLowerCase().includes(q)
      )
      .sort((a, b) => rankValue(b, activeMode) - rankValue(a, activeMode));
  }, [trends, query, activeMode]);

  return (
    <section id="explore" className="scroll-mt-4">
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
            Platform pulse
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">
            Trending on {selectedMode.label}
          </h2>
        </div>

        {selectedMode.connected && (
          <span className="text-xs text-gray-600">{filtered.length} stories</span>
        )}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-3 sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const active = mode.id === activeMode;

            return (
              <Link
                key={mode.id}
                href={`/?platform=${mode.id}#explore`}
                className={`inline-flex whitespace-nowrap items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-cyan-300 text-black shadow-[0_0_20px_rgba(103,232,249,0.18)]"
                    : "border border-white/10 bg-white/[0.025] text-gray-400"
                }`}
              >
                <Icon size={14} />
                {mode.label}
                {!mode.connected && (
                  <span className="rounded bg-black/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {!selectedMode.connected ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                Live source not connected
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                {selectedMode.label} trends will appear here when a genuine live source is connected.
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                TrendX will not manufacture platform rankings from proxy numbers. Until a reliable source is connected, this view stays transparent.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
              <Search size={16} className="text-gray-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${selectedMode.label.toLowerCase()} trends`}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-600"
              />
            </div>

            {error && trends.length === 0 ? (
              <div className="p-6 text-sm text-red-300">Live trends are temporarily unavailable.</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No live trends match this search.</div>
            ) : (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {filtered.map((trend, index) => {
                  const status = statusFor(trend);
                  const slug = slugFor(trend);
                  const platformSignal =
                    activeMode === "youtube"
                      ? compact(trend.platform_metrics?.youtube)
                      : activeMode === "google"
                        ? compact(trend.platform_metrics?.news)
                        : null;

                  return (
                    <Link
                      key={trend.slug ?? trend.id}
                      href={`/insight/${slug}`}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0d] transition active:scale-[0.995] sm:grid sm:grid-cols-[150px_1fr]"
                    >
                      <div className="relative h-44 overflow-hidden sm:h-full">
                        {trend.image_url ? (
                          <img
                            src={trend.image_url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.18),transparent_30%),#101014]" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent sm:bg-gradient-to-r" />
                        <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`inline-flex items-center gap-1 font-bold ${status.className}`}>
                            <Zap size={11} />
                            {status.label}
                          </span>
                          <span className="text-gray-600">{trend.category}</span>
                        </div>

                        <h3 className="mt-2 line-clamp-3 text-base font-black leading-snug text-white">
                          {trend.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                          {trend.article_summary || trend.summary || trend.source}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-600">
                          <span className="max-w-[48%] truncate">{trend.source}</span>

                          <div className="flex gap-3">
                            {platformSignal ? (
                              <span>
                                Signal <b className="text-gray-300">{platformSignal}</b>
                              </span>
                            ) : (
                              <>
                                <span>Score <b className="text-gray-300">{trend.score}</b></span>
                                <span>Vel <b className="text-gray-300">{trend.velocity}%</b></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
