const platforms = [
  { name: "X / Twitter", value: 42 },
  { name: "YouTube", value: 31 },
  { name: "TikTok", value: 18 },
  { name: "Reddit", value: 9 },
];

export default function PlatformBreakdown() {
  return (
    <section className="rounded-2xl border border-purple-400/20 bg-white/[0.03] p-6">
      <h2 className="text-sm font-bold tracking-[0.25em] text-purple-300">
        PLATFORM BREAKDOWN
      </h2>

      <div className="mt-6 space-y-5">
        {platforms.map((platform) => (
          <div key={platform.name}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-300">{platform.name}</span>
              <span className="text-cyan-300">{platform.value}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.65)]"
                style={{ width: `${platform.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}