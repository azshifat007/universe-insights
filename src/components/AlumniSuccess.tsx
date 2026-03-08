import { useMemo } from "react";
import { Briefcase, Globe2, Building2, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { University } from "@/data/universities";
import worldMapImg from "@/assets/world-map.webp";

// ─── Employer data seeded per university ────────────────────────────────────
const EMPLOYER_POOL = [
  { name: "Google", sector: "Tech", region: "North America", x: 135, y: 160 },
  { name: "Microsoft", sector: "Tech", region: "North America", x: 155, y: 145 },
  { name: "Apple", sector: "Tech", region: "North America", x: 120, y: 165 },
  { name: "Amazon", sector: "Tech", region: "North America", x: 145, y: 150 },
  { name: "Meta", sector: "Tech", region: "North America", x: 130, y: 155 },
  { name: "Tesla", sector: "Automotive", region: "North America", x: 110, y: 160 },
  { name: "Goldman Sachs", sector: "Finance", region: "North America", x: 200, y: 145 },
  { name: "McKinsey & Co", sector: "Consulting", region: "North America", x: 190, y: 150 },
  { name: "JPMorgan Chase", sector: "Finance", region: "North America", x: 195, y: 148 },
  { name: "Deloitte", sector: "Consulting", region: "Europe", x: 390, y: 130 },
  { name: "Samsung", sector: "Tech", region: "Asia", x: 620, y: 155 },
  { name: "Toyota", sector: "Automotive", region: "Asia", x: 640, y: 145 },
  { name: "Siemens", sector: "Engineering", region: "Europe", x: 400, y: 120 },
  { name: "HSBC", sector: "Finance", region: "Europe", x: 375, y: 125 },
  { name: "WHO", sector: "Healthcare", region: "Europe", x: 395, y: 115 },
  { name: "World Bank", sector: "Development", region: "North America", x: 185, y: 155 },
  { name: "NASA", sector: "Aerospace", region: "North America", x: 140, y: 140 },
  { name: "CERN", sector: "Research", region: "Europe", x: 395, y: 118 },
  { name: "IBM", sector: "Tech", region: "North America", x: 180, y: 142 },
  { name: "Huawei", sector: "Tech", region: "Asia", x: 575, y: 150 },
  { name: "Tata Group", sector: "Conglomerate", region: "Asia", x: 530, y: 175 },
  { name: "Infosys", sector: "Tech", region: "Asia", x: 535, y: 180 },
  { name: "Unilever", sector: "Consumer Goods", region: "Europe", x: 380, y: 128 },
  { name: "Pfizer", sector: "Pharma", region: "North America", x: 192, y: 146 },
  { name: "Roche", sector: "Pharma", region: "Europe", x: 398, y: 117 },
  { name: "Alibaba", sector: "Tech", region: "Asia", x: 600, y: 155 },
  { name: "Sony", sector: "Tech", region: "Asia", x: 645, y: 148 },
  { name: "Boeing", sector: "Aerospace", region: "North America", x: 115, y: 145 },
  { name: "Shell", sector: "Energy", region: "Europe", x: 385, y: 122 },
  { name: "United Nations", sector: "International Org", region: "North America", x: 198, y: 143 },
];

const REGION_HOTSPOTS = [
  { region: "North America", x: 160, y: 150, label: "Silicon Valley / NYC" },
  { region: "Europe", x: 395, y: 125, label: "London / Zurich" },
  { region: "Asia", x: 590, y: 160, label: "Singapore / Tokyo" },
  { region: "Middle East", x: 460, y: 170, label: "Dubai / Riyadh" },
  { region: "Oceania", x: 660, y: 280, label: "Sydney / Melbourne" },
  { region: "Africa", x: 420, y: 230, label: "Johannesburg / Nairobi" },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AlumniData {
  topEmployers: { name: string; sector: string; percentage: number }[];
  regionDistribution: { region: string; percentage: number; x: number; y: number; label: string }[];
  totalAlumniPlaced: number;
  avgSalaryMultiplier: number;
}

function generateAlumniData(uni: University): AlumniData {
  const seed = hashId(uni.id);
  const rng = seededRandom(seed);

  // Pick 6-8 top employers deterministically
  const shuffled = [...EMPLOYER_POOL].sort(() => rng() - 0.5);
  const count = 6 + Math.floor(rng() * 3);
  const selected = shuffled.slice(0, count);

  // Weight by employer reputation score
  const empScore = uni.pillars.employerReputation;
  const topEmployers = selected.map((e) => ({
    name: e.name,
    sector: e.sector,
    percentage: Math.round((5 + rng() * (empScore / 10)) * 10) / 10,
  })).sort((a, b) => b.percentage - a.percentage);

  // Region distribution for alumni
  const regions = REGION_HOTSPOTS.map((r) => {
    let base = 5 + rng() * 15;
    // Boost home region
    const homeContinent = getHomeRegion(uni.country);
    if (r.region === homeContinent) base += 20 + rng() * 15;
    return { ...r, percentage: Math.round(base * 10) / 10 };
  });
  // Normalize to 100
  const total = regions.reduce((s, r) => s + r.percentage, 0);
  regions.forEach((r) => (r.percentage = Math.round((r.percentage / total) * 100 * 10) / 10));

  const totalAlumniPlaced = Math.round((uni.students * (empScore / 100) * (0.7 + rng() * 0.3)) / 100) * 100;
  const avgSalaryMultiplier = Math.round((1.2 + (empScore / 100) * 1.5 + rng() * 0.3) * 10) / 10;

  return { topEmployers, regionDistribution: regions, totalAlumniPlaced, avgSalaryMultiplier };
}

function getHomeRegion(country: string): string {
  const map: Record<string, string> = {
    USA: "North America", Canada: "North America",
    UK: "Europe", Germany: "Europe", France: "Europe", Switzerland: "Europe",
    Sweden: "Europe", Netherlands: "Europe", Belgium: "Europe", Denmark: "Europe",
    Finland: "Europe", Italy: "Europe", Austria: "Europe", Poland: "Europe",
    Norway: "Europe", Russia: "Europe",
    Japan: "Asia", China: "Asia", Singapore: "Asia", "South Korea": "Asia",
    India: "Asia", Bangladesh: "Asia", Thailand: "Asia", Philippines: "Asia",
    Malaysia: "Asia", Vietnam: "Asia",
    Australia: "Oceania",
    Brazil: "North America", Mexico: "North America", Argentina: "North America", Chile: "North America",
    Israel: "Middle East", "Saudi Arabia": "Middle East", Turkey: "Middle East", Iran: "Middle East",
    Egypt: "Africa", "South Africa": "Africa", Kenya: "Africa", Nigeria: "Africa", Uganda: "Africa",
  };
  return map[country] || "Asia";
}

const SECTOR_COLORS: Record<string, string> = {
  Tech: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Finance: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  Consulting: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  Automotive: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  Aerospace: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  Healthcare: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  Engineering: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  Pharma: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Research: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  Energy: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  "Consumer Goods": "bg-teal-500/20 text-teal-700 dark:text-teal-300",
  Conglomerate: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  Development: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  "International Org": "bg-purple-500/20 text-purple-700 dark:text-purple-300",
};

interface AlumniSuccessProps {
  university: University;
}

const AlumniSuccess = ({ university }: AlumniSuccessProps) => {
  const data = useMemo(() => generateAlumniData(university), [university]);

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Alumni Success</h2>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {data.totalAlumniPlaced.toLocaleString()} placed annually
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {data.avgSalaryMultiplier}× avg salary
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Top Employers
          </h3>
          <div className="space-y-2.5">
            {data.topEmployers.map((emp, i) => (
              <div key={emp.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{emp.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SECTOR_COLORS[emp.sector] || "bg-muted text-muted-foreground"}`}>
                        {emp.sector}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{emp.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-secondary transition-all duration-500"
                      style={{ width: `${Math.min(emp.percentage * 5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alumni Global Heatmap */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" /> Alumni Global Distribution
          </h3>
          <div className="relative rounded-lg overflow-hidden border border-border">
            <TooltipProvider delayDuration={100}>
              <svg viewBox="0 0 800 400" className="w-full h-auto">
                <image
                  href={worldMapImg}
                  x="0" y="0" width="800" height="400"
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.5"
                />

                {data.regionDistribution.map((r) => {
                  const radius = Math.max(12, Math.min(40, r.percentage * 0.5));
                  const opacity = 0.3 + (r.percentage / 100) * 0.5;

                  return (
                    <TooltipTrigger key={r.region} asChild>
                      <g>
                        {/* Glow circle */}
                        <circle
                          cx={r.x} cy={r.y}
                          r={radius + 8}
                          fill="hsl(160, 60%, 40%)"
                          opacity={opacity * 0.2}
                        />
                        {/* Main bubble */}
                        <circle
                          cx={r.x} cy={r.y}
                          r={radius}
                          fill="hsl(160, 60%, 40%)"
                          opacity={opacity}
                          className="cursor-default"
                        >
                          <animate attributeName="r" values={`${radius};${radius + 2};${radius}`} dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values={`${opacity};${opacity * 0.7};${opacity}`} dur="3s" repeatCount="indefinite" />
                        </circle>
                        {/* Percentage label */}
                        <text
                          x={r.x} y={r.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {r.percentage}%
                        </text>
                      </g>
                    </TooltipTrigger>
                  );
                })}

                {data.regionDistribution.map((r) => (
                  <Tooltip key={`tip-${r.region}`}>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{r.region}</p>
                      <p className="text-muted-foreground">{r.label} · {r.percentage}% of alumni</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </svg>
            </TooltipProvider>
          </div>

          {/* Region legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.regionDistribution
              .sort((a, b) => b.percentage - a.percentage)
              .map((r) => (
                <span
                  key={r.region}
                  className="text-[10px] px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium"
                >
                  {r.region}: {r.percentage}%
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniSuccess;
