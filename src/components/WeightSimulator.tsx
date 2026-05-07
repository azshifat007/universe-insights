import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, RotateCcw, GitCompare } from "lucide-react";
import {
  PILLAR_WEIGHTS,
  PILLAR_LABELS,
  generateUniversities,
  type PillarKey,
  type PillarScores,
} from "@/data/universities";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

const SAMPLE_SCORES: PillarScores = {
  academicReputation: 92,
  citationsPerFaculty: 88,
  employerReputation: 85,
  facultyStudentRatio: 78,
  internationalResearchNetwork: 90,
  employmentOutcomes: 82,
  sustainability: 75,
  internationalDiversity: 80,
};

const DEFAULT_PCT: Record<PillarKey, number> = Object.fromEntries(
  (Object.keys(PILLAR_WEIGHTS) as PillarKey[]).map((k) => [k, Math.round(PILLAR_WEIGHTS[k] * 100)])
) as Record<PillarKey, number>;

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--ring))",
];

const ALL_UNIS = generateUniversities();

const WeightSimulator = () => {
  const [weights, setWeights] = useState<Record<PillarKey, number>>(DEFAULT_PCT);
  const [compareMode, setCompareMode] = useState(false);
  const [uniA, setUniA] = useState<string>(ALL_UNIS[0]?.id ?? "");
  const [uniB, setUniB] = useState<string>(ALL_UNIS[1]?.id ?? "");

  const total = useMemo(() => Object.values(weights).reduce((a, b) => a + b, 0), [weights]);

  const normalized = useMemo(() => {
    const out = {} as Record<PillarKey, number>;
    (Object.keys(weights) as PillarKey[]).forEach((k) => {
      out[k] = total > 0 ? weights[k] / total : 0;
    });
    return out;
  }, [weights, total]);

  const scoresA: PillarScores = useMemo(
    () => (compareMode ? ALL_UNIS.find((u) => u.id === uniA)?.pillars ?? SAMPLE_SCORES : SAMPLE_SCORES),
    [compareMode, uniA]
  );
  const scoresB: PillarScores | null = useMemo(
    () => (compareMode ? ALL_UNIS.find((u) => u.id === uniB)?.pillars ?? null : null),
    [compareMode, uniB]
  );

  const calcOverall = (s: PillarScores) => {
    let total = 0;
    (Object.keys(s) as PillarKey[]).forEach((k) => {
      total += s[k] * normalized[k];
    });
    return Math.round(total * 10) / 10;
  };

  const overallA = useMemo(() => calcOverall(scoresA), [scoresA, normalized]);
  const overallB = useMemo(() => (scoresB ? calcOverall(scoresB) : null), [scoresB, normalized]);

  const nameA = compareMode
    ? ALL_UNIS.find((u) => u.id === uniA)?.name ?? "A"
    : "Sample University";
  const nameB = compareMode ? ALL_UNIS.find((u) => u.id === uniB)?.name ?? "B" : null;

  const chartData = useMemo(
    () =>
      (Object.keys(scoresA) as PillarKey[]).map((k) => {
        const row: any = {
          name: PILLAR_LABELS[k].replace(" Reputation", " Rep.").replace("Intl ", "Int. "),
          A: Math.round(scoresA[k] * normalized[k] * 10) / 10,
          weight: Math.round(normalized[k] * 1000) / 10,
        };
        if (scoresB) row.B = Math.round(scoresB[k] * normalized[k] * 10) / 10;
        return row;
      }),
    [scoresA, scoresB, normalized]
  );

  const reset = () => setWeights(DEFAULT_PCT);
  const balanced = Math.abs(total - 100) < 0.5;

  const winner =
    overallB == null ? null : overallA > overallB ? "A" : overallB > overallA ? "B" : "tie";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Interactive Algorithm Playground
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">
          Tune the Weights, Watch the Score Change
        </h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">
          Drag any slider to re-balance the 8 pillars. Toggle compare mode to score two real
          universities side-by-side.
        </p>
      </div>

      {/* Compare toggle + selectors */}
      <Card className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="h-4 w-4 text-secondary" />
            <Label htmlFor="compare-mode" className="text-sm font-medium cursor-pointer">
              Compare two universities
            </Label>
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={setCompareMode}
            />
          </div>

          {compareMode && (
            <div className="flex flex-col sm:flex-row gap-3 flex-1 md:max-w-2xl">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">University A</Label>
                <Select value={uniA} onValueChange={setUniA}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ALL_UNIS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">University B</Label>
                <Select value={uniB} onValueChange={setUniB}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ALL_UNIS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Pillar Weights</h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                  balanced
                    ? "bg-secondary/15 text-secondary"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                Σ {total}%
              </span>
              <Button size="sm" variant="ghost" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(Object.keys(weights) as PillarKey[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-foreground/80">
                    {PILLAR_LABELS[k]}
                  </label>
                  <span className="text-xs font-mono font-bold tabular-nums">
                    {weights[k]}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[weights[k]]}
                  onValueChange={([v]) => setWeights({ ...weights, [k]: v })}
                />
              </div>
            ))}
          </div>

          {!balanced && (
            <p className="text-xs text-muted-foreground mt-4">
              Weights are auto-normalized to 100% for the live calculation.
            </p>
          )}
        </Card>

        {/* Live Output */}
        <div className="space-y-6">
          {compareMode && overallB != null ? (
            <Card className="glass-card p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-center mb-4">
                Live Overall Scores
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`text-center p-3 rounded-lg ${
                    winner === "A" ? "bg-secondary/10 ring-1 ring-secondary/40" : ""
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground line-clamp-2 min-h-[28px]">
                    {nameA}
                  </div>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-primary my-2 tabular-nums">
                    {overallA.toFixed(1)}
                  </div>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${
                    winner === "B" ? "bg-secondary/10 ring-1 ring-secondary/40" : ""
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground line-clamp-2 min-h-[28px]">
                    {nameB}
                  </div>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-secondary my-2 tabular-nums">
                    {overallB.toFixed(1)}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {winner === "tie"
                  ? "It's a tie under your weights"
                  : `Δ ${Math.abs(overallA - overallB).toFixed(1)} pts in favor of ${
                      winner === "A" ? nameA : nameB
                    }`}
              </p>
            </Card>
          ) : (
            <Card className="glass-card p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Live Overall Score
              </p>
              <div className="font-display text-6xl sm:text-7xl font-bold text-secondary my-3 tabular-nums transition-all">
                {overallA.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {nameA} · 8 pillars × your weights
              </p>
            </Card>
          )}

          <Card className="glass-card p-4">
            <h3 className="font-display font-bold text-sm mb-2 px-2">
              Pillar Contributions {compareMode && overallB != null ? "(A vs B)" : ""}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  {compareMode && overallB != null && (
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  )}
                  <Bar dataKey="A" name={nameA} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {!compareMode &&
                      chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                  </Bar>
                  {compareMode && overallB != null && (
                    <Bar dataKey="B" name={nameB ?? "B"} fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WeightSimulator;
