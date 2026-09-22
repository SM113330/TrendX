"use client";

import { useEffect, useState } from "react";
import { MessageCircleMore, ThumbsUp } from "lucide-react";

type Reaction = {
  platform: string;
  author: string;
  avatar_url?: string | null;
  text: string;
  likes: number;
  published_at?: string | null;
  video_title?: string | null;
  url?: string | null;
};

export default function LiveReactions({
  reactions,
}: {
  reactions: Reaction[];
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reactions.length <= 1) return;

    const interval = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setIndex((current) => (current + 1) % reactions.length);
        setVisible(true);
      }, 420);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [reactions.length]);

  if (reactions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
          <MessageCircleMore size={14} />
          Live reactions
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          No substantive public reactions are available yet.
        </p>
      </div>
    );
  }

  const reaction = reactions[index];

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-300/10 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.08),transparent_38%),rgba(0,0,0,0.22)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          Live reactions
        </div>

        <span className="text-[10px] text-gray-600">
          {index + 1}/{reactions.length}
        </span>
      </div>

      <a
        href={reaction.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 block transition-all duration-500 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          {reaction.avatar_url ? (
            <img
              src={reaction.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/10" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {reaction.author}
            </p>
            <p className="text-[11px] text-red-300">{reaction.platform}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-5 text-sm leading-6 text-gray-300">
          {reaction.text}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <ThumbsUp size={12} />
          {reaction.likes.toLocaleString()}
        </div>
      </a>
    </div>
  );
}
