import Link from "next/link";

const techItems = [
  {
    title: "OnePlus Nord 4 Officially Out",
    meta: "Snapdragon 7+ Gen 3 | 5500mAh | 100W Fast Charge",
    slug: "oneplus-nord-4",
    status: "▲",
  },
  {
    title: "Tesla Robotaxi Unveiled",
    meta: "Elon Musk reveals future of autonomous travel",
    slug: "tesla-robotaxi",
    status: "▲",
  },
  {
    title: "Windows 12 Concept Leaked",
    meta: "Microsoft's next OS redesign surfaces online",
    slug: "windows-12",
    status: "→",
  },
];

export default function TechBuzz() {
  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
        TECH BUZZ
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Latest tech launches & market-moving signals
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Link
          href="/insight/iphone-16-pro"
          className="relative overflow-hidden rounded-xl border border-purple-400/20 bg-purple-500/5 p-6 transition hover:border-cyan-400/50"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_70%,rgba(0,240,255,0.25),transparent_35%)]" />

          <div className="relative z-10">
            <p className="text-sm text-gray-400">Latest Tech Launch</p>

            <h2 className="mt-2 text-3xl font-black">
              iPhone 16 Pro Series Launched
            </h2>

            <p className="mt-3 max-w-md text-sm text-gray-300">
              Apple raises the bar again with AI features, advanced camera
              systems and faster silicon.
            </p>

            <button className="mt-6 rounded-lg border border-cyan-400/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10">
              Explore Now
            </button>

            <div className="mt-8 h-40 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 shadow-[0_0_35px_rgba(0,240,255,0.12)]" />
          </div>
        </Link>

        <div className="space-y-4">
          {techItems.map((item) => (
            <Link
              key={item.slug}
              href={`/insight/${item.slug}`}
              className="flex gap-4 rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold leading-snug">
                    {item.title}
                  </h3>

                  <span className="text-green-400">{item.status}</span>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {item.meta}
                </p>

                <p className="mt-2 text-[10px] text-gray-600">
                  3h ago
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}