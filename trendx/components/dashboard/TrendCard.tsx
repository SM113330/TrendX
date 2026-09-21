import Link from "next/link";
import { Trend } from "@/types/trend";

interface TrendCardProps {
  trend: Trend;
}

function createFallbackSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getTrendScore(trend: Trend) {
  if (typeof trend.score === "number") {
    return trend.score;
  }

  return Math.round(
    ((trend.engagement / 150000) * 100 * 0.4) +
      trend.velocity * 0.35 +
      trend.sentiment * 0.25
  );
}

export default function TrendCard({ trend }: TrendCardProps) {
  const hrefSlug = trend.slug ?? createFallbackSlug(trend.title);

  const badge =
    trend.direction === "rocket"
      ? "🚀 Exploding"
      : trend.direction === "up"
      ? "▲ Rising"
      : "▼ Cooling";

  const badgeColor =
    trend.direction === "rocket"
      ? "text-yellow-400"
      : trend.direction === "up"
      ? "text-green-400"
      : "text-red-400";

  return (
    <Link href={`/insight/${hrefSlug}`}>
      <div className="h-full cursor-pointer rounded-xl border border-cyan-400/20 bg-white/[0.03] p-5 transition hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="line-clamp-2 text-lg font-bold leading-snug">
              {trend.title}
            </h3>

            <p className={`mt-2 text-xs font-bold ${badgeColor}`}>
              {badge}
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-cyan-400/20 px-2 py-1 text-xs text-cyan-300">
            {trend.category}
          </span>
        </div>

        <div className="mt-5 flex justify-between border-b border-white/10 pb-3">
          <span className="text-gray-400">Trend Score</span>
          <span className="font-bold text-yellow-400">
            {getTrendScore(trend)}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Engagement</span>
            <span className="text-cyan-300">
              {trend.engagement.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Velocity</span>
            <span className={badgeColor}>{trend.velocity}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Sentiment</span>
            <span className="text-purple-300">{trend.sentiment}%</span>
          </div>

          {trend.source && (
            <div className="flex justify-between pt-2">
              <span className="text-gray-500">Source</span>
              <span className="max-w-32 truncate text-gray-400">
                {trend.source}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}