import { Suspense } from "react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import HeroCard from "../components/dashboard/HeroCard";
import LiveEngagement from "../components/dashboard/LiveEngagement";
import SearchableTrends from "../components/dashboard/SearchableTrends";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="flex">
        <Sidebar />

        <section className="ml-20 min-h-screen flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Navbar />

            <HeroCard />

            <div className="mt-4">
              <LiveEngagement />
            </div>

            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-gray-500">
                    Loading live trends…
                  </div>
                }
              >
                <SearchableTrends />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
