"use client";

import Link from "next/link";
import { Globe2, Home, MessageCircleMore, Search, Play } from "lucide-react";

const menu = [
  { name: "Overall", icon: Home, href: "/?platform=overall#explore" },
  { name: "Google", icon: Search, href: "/?platform=google#explore" },
  { name: "YouTube", icon: Play, href: "/?platform=youtube#explore" },
  { name: "X", icon: MessageCircleMore, href: "/?platform=x#explore" },
  { name: "Facebook", icon: Globe2, href: "/?platform=facebook#explore" },
];

export default function Sidebar() {
  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-20 border-r border-white/10 bg-[#060608]/90 p-4 backdrop-blur-xl md:block">
        <Link href="/" className="mb-8 block text-xl font-black" aria-label="TrendX home">
          T<span className="text-cyan-400">X</span>
        </Link>

        <nav className="space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                aria-label={item.name}
                className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-gray-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                <Icon size={20} />
                <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#111114] px-2.5 py-1.5 text-xs text-white shadow-2xl group-hover:block">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#070709]/92 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold text-gray-500 transition active:bg-white/[0.06] active:text-cyan-300"
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
