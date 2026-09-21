"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { searchBackendTrends } from "@/services/api";
import { Trend } from "@/types/trend";

function resultSlug(result: Trend) {
  if (result.slug) return result.slug;

  return result.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Trend[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) return;

    try {
      setSearching(true);
      const data = await searchBackendTrends(query);

      if (data.length > 0) {
        router.push(`/insight/${resultSlug(data[0])}`);
        setQuery("");
        setResults([]);
      }
    } catch (error) {
      console.error("Trend search failed:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const data = await searchBackendTrends(value);
      setResults(data);
    } catch (error) {
      console.error("Trend search failed:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-3xl font-black tracking-[0.25em] sm:text-4xl">
        TREND<span className="text-cyan-400">X</span>
      </h1>

      <div className="flex w-full items-center gap-3 lg:w-auto">
        <form
          onSubmit={handleSearch}
          className="relative flex min-w-0 flex-1 items-center gap-2 rounded-full border border-cyan-400/20 bg-white/[0.03] px-4 py-2 lg:w-80"
        >
          <Search size={18} className="shrink-0 text-cyan-300" />

          <input
            value={query}
            onChange={(event) => void handleChange(event.target.value)}
            placeholder={searching ? "Searching..." : "Search trending topics..."}
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-500"
          />

          {results.length > 0 && (
            <div className="absolute left-0 top-12 z-50 w-full rounded-xl border border-cyan-400/20 bg-[#050507] p-2 shadow-[0_0_30px_rgba(0,240,255,0.18)]">
              {results.map((result) => {
                const slug = resultSlug(result);

                return (
                  <button
                    key={slug || String(result.id)}
                    type="button"
                    onClick={() => {
                      router.push(`/insight/${slug}`);
                      setQuery("");
                      setResults([]);
                    }}
                    className="w-full rounded-lg p-3 text-left transition hover:bg-cyan-400/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 font-bold">{result.title}</p>
                      <p className="shrink-0 text-xs text-cyan-300">
                        Score {result.score}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {result.category}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </form>

        <button
          type="button"
          aria-label="Notifications"
          className="shrink-0 rounded-full border border-cyan-400/20 bg-white/[0.03] p-3"
        >
          <Bell size={18} className="text-cyan-300" />
        </button>
      </div>
    </header>
  );
}
