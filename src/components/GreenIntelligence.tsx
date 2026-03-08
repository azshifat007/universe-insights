import { useMemo } from "react";
import { Leaf, Globe2, TreePine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { University } from "@/data/universities";

// ─── UN Sustainable Development Goals ────────────────────────────────────────
const UN_SDGS = [
  { id: 1, name: "No Poverty", icon: "🎯" },
  { id: 2, name: "Zero Hunger", icon: "🌾" },
  { id: 3, name: "Good Health", icon: "💊" },
  { id: 4, name: "Quality Education", icon: "📚" },
  { id: 5, name: "Gender Equality", icon: "⚖️" },
  { id: 6, name: "Clean Water", icon: "💧" },
  { id: 7, name: "Clean Energy", icon: "⚡" },
  { id: 8, name: "Decent Work", icon: "💼" },
  { id: 9, name: "Industry & Innovation", icon: "🏭" },
  { id: 10, name: "Reduced Inequalities", icon: "🤝" },
  { id: 11, name: "Sustainable Cities", icon: "🏙️" },
  { id: 12, name: "Responsible Consumption", icon: "♻️" },
  { id: 13, name: "Climate Action", icon: "🌍" },
  { id: 14, name: "Life Below Water", icon: "🐟" },
  { id: 15, name: "Life on Land", icon: "🌳" },
  { id: 16, name: "Peace & Justice", icon: "🕊️" },
  { id: 17, name: "Partnerships", icon: "🤲" },
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

interface GreenData {
  leafRating: number; // 1-5
  carbonFootprint: string;
  sdgs: { id: number; name: string; icon: string; strength: number }[];
  sustainabilityRank: string;
  initiatives: string[];
}

function generateGreenData(uni: University): GreenData {
  const seed = hashId(uni.id);
  const rng = seededRandom(seed);
  const susScore = uni.pillars.sustainability;

  // Leaf rating 1-5 based on sustainability score
  const leafRating = susScore >= 93 ? 5 : susScore >= 85 ? 4 : susScore >= 70 ? 3 : susScore >= 50 ? 2 : 1;

  const carbonFootprint = susScore >= 90 ? "Carbon Neutral" : susScore >= 75 ? "Low Carbon" : susScore >= 55 ? "Moderate" : "Improving";

  // Pick 3-5 SDGs deterministically
  const shuffled = [...UN_SDGS].sort(() => rng() - 0.5);
  // Always include SDG 4 (Quality Education) and SDG 13 (Climate Action) for high sustainability
  const mandatory = susScore >= 70 ? [UN_SDGS[3], UN_SDGS[12]] : [UN_SDGS[3]];
  const extras = shuffled.filter((s) => !mandatory.some((m) => m.id === s.id)).slice(0, 3);
  const sdgs = [...mandatory, ...extras].map((s) => ({
    ...s,
    strength: Math.round((40 + rng() * (susScore * 0.6)) * 10) / 10,
  })).sort((a, b) => b.strength - a.strength);

  const sustainabilityRank = susScore >= 93 ? "Platinum" : susScore >= 85 ? "Gold" : susScore >= 70 ? "Silver" : susScore >= 50 ? "Bronze" : "Emerging";

  const allInitiatives = [
    "100% renewable energy campus",
    "Zero-waste policy by 2030",
    "Campus-wide EV charging stations",
    "Sustainable procurement mandate",
    "Biodiversity protection programs",
    "Green building certifications (LEED)",
    "Student sustainability fellowship",
    "Community solar panel project",
    "Water recycling and conservation",
    "Carbon offset investment fund",
    "Farm-to-table dining services",
    "Climate research endowment",
  ];
  const initCount = leafRating >= 4 ? 4 : leafRating >= 2 ? 3 : 2;
  const initiatives = [...allInitiatives].sort(() => rng() - 0.5).slice(0, initCount);

  return { leafRating, carbonFootprint, sdgs, sustainabilityRank, initiatives };
}

const RANK_COLORS: Record<string, string> = {
  Platinum: "bg-violet-500/15 text-violet-700",
  Gold: "bg-yellow-500/15 text-yellow-700",
  Silver: "bg-slate-400/15 text-slate-600",
  Bronze: "bg-amber-600/15 text-amber-700",
  Emerging: "bg-muted text-muted-foreground",
};

interface GreenIntelligenceProps {
  university: University;
}

const GreenIntelligence = ({ university }: GreenIntelligenceProps) => {
  const data = useMemo(() => generateGreenData(university), [university]);

  return (
    <div className="glass-card rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Green Intelligence</h2>
        </div>
        <Badge className={`text-xs font-bold ${RANK_COLORS[data.sustainabilityRank] || ""}`}>
          {data.sustainabilityRank} Tier
        </Badge>
      </div>

      {/* Leaf rating + Carbon */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Leaf
                key={i}
                className={`h-5 w-5 transition-colors ${
                  i < data.leafRating ? "text-green-500 fill-green-500/30" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <div>
            <p className="text-sm font-medium">{data.leafRating}/5 Eco Rating</p>
            <p className="text-xs text-muted-foreground">Sustainability Score: {university.pillars.sustainability.toFixed(1)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{data.carbonFootprint}</p>
          <p className="text-xs text-muted-foreground">Carbon Status</p>
        </div>
      </div>

      {/* UN SDGs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5" /> UN Sustainable Development Goals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.sdgs.map((sdg) => (
            <div
              key={sdg.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50"
            >
              <span className="text-lg shrink-0">{sdg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-medium truncate">SDG {sdg.id}: {sdg.name}</p>
                  <span className="text-[10px] font-mono text-muted-foreground ml-1">{sdg.strength}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${sdg.strength}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initiatives */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Key Initiatives
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {data.initiatives.map((init, i) => (
            <Badge key={i} variant="outline" className="text-[11px] font-normal">
              🌱 {init}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GreenIntelligence;
