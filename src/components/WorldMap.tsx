import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { University } from "@/data/universities";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import worldMapImg from "@/assets/world-map.webp";

interface Region {
  id: string;
  label: string;
  cx: number;
  cy: number;
  countries: string[];
}

const REGIONS: Region[] = [
  { id: "na", label: "North America", cx: 180, cy: 140, countries: ["USA", "Canada"] },
  { id: "la", label: "Latin America", cx: 230, cy: 280, countries: ["Brazil", "Mexico", "Argentina"] },
  { id: "eu", label: "Europe", cx: 420, cy: 120, countries: ["UK", "Switzerland", "Germany", "France", "Sweden", "Netherlands", "Russia"] },
  { id: "af", label: "Africa", cx: 430, cy: 260, countries: ["South Africa", "Kenya", "Egypt"] },
  { id: "sa-asia", label: "Asia", cx: 540, cy: 200, countries: ["India", "Bangladesh"] },
  { id: "ea", label: "East Asia", cx: 630, cy: 160, countries: ["China", "Japan", "South Korea", "Singapore"] },
  { id: "me", label: "Middle East", cx: 490, cy: 180, countries: ["Israel", "Saudi Arabia"] },
  { id: "oc", label: "Oceania", cx: 680, cy: 310, countries: ["Australia"] },
];

interface WorldMapProps {
  universities: University[];
}

const WorldMap = ({ universities }: WorldMapProps) => {
  const navigate = useNavigate();
  const regionData = useMemo(() => {
    return REGIONS.map((r) => {
      const unis = universities.filter((u) => r.countries.includes(u.country));
      const avgScore = unis.length > 0 ? unis.reduce((s, u) => s + u.overallScore, 0) / unis.length : 0;
      return { ...r, count: unis.length, avgScore, universities: unis };
    });
  }, [universities]);

  const maxCount = Math.max(...regionData.map((r) => r.count), 1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
      <h2 className="font-display text-2xl font-bold text-center mb-2">🌍 Global University Distribution</h2>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Bubble size reflects university density; color intensity shows average score
      </p>

      <div className="glass-card rounded-xl p-6 overflow-hidden">
        <TooltipProvider delayDuration={100}>
          <svg viewBox="0 0 800 400" className="w-full h-auto" aria-label="World map of university distribution">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* World map background image */}
            <image href={worldMapImg} x="0" y="0" width="800" height="400" preserveAspectRatio="xMidYMid slice" opacity="0.7" className="rounded-xl" />

            {/* Connection lines between regions */}
            {regionData.filter(r => r.count > 0).map((r, i, arr) => {
              if (i === 0) return null;
              const prev = arr[i - 1];
              return (
                <line key={`line-${r.id}`}
                  x1={prev.cx} y1={prev.cy} x2={r.cx} y2={r.cy}
                  className="stroke-border/30" strokeWidth="0.5" strokeDasharray="4 4" />
              );
            })}

            {/* Region bubbles */}
            {regionData.map((r) => {
              if (r.count === 0) return null;
              const radius = 12 + (r.count / maxCount) * 28;
              const opacity = 0.3 + (r.avgScore / 100) * 0.7;

              return (
                <Tooltip key={r.id}>
                  <TooltipTrigger asChild>
                    <g className="cursor-pointer transition-transform hover:scale-110" style={{ transformOrigin: `${r.cx}px ${r.cy}px` }}
                      onClick={() => navigate(`/rankings?region=${encodeURIComponent(r.label)}`)}>
                      {/* Glow ring */}
                      <circle cx={r.cx} cy={r.cy} r={radius + 4}
                        fill="none" stroke="hsl(var(--accent))" strokeWidth="1"
                        opacity={opacity * 0.3} />
                      {/* Main bubble */}
                      <circle cx={r.cx} cy={r.cy} r={radius}
                        fill="hsl(var(--accent))" opacity={opacity}
                        className="transition-all duration-300" filter="url(#glow)" />
                      {/* Count label */}
                      <text x={r.cx} y={r.cy} textAnchor="middle" dominantBaseline="central"
                        className="fill-primary-foreground font-bold" fontSize={radius > 20 ? 14 : 11}>
                        {r.count}
                      </text>
                      {/* Region label */}
                      <text x={r.cx} y={r.cy + radius + 14} textAnchor="middle"
                        className="fill-muted-foreground" fontSize="9" fontWeight="500">
                        {r.label}
                      </text>
                    </g>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.count} universities · Avg Score: {r.avgScore.toFixed(1)}</p>
                      <div className="pt-1 border-t border-border/50 space-y-0.5">
                        {r.universities.slice(0, 5).map((u) => (
                          <p key={u.id} className="text-xs">#{u.rank} {u.name}</p>
                        ))}
                        {r.universities.length > 5 && (
                          <p className="text-xs text-muted-foreground">+{r.universities.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </svg>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-secondary/40" />
            <span>Low density</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-secondary/70" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-secondary" />
            <span>High density</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMap;
