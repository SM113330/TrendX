import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import HeroCard from "../components/dashboard/HeroCard";
import LiveEngagement from "../components/dashboard/LiveEngagement";
import TechBuzz from "../components/dashboard/TechBuzz";
import TrendingNow from "../components/dashboard/TrendingNow";
import HeatMap from "../components/dashboard/HeatMap";
import Influencers from "../components/dashboard/Influencers";
import TrendTimeline from "../components/charts/TrendTimeline";
import TrendFeed from "../components/dashboard/TrendFeed";
import MomentumEngine from "../components/dashboard/MomentumEngine";
import SearchableTrends from "../components/dashboard/SearchableTrends";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="flex">
        <Sidebar />

        <section className="ml-20 min-h-screen flex-1 p-6">
          <Navbar />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <HeroCard />
            <LiveEngagement />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
  <TechBuzz />
  <TrendingNow />
</div>
<div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
  <HeatMap />
  <Influencers />
</div>
<div className="mt-6">
  <TrendTimeline />
</div>
<div className="mt-6">
  <TrendFeed />
</div>
<div className="mt-6">
  <SearchableTrends />
</div>
<div className="mt-6">
  <MomentumEngine />
</div>
        </section>
      </div>
    </main>
  );
}