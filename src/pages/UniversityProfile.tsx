import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, Calendar, Users, BookOpen, TrendingUp, Briefcase } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { generateUniversities, PILLAR_LABELS, PillarKey, calculateOverallScore, projectScores } from "@/data/universities";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import UniversityLogo from "@/components/UniversityLogo";
import HistoricalTrendChart from "@/components/HistoricalTrendChart";
import AlumniSuccess from "@/components/AlumniSuccess";
import GreenIntelligence from "@/components/GreenIntelligence";

const allUnis = generateUniversities();

const UniversityProfile = () => {
  const { id } = useParams<{ id: string }>();
  const uni = allUnis.find((u) => u.id === id);
  const [growth, setGrowth] = useState(50);

  const projected = useMemo(() => {
    if (!uni) return null;
    const newPillars = projectScores(uni.pillars, growth);
    const newScore = calculateOverallScore(newPillars);
    // Estimate new rank based on projected score
    const newRank = allUnis.filter((u) => u.id !== uni.id && u.overallScore > newScore).length + 1;
    return { pillars: newPillars, score: newScore, rank: newRank };
  }, [uni, growth]);

  if (!uni || !projected) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">University not found.</p>
            <Link to="/rankings" className="text-secondary mt-2 inline-block text-sm">← Back to Rankings</Link>
          </div>
        </div>
      </div>
    );
  }

  const pillarKeys = Object.keys(PILLAR_LABELS) as PillarKey[];
  const radarData = pillarKeys.map((key) => ({
    metric: PILLAR_LABELS[key].replace("Intl ", "I.").replace("Faculty–Student", "F/S"),
    Current: uni.pillars[key],
    Projected: projected.pillars[key],
  }));

  const rankDelta = uni.rank - projected.rank;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <Link to="/rankings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rankings
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* At a Glance sidebar */}
          <aside className="w-full lg:w-72 shrink-0 glass-card rounded-xl p-6 space-y-5 h-fit">
            <div className="text-center">
              <UniversityLogo domain={uni.domain} name={uni.name} className="h-16 w-16 mb-3" />
              <h1 className="font-display text-xl font-bold">{uni.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{uni.researchFocus}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{uni.city}, {uni.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Founded {uni.founded}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>{uni.students.toLocaleString()} students</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Global Rank</span>
                <span>Overall Score</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-display text-3xl font-bold text-primary">#{uni.rank}</span>
                <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-secondary/15 text-secondary">{uni.overallScore.toFixed(1)}</span>
              </div>
            </div>

            {/* Pillar breakdown */}
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pillar Scores</p>
              {pillarKeys.map((key) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-muted-foreground">{PILLAR_LABELS[key]}</span>
                    <span className="font-mono font-medium">{uni.pillars[key].toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${uni.pillars[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Radar chart */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-4">Performance Radar</h2>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(220,15%,88%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Current" dataKey="Current" stroke="hsl(222,60%,18%)" fill="hsl(222,60%,18%)" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Projected" dataKey="Projected" stroke="hsl(160,60%,40%)" fill="hsl(160,60%,40%)" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Predictive Slider */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <h2 className="font-display text-lg font-bold">Projected Growth</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Adjust the slider to simulate how improvements across all pillars would affect ranking.
              </p>
              <Slider
                value={[growth]}
                onValueChange={(v) => setGrowth(v[0])}
                min={0} max={100} step={1}
                className="mb-4 [&_[role=slider]]:bg-secondary [&_[role=slider]]:border-secondary"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Growth Factor: <span className="font-semibold text-foreground">{growth}%</span></span>
                <div className="flex gap-4 text-sm">
                  <span>Projected Rank: <span className="font-display font-bold text-primary">#{projected.rank}</span></span>
                  <span>Score: <span className="font-bold text-secondary">{projected.score.toFixed(1)}</span></span>
                  {rankDelta !== 0 && (
                    <span className={`text-xs font-medium ${rankDelta > 0 ? "text-secondary" : "text-destructive"}`}>
                      {rankDelta > 0 ? `↑${rankDelta}` : `↓${Math.abs(rankDelta)}`} positions
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Historical Trend */}
            <HistoricalTrendChart university={uni} />

            {/* Alumni Success */}
            <AlumniSuccess university={uni} />

            {/* Green Intelligence */}
            <GreenIntelligence university={uni} />

            {/* Research Highlights */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-secondary" />
                <h2 className="font-display text-lg font-bold">Research Highlights</h2>
              </div>
              <ul className="space-y-3">
                {uni.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default UniversityProfile;
