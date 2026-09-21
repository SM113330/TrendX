import Link from "next/link";

const regions = [
  {
    value: "128K",
    place: "North America",
    slug: "north-america",
    lat: 39,
    lng: -98,
  },
  {
    value: "96K",
    place: "Europe",
    slug: "europe",
    lat: 50,
    lng: 10,
  },
  {
    value: "86K",
    place: "India",
    slug: "india",
    lat: 11,
    lng: 18,
  },
  {
    value: "72K",
    place: "East Asia",
    slug: "asia",
    lat: 35,
    lng: 105,
  },
  {
    value: "58K",
    place: "Australia",
    slug: "australia",
    lat: -25,
    lng: 63,
  },
  {
    value: "48K",
    place: "South America",
    slug: "south-america",
    lat: -15,
    lng: -60,
  },
  {
    value: "36K",
    place: "Africa",
    slug: "africa",
    lat: 5,
    lng: 20,
  },
];

const stars = Array.from({ length: 85 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() > 0.75 ? "h-1.5 w-1.5" : "h-1 w-1",
}));

function project(lat: number, lng: number) {
  const mapLeft = 8;
  const mapTop = 18;
  const mapWidth = 84;
  const mapHeight = 64;

  const x = mapLeft + ((lng + 180) / 360) * mapWidth;
  const y = mapTop + ((90 - lat) / 180) * mapHeight;

  return {
    left: `${x}%`,
    top: `${y}%`,
  };
}

export default function HeatMap() {
  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
        WHAT THE WORLD IS TALKING ABOUT
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Real-time engagement heatmap
      </p>

      <div className="relative mt-5 h-96 overflow-hidden rounded-xl border border-cyan-400/10 bg-[#02060f]">
        <img
          src="/world-map.png"
          alt="World Map"
          className="pointer-events-none absolute left-[8%] top-[18%] h-[64%] w-[84%] object-contain opacity-55 drop-shadow-[0_0_35px_rgba(0,240,255,0.45)]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.18),transparent_48%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />

        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${star.size} rounded-full bg-cyan-300/70 shadow-[0_0_10px_rgba(0,240,255,0.9)]`}
            style={{
              left: star.left,
              top: star.top,
            }}
          />
        ))}

        {regions.map((region) => {
          const position = project(region.lat, region.lng);

          return (
            <Link
              key={region.place}
              href={`/region/${region.slug}`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
              style={position}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-full bg-pink-500/20 blur-xl group-hover:bg-cyan-400/30" />

                  <div className="relative h-5 w-5 rounded-full bg-pink-500 shadow-[0_0_28px_rgba(255,0,180,1)] group-hover:bg-cyan-300" />

                  <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-pink-400/40" />
                </div>

                <div className="mt-3 min-w-28 rounded-lg border border-purple-400/30 bg-black/75 px-3 py-2 text-center backdrop-blur-md transition group-hover:border-cyan-400/50">
                  <p className="font-bold text-purple-300 group-hover:text-cyan-300">
                    {region.value}
                  </p>
                  <p className="text-xs text-gray-400">{region.place}</p>
                </div>
              </div>
            </Link>
          );
        })}

        <div className="absolute bottom-4 left-1/2 z-30 w-72 -translate-x-1/2">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Low Engagement</span>
            <span>High Engagement</span>
          </div>

          <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 via-pink-500 to-yellow-300 shadow-[0_0_18px_rgba(255,0,180,0.5)]" />
        </div>
      </div>
    </section>
  );
}