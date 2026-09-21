import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import InsightMomentumChart from "@/components/insight/InsightMomentumChart";
import { ArrowLeft } from "lucide-react";
import { compareBackendTrends } from "@/services/api";

interface ComparePageProps {
  params: Promise<{
    left: string;
    right: string;
  }>;
}

function formatTitle(slug: string) {
  return slug.replaceAll("-", " ").toUpperCase();
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { left, right } = await params;
  const comparison = await compareBackendTrends(left, right);

  const leftDetail = comparison.left;
  const rightDetail = comparison.right;

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
        TREND COMPARISON
      </p>

      <h1 className="mt-4 text-4xl font-black tracking-widest">
        {formatTitle(left)}
        <span className="mx-4 text-cyan-300">VS</span>
        {formatTitle(right)}
      </h1>

      <div className="mt-4 inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-400">
        Winner:{" "}
        {comparison.winner === "tie"
          ? "Tie"
          : comparison.winner.replaceAll("-", " ").toUpperCase()}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <CompareMetric
          label="Trend Score"
          left={leftDetail.score}
          right={rightDetail.score}
          suffix=""
        />

        <CompareMetric
          label="Velocity"
          left={leftDetail.velocity}
          right={rightDetail.velocity}
          suffix="%"
        />

        <CompareMetric
          label="Sentiment"
          left={leftDetail.sentiment}
          right={rightDetail.sentiment}
          suffix="%"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-[0.25em] text-cyan-300">
            {leftDetail.title}
          </h2>
          <InsightMomentumChart momentum={leftDetail.momentum ?? []} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold tracking-[0.25em] text-purple-300">
            {rightDetail.title}
          </h2>
          <InsightMomentumChart momentum={rightDetail.momentum ?? []} />
        </div>
      </div>
    </main>
  );
}

function CompareMetric({
  label,
  left,
  right,
  suffix,
}: {
  label: string;
  left: number;
  right: number;
  suffix: string;
}) {
  const winner = left > right ? "left" : right > left ? "right" : "tie";

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <p className="text-gray-400">{label}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div
          className={`rounded-xl border p-4 ${
            winner === "left"
              ? "border-green-400/40 bg-green-400/5"
              : "border-white/10 bg-black/30"
          }`}
        >
          <p className="text-3xl font-black text-cyan-300">
            {left}
            {suffix}
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            winner === "right"
              ? "border-green-400/40 bg-green-400/5"
              : "border-white/10 bg-black/30"
          }`}
        >
          <p className="text-3xl font-black text-purple-300">
            {right}
            {suffix}
          </p>
        </div>
      </div>
    </div>
  );
}