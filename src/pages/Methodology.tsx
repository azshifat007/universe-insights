import { Brain, Target, BarChart3, Scale, Workflow, Database, Sigma, ShieldCheck, RefreshCw, GitBranch, Sparkles } from "lucide-react";
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
  academicReputation:
    "Based on the world's largest academic peer review survey. Over 150,000 responses from faculty worldwide assess teaching and research quality.",
  citationsPerFaculty:
    "Measures research impact by normalizing total citations from Scopus/Elsevier by the number of faculty members.",
  employerReputation:
    "Derived from a global employer survey of 100,000+ respondents, assessing which universities produce the most competent graduates.",
  facultyStudentRatio:
    "A proxy for teaching quality — higher ratios indicate more personalised attention and better learning outcomes.",
  internationalResearchNetwork:
    "Evaluates the breadth of international research collaboration using the Margalef Index across partner institutions.",
  employmentOutcomes:
    "Tracks graduate employment rates within 12 months, adjusted for regional economic conditions.",
  sustainability:
    "Assesses institutional commitment to UN Sustainable Development Goals through research output and campus initiatives.",
  internationalDiversity:
    "Combined measure of international student and faculty percentages, reflecting global appeal and diversity.",
};

const pillarDetails: Record<string, { source: string; formula: string; rationale: string }> = {
  academicReputation: {
    source: "Global Academic Survey (≈150K verified faculty responses, 5-year rolling window)",
    formula: "Z-score of weighted peer mentions → scaled to 0–100",
    rationale: "Captures the perceived strength of an institution among working scholars who actually publish in the field.",
  },
  citationsPerFaculty: {
    source: "Scopus / Elsevier publication & citation database (5-year window, self-citations excluded)",
    formula: "(Total citations ÷ Faculty count) → log-normalized → scaled 0–100",
    rationale: "Normalising by faculty size prevents large universities from dominating purely through volume.",
  },
  employerReputation: {
    source: "Global Employer Survey (≈100K hiring managers across 50+ industries)",
    formula: "Weighted mention count, capped per region, → scaled 0–100",
    rationale: "Reflects how the labour market actually values graduates — independent of academic prestige.",
  },
  facultyStudentRatio: {
    source: "Verified institutional submissions, cross-checked with public registries",
    formula: "Faculty FTE ÷ Student FTE → percentile rank → 0–100",
    rationale: "A simple but reliable proxy for teaching capacity and individual attention.",
  },
  internationalResearchNetwork: {
    source: "Co-authorship metadata from Scopus + ORCID partner-institution links",
    formula: "Margalef Index of unique partner countries / institutions → 0–100",
    rationale: "Rewards genuine global collaboration breadth, not just total paper count.",
  },
  employmentOutcomes: {
    source: "Graduate Outcomes Survey + LinkedIn employment signals (12-month post-graduation)",
    formula: "Employment rate adjusted by regional unemployment baseline → 0–100",
    rationale: "Controls for macroeconomic conditions so universities are compared fairly across regions.",
  },
  sustainability: {
    source: "UN SDG-mapped research output, campus ESG disclosures, THE Impact references",
    formula: "Composite of SDG publication share + governance score → 0–100",
    rationale: "Recognises institutions actively addressing climate, equity and responsible governance.",
  },
  internationalDiversity: {
    source: "International student & faculty enrolment data from institutional reporting",
    formula: "0.5 × Intl-Students% + 0.5 × Intl-Faculty% → percentile → 0–100",
    rationale: "Diversity of perspective is a measurable driver of research and teaching quality.",
  },
};

