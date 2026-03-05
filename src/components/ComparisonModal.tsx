import { useState, useMemo } from "react";
import { BarChart3, Search, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { University, PILLAR_LABELS, PillarKey } from "@/data/universities";
import UniversityLogo from "@/components/UniversityLogo";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

interface ComparisonModalProps {
  universities: University[];
}

const COMPARE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
];

const CHART_COLORS = [
  "hsl(160, 60%, 40%)",
  "hsl(222, 60%, 45%)",
  "hsl(35, 90%, 50%)",
];

const ComparisonModal = ({ universities }: ComparisonModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedUnis = universities.filter((u) => selected.includes(u.id));
  const pillarKeys = Object.keys(PILLAR_LABELS) as PillarKey[];

  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    return universities.filter(
      (u) => u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)
    );
  }, [universities, search]);

  const radarData = pillarKeys.map((key) => {
    const point: Record<string, string | number> = {
      metric: PILLAR_LABELS[key].replace("Intl ", "I.").replace("Faculty–Student", "F/S"),
    };
    selectedUnis.forEach((u) => {
      point[u.name] = u.pillars[key];
    });
    return point;
  });

  const getBestForPillar = (key: PillarKey) => {
    if (selectedUnis.length === 0) return null;
    return selectedUnis.reduce((best, u) => (u.pillars[key] > best.pillars[key] ? u : best));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/10">
          <BarChart3 className="h-4 w-4 mr-1.5" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            University Comparison
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{selected.length}/3 selected</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          {/* Search & Selection */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universities or countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Selected chips */}
          {selectedUnis.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedUnis.map((u, i) => (
                <Badge
                  key={u.id}
                  variant="outline"
                  className="cursor-pointer gap-1.5 py-1 px-2.5 hover:bg-destructive/10"
                  style={{ borderColor: CHART_COLORS[i] }}
                  onClick={() => toggle(u.id)}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {u.name.split(" ").slice(0, 3).join(" ")}
                  <span className="text-muted-foreground">×</span>
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredList.slice(0, 40).map((u) => (
              <label
                key={u.id}
                className={`flex items-center gap-1.5 p-1.5 rounded-md border text-xs cursor-pointer transition-all ${
                  selected.includes(u.id)
                    ? "border-secondary bg-secondary/10 shadow-sm"
                    : "border-border/50 hover:bg-muted/50"
                } ${!selected.includes(u.id) && selected.length >= 3 ? "opacity-40 pointer-events-none" : ""}`}
              >
                <Checkbox
                  checked={selected.includes(u.id)}
                  onCheckedChange={() => toggle(u.id)}
                  disabled={!selected.includes(u.id) && selected.length >= 3}
                  className="h-3.5 w-3.5"
                />
                <UniversityLogo domain={u.domain} name={u.name} size="xs" />
                <div className="min-w-0">
                  <p className="truncate font-medium leading-tight">{u.name.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-[10px] text-muted-foreground">{u.country}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Comparison Content */}
        {selectedUnis.length >= 2 ? (
          <div className="p-6 pt-4 space-y-6">
            {/* Side-by-side university cards */}
            <div className={`grid gap-4 ${selectedUnis.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {selectedUnis.map((u, i) => (
                <div
                  key={u.id}
                  className="rounded-xl border p-4 space-y-3"
                  style={{ borderColor: CHART_COLORS[i], borderWidth: 2 }}
                >
                  <div className="flex items-center gap-2">
                    <UniversityLogo domain={u.domain} name={u.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.city}, {u.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-display font-bold" style={{ color: CHART_COLORS[i] }}>
                        {u.overallScore.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Score</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-lg font-bold">#{u.rank}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Global Rank</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Est. {u.founded} · {u.students.toLocaleString()} students</p>
                    <p className="truncate">{u.researchFocus}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <h4 className="text-sm font-semibold mb-2">Performance Overlay</h4>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  {selectedUnis.map((u, i) => (
                    <Radar
                      key={u.id}
                      name={u.name.split(" ").slice(0, 3).join(" ")}
                      dataKey={u.name}
                      stroke={CHART_COLORS[i]}
                      fill={CHART_COLORS[i]}
                      fillOpacity={0.12}
                      strokeWidth={2.5}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Comparison Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">Metric</th>
                    {selectedUnis.map((u, i) => (
                      <th key={u.id} className="text-center py-2.5 px-2 font-semibold" style={{ color: CHART_COLORS[i] }}>
                        {u.name.split(" ").slice(0, 3).join(" ")}
                      </th>
                    ))}
                    <th className="text-center py-2.5 px-2 font-semibold text-muted-foreground">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {pillarKeys.map((key) => {
                    const best = getBestForPillar(key);
                    return (
                      <tr key={key} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground font-medium">{PILLAR_LABELS[key]}</td>
                        {selectedUnis.map((u, i) => {
                          const isBest = best?.id === u.id;
                          return (
                            <td key={u.id} className="text-center py-2 px-2">
                              <span className={`font-mono ${isBest ? "font-bold" : ""}`} style={isBest ? { color: CHART_COLORS[i] } : {}}>
                                {u.pillars[key].toFixed(1)}
                              </span>
                              {isBest && <span className="ml-0.5 text-[10px]">★</span>}
                            </td>
                          );
                        })}
                        <td className="text-center py-2 px-2">
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {best?.name.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="py-3 px-3 font-bold">Overall Score</td>
                    {selectedUnis.map((u, i) => {
                      const isBest = selectedUnis.every((o) => u.overallScore >= o.overallScore);
                      return (
                        <td key={u.id} className="text-center py-3 px-2">
                          <span className="font-mono font-bold text-sm" style={{ color: CHART_COLORS[i] }}>
                            {u.overallScore.toFixed(1)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-2">
                      <Trophy className="h-3.5 w-3.5 mx-auto text-secondary" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              Select at least 2 universities to compare
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Choose up to 3 for a detailed side-by-side analysis
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
