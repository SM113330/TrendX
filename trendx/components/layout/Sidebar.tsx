"use client";

import Link from "next/link";
import { Film, Gamepad2, Home, Newspaper, Sparkles, Trophy } from "lucide-react";

const menu = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Movies", icon: Film, href: "/?category=Entertainment#explore" },
  { name: "Tech", icon: Sparkles, href: "/?category=Technology#explore" },
  { name: "Gaming", icon: Gamepad2, href: "/?category=Gaming#explore" },
  { name: "News", icon: Newspaper, href: "/?category=Live%20News#explore" },
  { name: "Sports", icon: Trophy, href: "/?category=Sports#explore" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-20 border-r border-white/10 bg-[#050507]/95 p-4 backdrop-blur">
      <Link href="/" className="mb-8 block text-xl font-black" aria-label="TrendX home">
        T<span className="text-cyan-400">X</span>
      </Link>

      <nav className="space-y-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              aria-label={item.name}
              className="group relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              <Icon size={20} />
              <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#111114] px-2 py-1 text-xs text-white shadow-xl group-hover:block">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
