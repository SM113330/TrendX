import Link from "next/link";

const related = [
  "GPT-5",
  "Google Veo",
  "Runway ML",
  "Midjourney",
  "AI Video",
  "Sora 2",
];

function createSlug(title: string) {
  return title.toLowerCase().replaceAll(" ", "-");
}

export default function RelatedTrends() {
  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
        RELATED TRENDS
      </h2>

      <div className="mt-5 flex flex-wrap gap-3">
        {related.map((trend) => (
          <Link
            key={trend}
            href={`/insight/${createSlug(trend)}`}
            className="rounded-full border border-cyan-400/20 bg-black/40 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            {trend}
          </Link>
        ))}
      </div>
    </section>
  );
}