import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { University } from "@/data/universities";
import { generateRankHistory } from "@/data/universities";
import { useMemo } from "react";

interface HistoricalTrendChartProps {
  university: University;
}

const YEARS = ["2022", "2023", "2024", "2025", "2026"];

const HistoricalTrendChart = ({ university }: HistoricalTrendChartProps) => {
  const history = useMemo(() => generateRankHistory(university), [university]);

  const chartData = YEARS.map((year, i) => ({
    year,
    rank: history.ranks[i],
    score: history.scores[i],
  }));

  const startRank = history.ranks[0];
  const endRank = history.ranks[4];
  const delta = startRank - endRank; // positive = improved
  const startScore = history.scores[0];
  const endScore = history.scores[4];
  const scoreDelta = endScore - startScore;

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-secondary" : delta < 0 ? "text-destructive" : "text-muted-foreground";
  const trendLabel = delta > 0 ? "Climber" : delta < 0 ? "Declining" : "Consistent";

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-5 w-5 ${trendColor}`} />
          <h2 className="font-display text-lg font-bold">5-Year Ranking History</h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          delta > 0 ? "bg-secondary/15 text-secondary" :
          delta < 0 ? "bg-destructive/15 text-destructive" :
          "bg-muted text-muted-foreground"
        }`}>
          {trendLabel} {delta !== 0 && `(${delta > 0 ? "↑" : "↓"}${Math.abs(delta)} positions)`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">2022 Rank</p>
          <p className="font-display text-xl font-bold">#{startRank}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">2026 Rank</p>
          <p className="font-display text-xl font-bold text-primary">#{endRank}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Score Δ</p>
          <p className={`font-display text-xl font-bold ${scoreDelta >= 0 ? "text-secondary" : "text-destructive"}`}>
            {scoreDelta >= 0 ? "+" : ""}{scoreDelta.toFixed(1)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="rank"
            reversed
            domain={[1, Math.max(...history.ranks) + 3]}
            tick={{ fontSize: 11 }}
            label={{ value: "Rank", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(220,10%,46%)" } }}
          />
          <YAxis
            yAxisId="score"
            orientation="right"
            domain={[Math.min(...history.scores) - 5, 100]}
            tick={{ fontSize: 11 }}
            label={{ value: "Score", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "hsl(220,10%,46%)" } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0,0%,100%)",
              border: "1px solid hsl(220,15%,88%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) =>
              name === "rank" ? [`#${value}`, "Rank"] : [value.toFixed(1), "Score"]
            }
          />
          <ReferenceLine yAxisId="rank" y={endRank} stroke="hsl(160,60%,40%)" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Line
            yAxisId="rank"
            type="monotone"
            dataKey="rank"
            stroke="hsl(222,60%,18%)"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "hsl(222,60%,18%)", strokeWidth: 2, stroke: "hsl(0,0%,100%)" }}
            activeDot={{ r: 7 }}
            name="rank"
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="score"
            stroke="hsl(160,60%,40%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: "hsl(160,60%,40%)", strokeWidth: 2, stroke: "hsl(0,0%,100%)" }}
            activeDot={{ r: 6 }}
            name="score"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded" />
          <span>Global Rank (lower is better)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-secondary rounded" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(160,60%,40%) 0, hsl(160,60%,40%) 3px, transparent 3px, transparent 6px)" }} />
          <span>Overall Score</span>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendChart;