const pipelineSteps = [
  {
    icon: Database,
    title: "1. Data Ingestion",
    desc: "Raw indicators are pulled from Scopus, peer/employer surveys, institutional submissions and our verified partner APIs into the Lovable Cloud database.",
  },
  {
    icon: ShieldCheck,
    title: "2. Validation & Cleaning",
    desc: "Outliers are flagged, duplicates removed, and self-citations stripped. Each metric is checked against the previous year for sudden jumps before being accepted.",
  },
  {
    icon: Sigma,
    title: "3. Normalisation",
    desc: "Every raw indicator is converted to a 0–100 scale using log transforms and z-scores so wildly different units (citations, ratios, percentages) become directly comparable.",
  },
  {
    icon: Scale,
    title: "4. Weighted Aggregation",
    desc: "Normalised pillar scores are multiplied by their QS-2026 weights and summed to produce the Overall Score. Weights are configurable in the Admin Panel without redeploying.",
  },
  {
    icon: GitBranch,
    title: "5. Ranking & Tie-Breaking",
    desc: "Universities are sorted by Overall Score (1 decimal place). Ties are broken by Academic Reputation, then Citations per Faculty.",
  },
  {
    icon: RefreshCw,
    title: "6. Continuous Refresh",
    desc: "Scores re-render in the browser whenever weights change in Admin → Algorithm Settings, so you can immediately see the impact of methodology tweaks.",
  },
];

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
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Universe Analytics combines eight independently-measured pillars into a single, transparent
          0–100 Overall Score. Below is exactly how the data flows from raw indicator to final rank — no
          black boxes.
        </p>
      </div>

      {/* Core Idea */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">The Core Idea</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          A university's quality cannot be reduced to a single number — but it <em>can</em> be modelled.
          We measure eight orthogonal dimensions (research, teaching, employability, internationalisation,
          sustainability), normalise each to the same 0–100 scale, then combine them using transparent,
          editable weights inspired by the QS World University Rankings 2026 methodology.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The result is a score that is <span className="text-foreground font-semibold">comparable across countries</span>,
          <span className="text-foreground font-semibold"> resistant to gaming</span> (no single pillar
          can carry an institution), and <span className="text-foreground font-semibold">fully reproducible</span>
          — every input and weight is visible in the Admin Panel.
        </p>
      </div>

      {/* Formula */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Scoring Formula</h2>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code className="block mb-2">
            Overall<sub>u</sub> = Σ<sub>i=1..8</sub> ( Pillar<sub>i,u</sub> × Weight<sub>i</sub> )
          </code>
          <code className="block text-xs text-muted-foreground">
            subject to&nbsp;&nbsp;Σ Weight<sub>i</sub> = 1.0&nbsp;&nbsp;and&nbsp;&nbsp;0 ≤ Pillar<sub>i</sub> ≤ 100
          </code>
          <p className="text-xs text-muted-foreground mt-3 font-sans leading-relaxed">
            Each pillar is clamped into the [0, 100] range before weighting. The weighted sum is rounded to
            one decimal place and used as the canonical Overall Score. Because the weights are persisted in
            the database (table <code className="text-foreground">algorithm_settings</code>), an admin can
            re-tune the methodology and every page updates on the next render — no redeploy required.
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
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {pillarKeys.map((key) => (
            <span key={key} className="text-xs text-muted-foreground">
              {PILLAR_LABELS[key]}: <span className="font-semibold text-foreground">{(PILLAR_WEIGHTS[key] * 100).toFixed(0)}%</span>
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Research-related signals (Academic Reputation + Citations) intentionally dominate at <span className="text-foreground font-semibold">50%</span> combined,
          mirroring QS 2026. Outcome-and-impact signals (Employer Reputation, Employment, Sustainability,
          Diversity) make up the remaining 35%, and pure teaching capacity (Faculty–Student Ratio) contributes 10%.
        </p>
      </div>

      {/* Pipeline */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Workflow className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">How a Score Is Built — End to End</h2>
        </div>
        <ol className="space-y-3">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-secondary/15 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Worked Example */}
      <div className="glass-card-hover rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sigma className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Worked Example</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          A hypothetical institution with the following normalised pillar scores:
        </p>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left p-2 font-medium">Pillar</th>
                <th className="text-right p-2 font-medium">Score</th>
                <th className="text-right p-2 font-medium">Weight</th>
                <th className="text-right p-2 font-medium">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {pillarKeys.map((key) => {
                const exampleScores: Record<string, number> = {
                  academicReputation: 92, citationsPerFaculty: 88, employerReputation: 85,
                  facultyStudentRatio: 78, internationalResearchNetwork: 90, employmentOutcomes: 82,
                  sustainability: 75, internationalDiversity: 80,
                };
                const score = exampleScores[key];
                const weight = PILLAR_WEIGHTS[key];
                const contribution = score * weight;
                return (
                  <tr key={key} className="border-t border-border/50">
                    <td className="p-2">{PILLAR_LABELS[key]}</td>
                    <td className="p-2 text-right font-mono">{score}</td>
                    <td className="p-2 text-right font-mono">{(weight * 100).toFixed(0)}%</td>
                    <td className="p-2 text-right font-mono text-secondary">{contribution.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/30 font-bold">
                <td className="p-2" colSpan={3}>Overall Score</td>
                <td className="p-2 text-right font-mono text-secondary">
                  {pillarKeys.reduce((sum, key) => {
                    const exampleScores: Record<string, number> = {
                      academicReputation: 92, citationsPerFaculty: 88, employerReputation: 85,
                      facultyStudentRatio: 78, internationalResearchNetwork: 90, employmentOutcomes: 82,
                      sustainability: 75, internationalDiversity: 80,
                    };
                    return sum + exampleScores[key] * PILLAR_WEIGHTS[key];
                  }, 0).toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillar details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">The 8 Pillars Explained</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillarKeys.map((key) => {
            const detail = pillarDetails[key];
            return (
              <div key={key} className="glass-card-hover rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{pillarIcons[key]}</span>
                  <div>
                    <h3 className="font-display font-bold text-sm">{PILLAR_LABELS[key]}</h3>
                    <span className="text-xs font-semibold text-secondary">{(PILLAR_WEIGHTS[key] * 100).toFixed(0)}% weight</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{pillarDescriptions[key]}</p>
                <div className="space-y-1.5 text-[11px] border-t border-border/50 pt-3">
                  <p><span className="font-semibold text-foreground">Source: </span><span className="text-muted-foreground">{detail.source}</span></p>
                  <p><span className="font-semibold text-foreground">Formula: </span><span className="text-muted-foreground font-mono">{detail.formula}</span></p>
                  <p><span className="font-semibold text-foreground">Why it matters: </span><span className="text-muted-foreground">{detail.rationale}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Limitations */}
      <div className="glass-card-hover rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Limitations & Honest Caveats</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Survey-based pillars (Academic & Employer Reputation) inherently lag reality by 1–2 years.</li>
          <li>Citation counts favour STEM disciplines over humanities, where book-length scholarship dominates.</li>
          <li>Sustainability scoring depends on self-reported ESG data; we cross-check but cannot fully audit it.</li>
          <li>Smaller specialist institutions may rank lower than their per-capita performance suggests.</li>
          <li>The ranking is a model, not a verdict — use it alongside subject-specific signals and personal fit.</li>
        </ul>
      </div>
    </div>

    <DashboardFooter />
  </div>
);

export default Methodology;
