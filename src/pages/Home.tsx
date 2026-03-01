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

const universities = generateUniversities();
const activityItems = generateActivityFeed();

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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-xs font-medium mb-6">
            <Globe className="h-3.5 w-3.5" />
            Powered by the QS 2026 Smart Algorithm
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            World University<br />
            <span className="text-secondary">Rankings & Analytics</span>
          </h1>
          <p className="mt-4 text-primary-foreground/70 text-lg max-w-xl mx-auto">
            Explore data-driven insights on 20+ global universities across 8 performance pillars.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search any university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-card text-foreground shadow-lg border-0 text-base"
            />
            {results.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-card rounded-lg shadow-xl border border-border z-20 overflow-hidden">
                {results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/university/${u.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setSearch("")}
                  >
                    <span className="text-sm font-medium flex items-center gap-2"><UniversityLogo domain={u.domain} name={u.name} className="h-6 w-6" />{u.name}</span>
                    <span className="text-xs text-muted-foreground">#{u.rank} · {u.overallScore.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Link to="/rankings" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <TrendingUp className="h-4 w-4" />
              View Rankings
            </Link>
            <Link to="/methodology" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-foreground/10 text-primary-foreground font-medium text-sm hover:bg-primary-foreground/20 transition-colors">
              <Award className="h-4 w-4" />
              Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Top 3 Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h2 className="font-display text-2xl font-bold text-center mb-8">🏆 Top 3 Universities Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((u, i) => (
            <Link key={u.id} to={`/university/${u.id}`} className="glass-card rounded-xl p-6 hover:shadow-xl transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <UniversityLogo domain={u.domain} name={u.name} className="h-10 w-10" />
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-chart-5" : i === 1 ? "text-muted-foreground" : "text-orange-500"}`}>
                    #{u.rank} {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </span>
                  <h3 className="font-display font-bold text-sm group-hover:text-secondary transition-colors">{u.name}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{u.city}, {u.country} · Est. {u.founded}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{u.researchFocus}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">
                  {u.overallScore.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
