import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { getBackendTrend } from "@/services/api";
import { Trend } from "@/types/trend";
import LiveReactions from "@/components/insight/LiveReactions";

interface InsightPageProps {
  params: Promise<{ slug: string }>;
}

function formatTitle(slug: string) {
  return decodeURIComponent(slug)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function compact(value?: number) {
  if (!value || value <= 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const fallbackTitle = formatTitle(slug);

  let detail: Trend;

  try {
    detail = await getBackendTrend(slug);
  } catch {
    detail = {
      id: 0,
      title: fallbackTitle,
      category: "TRENDX",
      engagement: 0,
      velocity: 0,
      sentiment: 0,
      score: 0,
      direction: "up",
      summary: "This story is temporarily unavailable from the live source.",
      key_points: [],
      public_reactions: [],
    };
  }

  const summary =
    detail.article_summary ||
    detail.summary ||
    "The publisher summary is not available for this story yet.";

  const points = detail.key_points ?? [];
  const reactions = detail.public_reactions ?? [];

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to trends
        </Link>

        <Navbar />

        <article className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {detail.image_url && (
            <div className="relative h-64 overflow-hidden border-b border-white/10 sm:h-80 lg:h-[420px]">
              <img
                src={detail.image_url}
                alt={detail.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
            </div>
          )}

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-gray-300">
                  {detail.category}
                </span>
                {detail.source && <span>{detail.source}</span>}
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {detail.title}
              </h1>

              <section className="mt-8">
                <h2 className="text-lg font-black text-white">What happened</h2>
                <p className="mt-3 max-w-3xl text-base leading-8 text-gray-300">
                  {summary}
                </p>
              </section>

              {points.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-lg font-black text-white">Key points</h2>
                  <div className="mt-4 space-y-3">
                    {points.map((point, index) => (
                      <div
                        key={`${index}-${point.slice(0, 20)}`}
                        className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <span className="mt-0.5 text-sm font-bold text-cyan-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="leading-7 text-gray-300">{point}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {detail.link && (
                <a
                  href={detail.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200"
                >
                  Read original
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Trend activity
                </p>

                <div className="mt-5 space-y-4">
                  <Activity label="Trend score" value={String(detail.score)} />
                  <Activity label="Velocity" value={`${detail.velocity}%`} />
                  <Activity label="Tracked signals" value={compact(detail.engagement)} />
                </div>
              </div>

              <LiveReactions reactions={reactions} />
            </aside>
          </div>
        </article>

      </div>
    </main>
  );
}

function Activity({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
