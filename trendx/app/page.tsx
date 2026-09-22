import { Suspense } from "react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import HeroCard from "../components/dashboard/HeroCard";
import LiveEngagement from "../components/dashboard/LiveEngagement";
import SearchableTrends from "../components/dashboard/SearchableTrends";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_95%_20%,rgba(168,85,247,0.07),transparent_25%)]" />

      <Sidebar />

      <section className="relative min-h-screen pb-24 md:ml-20 md:pb-8">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
          <Navbar />

          <HeroCard />

          <div className="mt-3 sm:mt-4">
            <LiveEngagement />
          </div>

          <div className="mt-4 sm:mt-6">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-sm text-gray-500">
                  Loading live trends…
                </div>
              }
            >
              <SearchableTrends />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
