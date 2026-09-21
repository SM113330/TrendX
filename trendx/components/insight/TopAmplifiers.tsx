const amplifiers = [
  {
    name: "Sam Altman",
    handle: "@sama",
    reach: "2.4M",
  },
  {
    name: "OpenAI",
    handle: "@OpenAI",
    reach: "1.8M",
  },
  {
    name: "The Verge",
    handle: "@verge",
    reach: "980K",
  },
  {
    name: "MrBeast",
    handle: "@MrBeast",
    reach: "750K",
  },
];

export default function TopAmplifiers() {
  return (
    <section className="rounded-2xl border border-orange-400/20 bg-white/[0.03] p-6">
      <h2 className="text-sm font-bold tracking-[0.25em] text-orange-300">
        TOP AMPLIFIERS
      </h2>

      <div className="mt-5 space-y-4">
        {amplifiers.map((person) => (
          <div
            key={person.name}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4"
          >
            <div>
              <p className="font-bold">{person.name}</p>
              <p className="text-xs text-gray-500">
                {person.handle}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-cyan-300">
                {person.reach}
              </p>

              <p className="text-xs text-green-400">
                Reach
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}