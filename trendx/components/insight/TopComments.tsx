"use client";

import { ExternalLink, ThumbsUp } from "lucide-react";

type Reaction = {
  platform: string;
  author: string;
  avatar_url?: string | null;
  text: string;
  likes: number;
  video_title?: string | null;
  url?: string | null;
};

export default function TopComments({ reactions }: { reactions: Reaction[] }) {
  if (reactions.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
        <h2 className="text-xl font-black">Top comments</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          No substantive public comments are available from the matched YouTube coverage for this story yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">
          Public conversation
        </p>
        <h2 className="mt-1 text-xl font-black">Top comments</h2>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {reactions.map((reaction, index) => (
          <a
            key={`${reaction.author}-${index}`}
            href={reaction.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              {reaction.avatar_url ? (
                <img
                  src={reaction.avatar_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-white/10" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {reaction.author}
                </p>
                <p className="truncate text-xs text-gray-600">
                  {reaction.video_title || reaction.platform}
                </p>
              </div>

              <ExternalLink size={14} className="text-gray-600" />
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-300">
              {reaction.text}
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
              <ThumbsUp size={13} />
              {reaction.likes.toLocaleString()}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
