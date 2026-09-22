"use client";

import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { getBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

function slugFor(trend: Trend) {
  if (trend.slug) return trend.slug;
  return trend.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export default function HeroCard() {
  const [trend, setTrend] = useState<Trend | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getBackendTrends();
        if (!mounted || data.length === 0) return;
        setTrend([...data].sort((a, b) => b.score - a.score)[0]);
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
    return <section className="h-80 animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />;
  }

  const slug = slugFor(trend);

  return (
    <section className="group relative min-h-[470px] overflow-hidden rounded-[26px] border border-white/10 bg-[#0a0a0d] sm:min-h-[520px]">
      {trend.image_url ? (
        <img
          src={trend.image_url}
          alt={trend.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.20),transparent_32%),#0a0a0d]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/65 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 font-bold text-cyan-200 backdrop-blur-xl">
            <Zap size={12} />
            LIVE
          </span>
          <span className="rounded-full bg-black/40 px-3 py-1.5 text-white/80 backdrop-blur-xl">{trend.category}</span>
          {trend.source && <span className="text-white/60">{trend.source}</span>}
        </div>

        <Link href={`/insight/${slug}`}>
          <h1 className="max-w-4xl text-[2rem] font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {trend.title}
          </h1>
        </Link>

        <p className="mt-4 max-w-3xl line-clamp-4 text-sm leading-6 text-white/72 sm:line-clamp-3 sm:text-base sm:leading-7">
          {trend.article_summary || trend.summary || "Open this story for the latest verified details."}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/insight/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition active:scale-[0.98]"
          >
            Open story
            <ArrowUpRight size={15} />
          </Link>

          <div className="rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-xs text-white/70 backdrop-blur-xl">
            Score <span className="ml-1 font-black text-white">{trend.score}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
