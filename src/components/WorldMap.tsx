import { useMemo } from "react";
import type { University } from "@/data/universities";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Region {
  id: string;
  label: string;
  cx: number;
  cy: number;
  countries: string[];
}

const REGIONS: Region[] = [
  { id: "na", label: "North America", cx: 180, cy: 140, countries: ["USA", "Canada"] },
  { id: "sa", label: "South America", cx: 230, cy: 280, countries: ["Brazil"] },
  { id: "eu", label: "Europe", cx: 420, cy: 120, countries: ["UK", "Switzerland", "Germany"] },
  { id: "af", label: "Africa", cx: 430, cy: 260, countries: ["South Africa"] },
  { id: "sa-asia", label: "South Asia", cx: 540, cy: 200, countries: ["India", "Bangladesh"] },
  { id: "ea", label: "East Asia", cx: 630, cy: 160, countries: ["China", "Japan", "South Korea"] },
  { id: "sea", label: "Southeast Asia", cx: 620, cy: 230, countries: ["Singapore"] },
  { id: "oc", label: "Oceania", cx: 680, cy: 310, countries: ["Australia"] },
];

interface WorldMapProps {
  universities: University[];
}

const WorldMap = ({ universities }: WorldMapProps) => {
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
            {/* Simplified world outline */}
            <defs>
              <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(220, 20%, 95%)" />
                <stop offset="100%" stopColor="hsl(220, 20%, 90%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ocean background */}
            <rect width="800" height="400" rx="12" fill="url(#ocean)" />

            {/* Simplified continent shapes */}
            {/* North America */}
            <path d="M100,60 Q120,50 160,55 L200,70 Q220,90 230,120 L225,150 Q210,170 190,175 L170,180 Q150,175 140,160 L120,130 Q105,100 100,80 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* South America */}
            <path d="M195,200 Q210,195 225,200 L240,230 Q250,260 245,290 L235,320 Q225,340 215,345 L205,340 Q195,320 190,290 L185,260 Q185,230 195,200 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* Europe */}
            <path d="M380,70 Q400,60 430,65 L450,75 Q460,85 455,100 L445,120 Q435,135 420,140 L400,138 Q385,130 380,115 L375,95 Q375,80 380,70 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* Africa */}
            <path d="M400,155 Q420,150 440,155 L455,180 Q465,210 460,250 L450,290 Q440,310 425,315 L410,310 Q400,290 395,260 L390,220 Q388,185 400,155 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* Asia */}
            <path d="M460,60 Q500,50 560,55 L620,70 Q660,85 670,110 L675,140 Q670,170 650,190 L620,200 Q580,205 540,195 L510,180 Q480,160 470,130 L465,100 Q458,75 460,60 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* South/SE Asia */}
            <path d="M510,195 Q530,190 560,200 L580,215 Q600,230 610,250 L600,260 Q580,265 560,255 L530,235 Q515,220 510,195 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />
            {/* Australia */}
            <path d="M640,275 Q660,265 690,270 L710,285 Q720,300 715,320 L700,335 Q685,340 665,335 L650,320 Q640,305 638,290 Z"
              className="fill-muted/40 stroke-border" strokeWidth="0.5" />

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
                    <g className="cursor-pointer transition-transform hover:scale-110" style={{ transformOrigin: `${r.cx}px ${r.cy}px` }}>
                      {/* Glow ring */}
                      <circle cx={r.cx} cy={r.cy} r={radius + 4}
                        fill="none" stroke="hsl(160, 60%, 40%)" strokeWidth="1"
                        opacity={opacity * 0.3} />
                      {/* Main bubble */}
                      <circle cx={r.cx} cy={r.cy} r={radius}
                        fill="hsl(160, 60%, 40%)" opacity={opacity}
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
