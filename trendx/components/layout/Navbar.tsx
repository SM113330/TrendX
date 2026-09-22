"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

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
  const [mobileSearch, setMobileSearch] = useState(false);

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
        setMobileSearch(false);
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
      setResults(await searchBackendTrends(value));
    } catch (error) {
      console.error("Trend search failed:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <header className="relative z-40 mb-3 sm:mb-5">
      <div className="flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 backdrop-blur-xl sm:h-16">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xl font-black tracking-[0.18em] sm:text-2xl"
        >
          TREND<span className="text-cyan-400">X</span>
        </button>

        <form
          onSubmit={handleSearch}
          className="relative hidden w-80 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 md:flex"
        >
          <Search size={17} className="text-cyan-300" />
          <input
            value={query}
            onChange={(event) => void handleChange(event.target.value)}
            placeholder={searching ? "Searching..." : "Search live trends"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-600"
          />
          <SearchResults results={results} onSelect={(slug) => {
            router.push(`/insight/${slug}`);
            setQuery("");
            setResults([]);
          }} />
        </form>

        <button
          type="button"
          onClick={() => setMobileSearch((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-cyan-200 md:hidden"
          aria-label="Search trends"
        >
          {mobileSearch ? <X size={19} /> : <Search size={19} />}
        </button>
      </div>

      {mobileSearch && (
        <form
          onSubmit={handleSearch}
          className="relative mt-2 flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-[#0a0a0d]/95 px-4 py-3 shadow-2xl backdrop-blur-xl md:hidden"
        >
          <Search size={17} className="text-cyan-300" />
          <input
            autoFocus
            value={query}
            onChange={(event) => void handleChange(event.target.value)}
            placeholder={searching ? "Searching..." : "Search live trends"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-600"
          />
          <SearchResults results={results} onSelect={(slug) => {
            router.push(`/insight/${slug}`);
            setQuery("");
            setResults([]);
            setMobileSearch(false);
          }} />
        </form>
      )}
    </header>
  );
}

function SearchResults({
  results,
  onSelect,
}: {
  results: Trend[];
  onSelect: (slug: string) => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] p-2 shadow-2xl">
      {results.slice(0, 6).map((result) => {
        const slug = resultSlug(result);

        return (
          <button
            key={slug || String(result.id)}
            type="button"
            onClick={() => onSelect(slug)}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[0.05]"
          >
            {result.image_url ? (
              <img src={result.image_url} alt="" className="h-10 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-12 rounded-lg bg-white/[0.05]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-bold">{result.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{result.category}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
