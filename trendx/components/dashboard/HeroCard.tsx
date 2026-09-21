"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

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

function statusLabel(trend: Trend) {
  if (trend.direction === "rocket") return "Exploding";
  if (trend.direction === "up") return "Rising";
  return "Cooling";
}

export default function HeroCard() {
  const [trend, setTrend] = useState<Trend | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getBackendTrends();
        if (!mounted || data.length === 0) return;

        const lead = [...data].sort((a, b) => b.score - a.score)[0];
        setTrend(lead);
      } catch (error) {
        console.error("Lead trend failed:", error);
      }
    }

    load();
    const interval = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!trend) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
        <p className="text-sm text-gray-500">Connecting to live trends…</p>
      </section>
    );
  }

  const slug = slugFor(trend);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 font-semibold text-green-300">
              Live
            </span>
            <span className="text-gray-500">{trend.category}</span>
            {trend.source && <span className="text-gray-500">• {trend.source}</span>}
          </div>

          <Link href={`/insight/${slug}`}>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white transition hover:text-cyan-200 sm:text-4xl lg:text-5xl">
              {trend.title}
            </h1>
          </Link>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
            {trend.summary ??
              "This topic is seeing strong live attention across current TRENDX signals."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/insight/${slug}`}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200"
            >
              View trend
            </Link>

            {trend.link && (
              <a
                href={trend.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                Original source
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {trend.image_url ? (
          <div className="relative min-h-64 overflow-hidden border-t border-white/10 bg-black/30 lg:min-h-full lg:border-l lg:border-t-0">
            <img
              src={trend.image_url}
              alt={trend.title}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                {trend.source ?? "Live source"}
              </p>
            </div>
          </div>
        ) : (
        <div className="border-t border-white/10 bg-black/20 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Live signal
          </p>

          <div className="mt-6 space-y-5">
            <Metric label="Trend score" value={trend.score} />
            <Metric label="Velocity" value={trend.velocity} suffix="%" />
            <Metric label="Sentiment" value={trend.sentiment} suffix="%" />
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm font-semibold text-white">{statusLabel(trend)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {trend.engagement.toLocaleString()} tracked signals
            </p>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-2xl font-black text-white">
          {value}
          {suffix}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-300"
          style={{ width: `${Math.max(3, Math.min(value, 100))}%` }}
        />
      </div>
    </div>
  );
}
