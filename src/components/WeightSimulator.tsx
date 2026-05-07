import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, RotateCcw } from "lucide-react";
import { PILLAR_WEIGHTS, PILLAR_LABELS, type PillarKey } from "@/data/universities";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// Sample worked-example pillar scores (same flavor as Methodology)
const SAMPLE_SCORES: Record<PillarKey, number> = {
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

const WeightSimulator = () => {
  const [weights, setWeights] = useState<Record<PillarKey, number>>(DEFAULT_PCT);

  const total = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0),
    [weights]
  );

  const normalized = useMemo(() => {
    const out = {} as Record<PillarKey, number>;
    (Object.keys(weights) as PillarKey[]).forEach((k) => {
      out[k] = total > 0 ? weights[k] / total : 0;
    });
    return out;
  }, [weights, total]);

  const overall = useMemo(() => {
    let s = 0;
    (Object.keys(SAMPLE_SCORES) as PillarKey[]).forEach((k) => {
      s += SAMPLE_SCORES[k] * normalized[k];
    });
    return Math.round(s * 10) / 10;
  }, [normalized]);

  const chartData = useMemo(
    () =>
      (Object.keys(SAMPLE_SCORES) as PillarKey[]).map((k) => ({
        name: PILLAR_LABELS[k].replace(" Reputation", " Rep.").replace("Intl ", "Int. "),
        contribution: Math.round(SAMPLE_SCORES[k] * normalized[k] * 10) / 10,
        score: SAMPLE_SCORES[k],
        weight: Math.round(normalized[k] * 1000) / 10,
      })),
    [normalized]
  );

  const reset = () => setWeights(DEFAULT_PCT);

  const balanced = Math.abs(total - 100) < 0.5;

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
          Drag any slider to re-balance the 8 pillars. The Overall Score and contribution chart
          recalculate instantly using a sample university.
        </p>
      </div>

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
          <Card className="glass-card p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Live Overall Score
            </p>
            <div className="font-display text-6xl sm:text-7xl font-bold text-secondary my-3 tabular-nums transition-all">
              {overall.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sample university · 8 pillars × your weights
            </p>
          </Card>

          <Card className="glass-card p-4">
            <h3 className="font-display font-bold text-sm mb-2 px-2">
              Pillar Contributions to Overall Score
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
                    formatter={(value: number, _n, p: any) => [
                      `${value} pts (score ${p.payload.score} × ${p.payload.weight}%)`,
                      "Contribution",
                    ]}
                  />
                  <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
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
