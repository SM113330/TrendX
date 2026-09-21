"use client";

import { useState } from "react";
import TrendCard from "./TrendCard";
import { trendingData } from "@/lib/constants";

const categories = ["All", "AI", "Tech", "Movies", "Sports", "Finance"];

export default function SearchableTrends() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = trendingData.filter((trend) => {
    const matchesSearch = trend.title
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesCategory =
      category === "All" || trend.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-sm font-bold tracking-[0.25em] text-cyan-300">
          SEARCH TRENDS
        </h2>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Furiosa, Sora, Tesla..."
          className="w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-gray-500 lg:w-96"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              category === item
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 text-gray-400 hover:border-cyan-400/30 hover:text-cyan-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {filtered.map((trend) => (
          <TrendCard key={trend.id} trend={trend} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          No trends found.
        </p>
      )}
    </section>
  );
}