import { Brain, Target, BarChart3, Scale } from "lucide-react";
import { PILLAR_WEIGHTS, PILLAR_LABELS, PillarKey } from "@/data/universities";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

const pillarKeys = Object.keys(PILLAR_WEIGHTS) as PillarKey[];

const pillarIcons: Record<string, string> = {
  academicReputation: "🎓",
  citationsPerFaculty: "📄",
  employerReputation: "💼",
  facultyStudentRatio: "👨‍🏫",
  internationalResearchNetwork: "🌐",
  employmentOutcomes: "📈",
  sustainability: "🌱",
  internationalDiversity: "🌍",
};

const pillarDescriptions: Record<string, string> = {
  academicReputation: "Based on the world's largest academic peer review survey. Over 150,000 responses from faculty worldwide assess teaching and research quality.",
  citationsPerFaculty: "Measures research impact by normalizing total citations from Scopus/Elsevier by the number of faculty members.",
  employerReputation: "Derived from a global employer survey of 100,000+ respondents, assessing which universities produce the most competent graduates.",
  facultyStudentRatio: "A proxy for teaching quality — higher ratios indicate more personalised attention and better learning outcomes.",
  internationalResearchNetwork: "Evaluates the breadth of international research collaboration using the Margalef Index across partner institutions.",
  employmentOutcomes: "Tracks graduate employment rates within 12 months, adjusted for regional economic conditions.",
  sustainability: "Assesses institutional commitment to UN Sustainable Development Goals through research output and campus initiatives.",
  internationalDiversity: "Combined measure of international student and faculty percentages, reflecting global appeal and diversity.",
};

const Methodology = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />

    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium mb-4">
          <Brain className="h-3.5 w-3.5" />
          QS 2026 Model
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">The Smart Algorithm</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Our ranking methodology combines 8 weighted pillars to produce a comprehensive 0–100 overall score for each university.
        </p>
      </div>

      {/* Formula */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Scoring Formula</h2>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code>
            Overall = Σ (Pillar<sub>i</sub> × Weight<sub>i</sub>)
          </code>
          <p className="text-xs text-muted-foreground mt-2 font-sans">
            Each pillar is scored 0–100 and multiplied by its weight. The sum produces the final score.
          </p>
        </div>
      </div>

      {/* Weight breakdown bar */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Weight Distribution</h2>
        </div>
        <div className="flex rounded-lg overflow-hidden h-10 mb-4">
          {pillarKeys.map((key, i) => {
            const weight = PILLAR_WEIGHTS[key] * 100;
            const colors = [
              "bg-primary", "bg-secondary", "bg-navy-light", "bg-emerald-light",
              "bg-chart-5", "bg-accent", "bg-emerald", "bg-navy",
            ];
            return (
              <div
                key={key}
                className={`${colors[i]} flex items-center justify-center text-xs font-bold text-primary-foreground`}
                style={{ width: `${weight}%` }}
                title={`${PILLAR_LABELS[key]}: ${weight}%`}
              >
                {weight >= 10 ? `${weight}%` : ""}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {pillarKeys.map((key) => (
            <span key={key} className="text-xs text-muted-foreground">
              {PILLAR_LABELS[key]}: <span className="font-semibold text-foreground">{(PILLAR_WEIGHTS[key] * 100).toFixed(0)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pillar details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">The 8 Pillars Explained</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillarKeys.map((key) => (
            <div key={key} className="glass-card-hover rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{pillarIcons[key]}</span>
                <div>
                  <h3 className="font-display font-bold text-sm">{PILLAR_LABELS[key]}</h3>
                  <span className="text-xs font-semibold text-secondary">{(PILLAR_WEIGHTS[key] * 100).toFixed(0)}% weight</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{pillarDescriptions[key]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <DashboardFooter />
  </div>
);

export default Methodology;
