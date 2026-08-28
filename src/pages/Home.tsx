import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, TrendingUp, Globe, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { generateUniversities, generateActivityFeed } from "@/data/universities";
import UniversityLogo from "@/components/UniversityLogo";
import ActivityFeed from "@/components/ActivityFeed";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import TrendingNews from "@/components/TrendingNews";
import WorldMap from "@/components/WorldMap";
import WeightSimulator from "@/components/WeightSimulator";

const universities = generateUniversities();
const activityItems = generateActivityFeed();

const heroStats = [
  { label: "Universities", value: `${universities.length}` },
  { label: "Countries", value: `${new Set(universities.map((u) => u.country)).size}` },
  { label: "Pillars", value: "8" },
  { label: "Model", value: "QS 2026" },
];

const Home = () => {
  const [search, setSearch] = useState("");
  const top3 = universities.slice(0, 3);


  const results = useMemo(
    () => (search.length > 1 ? universities.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : []),
    [search]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.18]">
          <div className="absolute -top-20 -left-10 w-[28rem] h-[28rem] bg-secondary rounded-full blur-[130px]" />
          <div className="absolute -bottom-24 right-0 w-[32rem] h-[32rem] bg-secondary rounded-full blur-[150px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="animate-rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-xs font-medium mb-7 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary pulse-live" />
            <Globe className="h-3.5 w-3.5" />
            Powered by the QS 2026 Smart Algorithm
          </div>
          <h1 className="animate-rise stagger-1 font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-[-0.03em] leading-[1.05] max-w-3xl mx-auto">
            World University<br />
            <span className="text-gradient">Rankings & Analytics</span>
          </h1>
          <p className="animate-rise stagger-2 mt-5 text-primary-foreground/65 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Explore data-driven insights on {universities.length}+ global universities across 8 performance pillars.
          </p>

          {/* Search */}
          <div className="animate-rise stagger-2 relative max-w-lg mx-auto mt-9">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="Search any university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-13 py-3.5 rounded-2xl bg-card/95 text-foreground shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] border border-primary-foreground/10 text-base"
            />
            {results.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-popover rounded-2xl shadow-2xl border border-border z-20 overflow-hidden animate-fade-in">
                {results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/university/${u.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/60 transition-colors"
                    onClick={() => setSearch("")}
                  >
                    <span className="text-sm font-medium flex items-center gap-2 text-foreground text-left"><UniversityLogo domain={u.domain} name={u.name} className="h-6 w-6" />{u.name}</span>
                    <span className="text-xs text-muted-foreground tnum shrink-0">#{u.rank} · {u.overallScore.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="animate-rise stagger-3 flex flex-wrap justify-center gap-3 mt-7">
            <Link to="/rankings" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm shadow-[0_10px_30px_-10px_hsl(var(--emerald)/0.8)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_hsl(var(--emerald)/0.9)] transition-all duration-200">
              <TrendingUp className="h-4 w-4" />
              View Rankings
            </Link>
            <Link to="/methodology" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/20 hover:-translate-y-0.5 transition-all duration-200">
              <Award className="h-4 w-4" />
              Methodology
            </Link>
          </div>

          {/* Stat strip */}
          <div className="animate-rise stagger-3 mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-primary-foreground/10 border border-primary-foreground/10 max-w-3xl mx-auto">
            {heroStats.map((s) => (
              <div key={s.label} className="bg-primary/60 backdrop-blur-sm px-4 py-5">
                <p className="font-display text-2xl font-bold tnum text-secondary">{s.value}</p>
                <p className="text-[0.7rem] uppercase tracking-[0.12em] text-primary-foreground/55 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Weight Simulator */}
      <WeightSimulator />

      {/* Top 3 Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="text-center mb-9">
          <p className="eyebrow">Leaderboard</p>
          <h2 className="section-title mt-2 flex items-center justify-center gap-2">
            <Award className="h-6 w-6 text-secondary" /> Top 3 Universities Spotlight
          </h2>
          <p className="section-sub mx-auto">The highest overall scores under the current weighting model.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((u, i) => (
            <Link
              key={u.id}
              to={`/university/${u.id}`}
              className={`glass-card-hover rounded-2xl p-6 group relative overflow-hidden animate-rise stagger-${i + 1}`}
            >
              <span
                className={`absolute inset-x-0 top-0 h-[3px] ${
                  i === 0 ? "bg-chart-5" : i === 1 ? "bg-muted-foreground/50" : "bg-orange-500/70"
                }`}
              />
              <div className="flex items-center gap-3 mb-4">
                <UniversityLogo domain={u.domain} name={u.name} className="h-11 w-11" />
                <div className="min-w-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] tnum ${
                      i === 0
                        ? "bg-chart-5/15 text-chart-5"
                        : i === 1
                        ? "bg-muted-foreground/15 text-muted-foreground"
                        : "bg-orange-500/15 text-orange-500"
                    }`}
                  >
                    Rank #{u.rank}
                  </span>
                  <h3 className="font-display font-bold text-sm mt-1 truncate group-hover:text-secondary transition-colors">{u.name}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{u.city}, {u.country} · Est. {u.founded}</p>
              <div className="divider-soft mb-4" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">{u.researchFocus}</span>
                <span className="chip tnum font-bold shrink-0">{u.overallScore.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* World Map */}
      <WorldMap universities={universities} />

      {/* Trending News */}
      <TrendingNews />

      {/* Activity Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <div className="max-w-md mx-auto">
          <ActivityFeed items={activityItems} />
        </div>
      </section>

      <div className="mt-auto">
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Home;
