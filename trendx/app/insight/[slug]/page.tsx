import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import InsightMomentumChart from "@/components/insight/InsightMomentumChart";
import CompareSelector from "@/components/insight/CompareSelector";
import { getBackendTrend } from "@/services/api";
import { trendDetails } from "@/lib/trendDetails";

interface InsightPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ScoreBreakdown {
  news_coverage?: number;
  momentum_strength?: number;
  youtube_strength?: number;
  media_velocity?: number;
  source_coverage?: number;
  public_engagement?: number;
}

interface PlatformMetrics {
  news?: number;
  youtube?: number;
  x?: number;
  instagram?: number;
}

interface TrendInsightDetail {
  id?: number;
  title?: string;
  slug?: string;
  category?: string;

  engagement?: number;
  velocity: number;
  sentiment: number;
  score: number;
  direction?: "rocket" | "up" | "down";

  momentum: number[];

  summary?: string;
  analysis?: string;

  source?: string;
  link?: string;

  score_breakdown?: ScoreBreakdown;
  platform_metrics?: PlatformMetrics;
}

const fallbackBreakdown: Required<
  Pick<
    ScoreBreakdown,
    "news_coverage" | "momentum_strength" | "youtube_strength" | "media_velocity"
  >
> = {
  news_coverage: 35,
  momentum_strength: 25,
  youtube_strength: 20,
  media_velocity: 15,
};

function formatTitle(slug: string) {
  return decodeURIComponent(slug)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCompact(value?: number) {
  if (!value || value <= 0) return "0";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;

  const fallbackTitle = formatTitle(slug);

  let detail: TrendInsightDetail;

  try {
    detail = (await getBackendTrend(slug)) as TrendInsightDetail;
  } catch {
    detail =
      (trendDetails[slug as keyof typeof trendDetails] as TrendInsightDetail) ??
      {
        title: fallbackTitle,
        category: "TRENDX",
        score: 75,
        velocity: 65,
        sentiment: 70,
        momentum: [25, 35, 45, 55, 62, 70],
        summary:
          "This topic is currently gaining attention across live news and social discovery signals.",
        analysis:
          "TRENDX is monitoring this topic using available momentum, engagement, platform activity, and sentiment signals.",
        source: "TRENDX",
        score_breakdown: fallbackBreakdown,
        platform_metrics: {
          news: 0,
          youtube: 0,
          x: 0,
          instagram: 0,
        },
      };
  }

  const pageTitle = detail.title ?? fallbackTitle;
  const breakdown = detail.score_breakdown ?? fallbackBreakdown;
  const platformMetrics = detail.platform_metrics ?? {};

  return (
    <main className="min-h-screen bg-[#050507] p-8 text-white">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 px-4 py-2 text-cyan-300 transition hover:bg-cyan-400/10"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <Navbar />
      </div>

      <p className="text-sm font-bold tracking-[0.3em] text-cyan-300">
        TREND INSIGHT
      </p>

      <h1 className="mt-4 max-w-6xl break-words text-4xl font-black leading-tight tracking-widest md:text-5xl">
        {pageTitle}
      </h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <span className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-400">
          Backend Live
        </span>

        {detail.category && (
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            {detail.category}
          </span>
        )}

        {detail.source && (
          <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm text-orange-300">
            {detail.source}
          </span>
        )}
      </div>

      {/* SCORE CARDS */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Trend Score"
          value={String(detail.score)}
          color="text-cyan-300"
        />

        <MetricCard
          label="Velocity"
          value={`${detail.velocity}%`}
          color="text-green-400"
        />

        <MetricCard
          label="Sentiment"
          value={`${detail.sentiment}%`}
          color="text-purple-300"
        />
      </div>

      {/* TREND GIST */}
      <section className="mt-8 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
        <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
          TREND GIST
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-gray-300">
          {detail.summary ??
            "This topic is currently gaining attention across live news and social discovery signals."}
        </p>

        {detail.link && (
          <a
            href={detail.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-xl border border-cyan-400/20 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-400/10"
          >
            Read Original →
          </a>
        )}
      </section>

      {/* AI ANALYSIS */}
      <section className="mt-8 rounded-2xl border border-purple-400/20 bg-white/[0.03] p-6">
        <h2 className="text-sm font-bold tracking-[0.25em] text-purple-300">
          AI ANALYSIS
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-gray-300">
          {detail.analysis ??
            "TRENDX is analyzing this topic using momentum, engagement, source coverage, YouTube activity, and sentiment signals."}
        </p>
      </section>

      {/* WHY TRENDING */}
      <section className="mt-8 rounded-2xl border border-amber-400/20 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold tracking-[0.25em] text-amber-300">
            WHY IS THIS TRENDING?
          </h2>

          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
            Score Engine V2
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <ScoreRow
            label="News Coverage"
            value={breakdown.news_coverage ?? fallbackBreakdown.news_coverage}
          />

          <ScoreRow
            label="Momentum Strength"
            value={
              breakdown.momentum_strength ??
              fallbackBreakdown.momentum_strength
            }
          />

          <ScoreRow
            label="YouTube Strength"
            value={
              breakdown.youtube_strength ??
              fallbackBreakdown.youtube_strength
            }
          />

          <ScoreRow
            label="Media Velocity"
            value={breakdown.media_velocity ?? fallbackBreakdown.media_velocity}
          />
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Total Trend Score</span>
            <span className="text-2xl font-black text-amber-300">
              {detail.score}
            </span>
          </div>
        </div>
      </section>

      {/* PLATFORM SIGNALS */}
      <section className="mt-8 rounded-2xl border border-green-400/20 bg-white/[0.03] p-6">
        <h2 className="text-sm font-bold tracking-[0.25em] text-green-300">
          PLATFORM SIGNALS
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SignalCard
            label="News"
            value={formatCompact(platformMetrics.news)}
          />

          <SignalCard
            label="YouTube"
            value={formatCompact(platformMetrics.youtube)}
          />

          <SignalCard label="X" value={formatCompact(platformMetrics.x)} />

          <SignalCard
            label="Instagram"
            value={formatCompact(platformMetrics.instagram)}
          />
        </div>
      </section>

      <div className="mt-8">
        <CompareSelector currentSlug={slug} />
      </div>

      <div className="mt-8">
        <InsightMomentumChart momentum={detail.momentum} />
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <p className="text-gray-400">{label}</p>

      <h2 className={`mt-2 text-4xl font-black ${color}`}>{value}</h2>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-gray-300">{label}</span>

      <span className="font-bold text-amber-300">+{value}</span>
    </div>
  );
}

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-black text-green-300">{value}</p>
    </div>
  );
}