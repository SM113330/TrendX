"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trendingData } from "@/lib/constants";

interface CompareSelectorProps {
  currentSlug: string;
}

function createSlug(title: string) {
  return title.toLowerCase().replaceAll(" ", "-");
}

export default function CompareSelector({
  currentSlug,
}: CompareSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState("tesla-robotaxi");

  function handleCompare() {
    router.push(`/compare/${currentSlug}/${selected}`);
  }

  return (
    <section className="rounded-2xl border border-yellow-400/20 bg-white/[0.03] p-6">
      <h2 className="text-sm font-bold tracking-[0.25em] text-yellow-300">
        COMPARE TREND
      </h2>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="rounded-xl border border-cyan-400/20 bg-black px-4 py-3 text-sm text-white outline-none"
        >
          {trendingData.map((trend) => {
            const slug = createSlug(trend.title);

            if (slug === currentSlug) return null;

            return (
              <option key={trend.id} value={slug}>
                {trend.title}
              </option>
            );
          })}
        </select>

        <button
          onClick={handleCompare}
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black shadow-[0_0_25px_rgba(0,240,255,0.35)]"
        >
          Compare Now
        </button>
      </div>
    </section>
  );
}