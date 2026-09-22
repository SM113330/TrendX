"use client";

type Reaction = {
  platform: string;
  author: string;
  text: string;
  likes: number;
};

export default function ReactionTicker({ reactions }: { reactions: Reaction[] }) {
  if (reactions.length === 0) return null;

  const items = [...reactions, ...reactions];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] py-2.5">
      <div className="reaction-marquee flex min-w-max gap-3 px-3">
        {items.map((reaction, index) => (
          <div
            key={`${reaction.author}-${index}`}
            className="flex max-w-[360px] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span className="shrink-0 font-bold text-white">{reaction.author}</span>
            <span className="line-clamp-1 text-gray-400">{reaction.text}</span>
            <span className="shrink-0 text-gray-600">♥ {reaction.likes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
