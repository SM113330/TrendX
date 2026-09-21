import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import { getBackendRegion } from "@/services/api";

interface RegionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const region = await getBackendRegion(slug);

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
        REGIONAL INTELLIGENCE
      </p>

      <h1 className="mt-4 text-5xl font-black tracking-widest">
        {region.name.toUpperCase()}
      </h1>

      <div className="mt-4 inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-400">
        Backend Live
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Region Score"
          value={String(region.score)}
          color="text-cyan-300"
        />

        <MetricCard
          label="Sentiment"
          value={`${region.sentiment}%`}
          color="text-green-400"
        />

        <MetricCard
          label="Velocity"
          value={`${region.velocity}%`}
          color="text-purple-300"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
          <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
            TOP CATEGORIES
          </h2>

          <div className="mt-6 space-y-5">
            {region.categories.map(
              (category: { name: string; value: number }) => (
                <PowerBar
                  key={category.name}
                  label={category.name}
                  value={category.value}
                />
              )
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-purple-400/20 bg-white/[0.03] p-6">
          <h2 className="text-sm font-bold tracking-[0.25em] text-purple-300">
            TOP TRENDS IN REGION
          </h2>

          <div className="mt-5 space-y-4">
            {region.top_trends.map(
              (trend: { title: string; slug: string }, index: number) => (
                <Link
                  key={trend.slug}
                  href={`/insight/${trend.slug}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  <div>
                    <p className="font-bold">
                      0{index + 1} {trend.title}
                    </p>

                    <p className="text-xs text-gray-500">
                      Trending in {region.name}
                    </p>
                  </div>

                  <span className="text-cyan-300">View</span>
                </Link>
              )
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
            REGIONAL MOMENTUM
          </h2>

          <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-400">
            Backend Live
          </span>
        </div>

        <div className="mt-8 grid grid-cols-9 gap-3">
          {region.momentum.map((height: number, index: number) => {
            const gradient =
              height >= 85
                ? "from-green-400 via-cyan-400 to-blue-500"
                : height >= 65
                ? "from-cyan-400 via-purple-400 to-pink-500"
                : "from-orange-400 via-pink-500 to-red-500";

            return (
              <div key={index} className="text-center">
                <div className="mb-2 text-xs font-bold text-cyan-300">
                  {height}%
                </div>

                <div className="flex h-48 items-end">
                  <div
                    className={`w-full rounded-t-xl bg-gradient-to-t ${gradient} shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-105`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  D{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-orange-400/20 bg-white/[0.03] p-6">
        <h2 className="text-sm font-bold tracking-[0.25em] text-orange-300">
          TOP REGIONAL CREATORS
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {region.creators.map(
            (creator: { name: string; slug: string; score: number }) => (
              <Link
                key={creator.slug}
                href={`/creator/${creator.slug}`}
                className="rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-orange-400/40 hover:bg-orange-400/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/20 bg-orange-400/10 text-xl">
                  ⚡
                </div>

                <p className="font-bold">{creator.name}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Creator Score {creator.score}
                </p>
              </Link>
            )
          )}
        </div>
      </section>
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

function PowerBar({ label, value }: { label: string; value: number }) {
  const gradient =
    value >= 85
      ? "from-green-400 via-cyan-400 to-blue-500"
      : value >= 65
      ? "from-cyan-400 via-purple-400 to-pink-500"
      : "from-orange-400 via-pink-500 to-red-500";

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-bold text-cyan-300">{value}%</span>
      </div>

      <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-[0_0_22px_rgba(0,240,255,0.55)]`}
          style={{ width: `${value}%` }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-40" />
      </div>
    </div>
  );
}