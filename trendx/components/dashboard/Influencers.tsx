import Link from "next/link";

const influencers = [
  {
    name: "Elon Musk",
    handle: "@elonmusk",
    reach: "2.4M",
    score: 96,
    status: "▲ Amplifying",
    avatar: "🚀",
  },
  {
    name: "MrBeast",
    handle: "@mrbeast",
    reach: "1.9M",
    score: 92,
    status: "▲ Rising",
    avatar: "🎬",
  },
  {
    name: "Apple",
    handle: "@apple",
    reach: "1.4M",
    score: 89,
    status: "▲ Trending",
    avatar: "🍎",
  },
  {
    name: "Marvel Studios",
    handle: "@marvelstudios",
    reach: "1.2M",
    score: 87,
    status: "🚀 Exploding",
    avatar: "🎭",
  },
];

function createSlug(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}

export default function Influencers() {
  return (
    <section className="rounded-2xl border border-orange-400/20 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold tracking-[0.25em] text-orange-300">
          TOP INFLUENCERS
        </p>

        <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-300">
          Live
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {influencers.map((person) => (
          <Link
            key={person.name}
            href={`/creator/${createSlug(person.name)}`}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-orange-400/40 hover:bg-orange-400/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/20 bg-orange-400/10 text-xl">
                {person.avatar}
              </div>

              <div>
                <p className="font-bold">{person.name}</p>
                <p className="text-xs text-gray-500">
                  {person.handle}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-cyan-300">
                Score {person.score}
              </p>

              <p className="text-xs text-green-400">
                {person.status}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Reach {person.reach}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}