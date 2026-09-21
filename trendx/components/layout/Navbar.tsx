"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { searchBackendTrends } from "@/services/api";

interface SearchResult {
  title: string;
  slug: string;
  category: string;
  score: number;
  direction: "up" | "down" | "rocket";
}

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) return;

    const data = await searchBackendTrends(query);

    if (data.length > 0) {
      router.push(`/insight/${data[0].slug}`);
      setQuery("");
      setResults([]);
    }
  }

  async function handleChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const data = await searchBackendTrends(value);
    setResults(data);
  }

  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-4xl font-black tracking-[0.25em]">
        TREND<span className="text-cyan-400">X</span>
      </h1>

      <div className="flex items-center gap-4">
        <form
          onSubmit={handleSearch}
          className="relative flex w-80 items-center gap-2 rounded-full border border-cyan-400/20 bg-white/[0.03] px-4 py-2"
        >
          <Search size={18} className="text-cyan-300" />

          <input
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Search trending topics..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
          />

          {results.length > 0 && (
            <div className="absolute left-0 top-12 z-50 w-full rounded-xl border border-cyan-400/20 bg-[#050507] p-2 shadow-[0_0_30px_rgba(0,240,255,0.18)]">
              {results.map((result) => (
                <button
                  key={result.slug}
                  type="button"
                  onClick={() => {
                    router.push(`/insight/${result.slug}`);
                    setQuery("");
                    setResults([]);
                  }}
                  className="w-full rounded-lg p-3 text-left transition hover:bg-cyan-400/10"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{result.title}</p>
                    <p className="text-xs text-cyan-300">
                      Score {result.score}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {result.category}
                  </p>
                </button>
              ))}
            </div>
          )}
        </form>

        <button className="rounded-full border border-cyan-400/20 bg-white/[0.03] p-3">
          <Bell size={18} className="text-cyan-300" />
        </button>
      </div>
    </header>
  );
}