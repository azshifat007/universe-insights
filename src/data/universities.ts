/**
 * Universe Analytics — Smart Algorithm Engine
 * =============================================
 * Implements the QS 2026 World University Rankings methodology.
 *
 * The Overall Score (0–100) is a weighted average of 8 pillars:
 *
 *   1. Academic Reputation        — 30%  (peer review surveys)
 *   2. Citations per Faculty       — 20%  (research impact normalised by faculty size)
 *   3. Employer Reputation         — 15%  (graduate employability surveys)
 *   4. Faculty-to-Student Ratio    — 10%  (teaching capacity indicator)
 *   5. International Research Net  —  5%  (breadth of global collaboration)
 *   6. Employment Outcomes         —  5%  (graduate employment rate)
 *   7. Sustainability              —  5%  (ESG / SDG commitment score)
 *   8. Intl Student & Faculty %    — 10%  (combined internationalisation measure)
 *
 * Each pillar score is on a 0–100 scale. The final score is:
 *   overall = Σ (pillar_i × weight_i)
 */

// ─── Pillar weights (must sum to 1.0) ───────────────────────────────────────
export const PILLAR_WEIGHTS = {
  academicReputation: 0.30,
  citationsPerFaculty: 0.20,
  employerReputation: 0.15,
  facultyStudentRatio: 0.10,
  internationalResearchNetwork: 0.05,
  employmentOutcomes: 0.05,
  sustainability: 0.05,
  internationalDiversity: 0.10,
} as const;

export type PillarKey = keyof typeof PILLAR_WEIGHTS;

export const PILLAR_LABELS: Record<PillarKey, string> = {
  academicReputation: "Academic Reputation",
  citationsPerFaculty: "Citations / Faculty",
  employerReputation: "Employer Reputation",
  facultyStudentRatio: "Faculty–Student Ratio",
  internationalResearchNetwork: "Intl Research Network",
  employmentOutcomes: "Employment Outcomes",
  sustainability: "Sustainability",
  internationalDiversity: "Intl Diversity",
};

export type PillarScores = Record<PillarKey, number>;

/**
 * Calculate the weighted overall score.
 * Clamps each pillar to [0, 100] before weighting.
 */
export function calculateOverallScore(pillars: PillarScores): number {
  let total = 0;
  for (const key of Object.keys(PILLAR_WEIGHTS) as PillarKey[]) {
    const clamped = Math.max(0, Math.min(100, pillars[key]));
    total += clamped * PILLAR_WEIGHTS[key];
  }
  return Math.round(total * 10) / 10;
}

/**
 * Simulate score growth by a growth factor (0-100 slider value).
 * Factor 50 = no change, <50 = decline, >50 = improvement.
 */
export function projectScores(pillars: PillarScores, growthFactor: number): PillarScores {
  const multiplier = 1 + (growthFactor - 50) / 500; // ±10% range
  const result = { ...pillars };
  for (const key of Object.keys(result) as PillarKey[]) {
    result[key] = Math.round(Math.min(100, Math.max(0, result[key] * multiplier)) * 10) / 10;
  }
  return result;
}

// ─── University interface ───────────────────────────────────────────────────
export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  founded: number;
  students: number;
  researchFocus: string;
  logo: string; // emoji placeholder
  domain: string; // official website domain for Logo.dev
  pillars: PillarScores;
  overallScore: number;
  rank: number;
  trend: number[]; // rank positions for last 6 months
  highlights: string[];
}

// ─── Seed data ──────────────────────────────────────────────────────────────
const RAW: Omit<University, "overallScore" | "rank">[] = [
  {
    id: "mit", name: "Massachusetts Institute of Technology", country: "USA", city: "Cambridge, MA", founded: 1861, students: 11520, researchFocus: "Engineering & Technology", logo: "🏛️", domain: "mit.edu",
    pillars: { academicReputation: 100, citationsPerFaculty: 99.5, employerReputation: 100, facultyStudentRatio: 98.2, internationalResearchNetwork: 96.1, employmentOutcomes: 99.0, sustainability: 91.3, internationalDiversity: 94.7 },
    trend: [1, 1, 1, 1, 1, 1], highlights: ["$2.1B annual research expenditure", "97 Nobel laureates affiliated", "Top AI & Robotics lab globally"],
  },
  {
    id: "oxford", name: "University of Oxford", country: "UK", city: "Oxford", founded: 1096, students: 26015, researchFocus: "Humanities & Sciences", logo: "🎓", domain: "ox.ac.uk",
    pillars: { academicReputation: 99.5, citationsPerFaculty: 92.4, employerReputation: 99.8, facultyStudentRatio: 97.5, internationalResearchNetwork: 98.7, employmentOutcomes: 97.6, sustainability: 95.8, internationalDiversity: 97.2 },
    trend: [3, 2, 2, 3, 2, 2], highlights: ["Oldest English-speaking university", "Leading in vaccine research", "Rhodes Scholarship host"],
  },
  {
    id: "stanford", name: "Stanford University", country: "USA", city: "Stanford, CA", founded: 1885, students: 17249, researchFocus: "Technology & Business", logo: "🌲", domain: "stanford.edu",
    pillars: { academicReputation: 98.7, citationsPerFaculty: 98.1, employerReputation: 99.5, facultyStudentRatio: 96.8, internationalResearchNetwork: 93.2, employmentOutcomes: 99.5, sustainability: 89.7, internationalDiversity: 91.4 },
    trend: [2, 3, 3, 2, 3, 3], highlights: ["Silicon Valley innovation hub", "$37.8B endowment", "85+ startups per year"],
  },
  {
    id: "cambridge", name: "University of Cambridge", country: "UK", city: "Cambridge", founded: 1209, students: 24450, researchFocus: "Sciences & Mathematics", logo: "📚", domain: "cam.ac.uk",
    pillars: { academicReputation: 99.2, citationsPerFaculty: 91.8, employerReputation: 98.9, facultyStudentRatio: 96.3, internationalResearchNetwork: 97.5, employmentOutcomes: 96.2, sustainability: 94.1, internationalDiversity: 96.5 },
    trend: [4, 4, 4, 4, 4, 4], highlights: ["121 Nobel Prize winners", "Cavendish Laboratory breakthroughs", "Cambridge University Press since 1534"],
  },
  {
    id: "eth", name: "ETH Zurich", country: "Switzerland", city: "Zurich", founded: 1855, students: 23500, researchFocus: "Engineering & Natural Sciences", logo: "⚙️", domain: "ethz.ch",
    pillars: { academicReputation: 96.5, citationsPerFaculty: 97.3, employerReputation: 90.2, facultyStudentRatio: 91.5, internationalResearchNetwork: 99.1, employmentOutcomes: 88.4, sustainability: 97.5, internationalDiversity: 98.3 },
    trend: [5, 5, 5, 5, 5, 5], highlights: ["21 Nobel Prize winners including Einstein", "Top European engineering school", "World-class quantum computing research"],
  },
  {
    id: "nus", name: "National University of Singapore", country: "Singapore", city: "Singapore", founded: 1905, students: 43000, researchFocus: "Technology & Medicine", logo: "🦁", domain: "nus.edu.sg",
    pillars: { academicReputation: 89.7, citationsPerFaculty: 85.3, employerReputation: 95.8, facultyStudentRatio: 82.6, internationalResearchNetwork: 88.1, employmentOutcomes: 93.2, sustainability: 90.4, internationalDiversity: 92.7 },
    trend: [7, 6, 6, 6, 6, 6], highlights: ["Asia's leading research university", "Deep tech startup ecosystem", "Global health innovation center"],
  },
  {
    id: "utokyo", name: "University of Tokyo", country: "Japan", city: "Tokyo", founded: 1877, students: 28171, researchFocus: "Sciences & Engineering", logo: "🗾", domain: "u-tokyo.ac.jp",
    pillars: { academicReputation: 95.2, citationsPerFaculty: 78.4, employerReputation: 92.7, facultyStudentRatio: 88.3, internationalResearchNetwork: 81.5, employmentOutcomes: 90.1, sustainability: 87.6, internationalDiversity: 68.2 },
    trend: [6, 7, 7, 7, 7, 7], highlights: ["11 Nobel Prize laureates", "Japan's premier research institution", "Leading robotics & materials science"],
  },
  {
    id: "tsinghua", name: "Tsinghua University", country: "China", city: "Beijing", founded: 1911, students: 53302, researchFocus: "Engineering & Computer Science", logo: "🏯", domain: "tsinghua.edu.cn",
    pillars: { academicReputation: 92.1, citationsPerFaculty: 93.6, employerReputation: 88.3, facultyStudentRatio: 79.5, internationalResearchNetwork: 82.4, employmentOutcomes: 91.8, sustainability: 85.2, internationalDiversity: 61.3 },
    trend: [10, 9, 9, 8, 8, 8], highlights: ["China's top engineering school", "Major AI research publications", "Leading chip design research"],
  },
  {
    id: "melbourne", name: "University of Melbourne", country: "Australia", city: "Melbourne", founded: 1853, students: 52000, researchFocus: "Medicine & Life Sciences", logo: "🦘", domain: "unimelb.edu.au",
    pillars: { academicReputation: 88.5, citationsPerFaculty: 80.2, employerReputation: 87.6, facultyStudentRatio: 75.8, internationalResearchNetwork: 89.3, employmentOutcomes: 82.1, sustainability: 92.7, internationalDiversity: 95.4 },
    trend: [8, 8, 8, 9, 9, 9], highlights: ["#1 in Australia consistently", "Biomedical research powerhouse", "Pioneering cochlear implant research"],
  },
  {
    id: "toronto", name: "University of Toronto", country: "Canada", city: "Toronto", founded: 1827, students: 97000, researchFocus: "AI & Health Sciences", logo: "🍁", domain: "utoronto.ca",
    pillars: { academicReputation: 90.1, citationsPerFaculty: 82.7, employerReputation: 85.4, facultyStudentRatio: 72.3, internationalResearchNetwork: 87.6, employmentOutcomes: 84.5, sustainability: 89.3, internationalDiversity: 90.8 },
    trend: [9, 10, 10, 10, 10, 10], highlights: ["Birthplace of deep learning", "Vector Institute for AI partnership", "Largest university in Canada"],
  },
  {
    id: "seoul", name: "Seoul National University", country: "South Korea", city: "Seoul", founded: 1946, students: 28378, researchFocus: "Technology & Engineering", logo: "🇰🇷", domain: "snu.ac.kr",
    pillars: { academicReputation: 85.3, citationsPerFaculty: 76.1, employerReputation: 88.9, facultyStudentRatio: 80.7, internationalResearchNetwork: 74.5, employmentOutcomes: 87.3, sustainability: 82.1, internationalDiversity: 65.8 },
    trend: [11, 11, 12, 11, 11, 11], highlights: ["Korea's flagship university", "Semiconductor research leader", "Strong Samsung/SK partnerships"],
  },
  {
    id: "lmu", name: "Ludwig Maximilian University", country: "Germany", city: "Munich", founded: 1472, students: 52425, researchFocus: "Natural Sciences & Medicine", logo: "🇩🇪", domain: "lmu.de",
    pillars: { academicReputation: 86.8, citationsPerFaculty: 74.5, employerReputation: 82.3, facultyStudentRatio: 71.2, internationalResearchNetwork: 85.4, employmentOutcomes: 80.6, sustainability: 88.7, internationalDiversity: 78.9 },
    trend: [12, 12, 11, 12, 12, 12], highlights: ["Max Planck Society partner", "42 Nobel Prize connections", "Elite German Excellence University"],
  },
  {
    id: "iitb", name: "Indian Institute of Technology Bombay", country: "India", city: "Mumbai", founded: 1958, students: 12000, researchFocus: "Engineering & CS", logo: "🇮🇳", domain: "iitb.ac.in",
    pillars: { academicReputation: 72.5, citationsPerFaculty: 81.3, employerReputation: 84.7, facultyStudentRatio: 85.2, internationalResearchNetwork: 62.1, employmentOutcomes: 88.9, sustainability: 71.4, internationalDiversity: 42.8 },
    trend: [14, 13, 13, 13, 13, 13], highlights: ["India's premier tech institute", "Highest employer demand in Asia", "Strong Silicon Valley alumni network"],
  },
  {
    id: "usp", name: "University of São Paulo", country: "Brazil", city: "São Paulo", founded: 1934, students: 95000, researchFocus: "Medicine & Agriculture", logo: "🇧🇷", domain: "usp.br",
    pillars: { academicReputation: 80.2, citationsPerFaculty: 59.8, employerReputation: 78.5, facultyStudentRatio: 65.3, internationalResearchNetwork: 71.4, employmentOutcomes: 72.1, sustainability: 83.5, internationalDiversity: 45.2 },
    trend: [13, 14, 14, 14, 14, 14], highlights: ["Latin America's #1 research output", "Tropical disease research leader", "15 campus locations across São Paulo state"],
  },
  {
    id: "uct", name: "University of Cape Town", country: "South Africa", city: "Cape Town", founded: 1829, students: 29000, researchFocus: "Health & Development", logo: "🇿🇦", domain: "uct.ac.za",
    pillars: { academicReputation: 68.4, citationsPerFaculty: 55.7, employerReputation: 65.8, facultyStudentRatio: 62.1, internationalResearchNetwork: 72.8, employmentOutcomes: 61.3, sustainability: 78.9, internationalDiversity: 70.5 },
    trend: [15, 15, 15, 15, 15, 15], highlights: ["Africa's leading university", "Heart transplant pioneering institution", "HIV/AIDS research center of excellence"],
  },
  // ─── Bangladesh — Top Private Universities ─────────────────────────────────
  {
    id: "nsu", name: "North South University", country: "Bangladesh", city: "Dhaka", founded: 1992, students: 27000, researchFocus: "Business & Technology", logo: "🇧🇩", domain: "northsouth.edu",
    pillars: { academicReputation: 52.3, citationsPerFaculty: 48.1, employerReputation: 58.7, facultyStudentRatio: 55.4, internationalResearchNetwork: 38.2, employmentOutcomes: 62.5, sustainability: 45.8, internationalDiversity: 35.1 },
    trend: [18, 17, 17, 16, 16, 16], highlights: ["First private university in Bangladesh", "Strong business school reputation", "AACSB-aspiring MBA program"],
  },
  {
    id: "bracu", name: "BRAC University", country: "Bangladesh", city: "Dhaka", founded: 2001, students: 10000, researchFocus: "Development & CS", logo: "🇧🇩", domain: "bracu.ac.bd",
    pillars: { academicReputation: 50.1, citationsPerFaculty: 52.4, employerReputation: 55.2, facultyStudentRatio: 58.3, internationalResearchNetwork: 42.7, employmentOutcomes: 59.1, sustainability: 54.6, internationalDiversity: 30.5 },
    trend: [19, 18, 18, 17, 17, 17], highlights: ["Backed by BRAC — world's largest NGO", "Strong CS & EEE programs", "Active research in development studies"],
  },
  {
    id: "iub", name: "Independent University, Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 1993, students: 8500, researchFocus: "Liberal Arts & Business", logo: "🇧🇩", domain: "iub.edu.bd",
    pillars: { academicReputation: 47.8, citationsPerFaculty: 44.2, employerReputation: 52.6, facultyStudentRatio: 56.1, internationalResearchNetwork: 35.8, employmentOutcomes: 55.3, sustainability: 42.1, internationalDiversity: 28.7 },
    trend: [20, 19, 19, 18, 18, 18], highlights: ["Pioneer in liberal arts education in BD", "Strong media & journalism program", "International faculty exchange programs"],
  },
  {
    id: "ewu", name: "East West University", country: "Bangladesh", city: "Dhaka", founded: 1996, students: 9200, researchFocus: "Engineering & Pharmacy", logo: "🇧🇩", domain: "ewubd.edu",
    pillars: { academicReputation: 45.5, citationsPerFaculty: 42.8, employerReputation: 50.1, facultyStudentRatio: 53.7, internationalResearchNetwork: 33.4, employmentOutcomes: 53.8, sustainability: 40.5, internationalDiversity: 26.2 },
    trend: [21, 20, 20, 19, 19, 19], highlights: ["Leading pharmacy research in Bangladesh", "Strong industry partnerships", "Modern campus in heart of Dhaka"],
  },
  {
    id: "aiub", name: "American International University-Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 1994, students: 12000, researchFocus: "Engineering & CS", logo: "🇧🇩", domain: "aiub.edu",
    pillars: { academicReputation: 46.2, citationsPerFaculty: 43.5, employerReputation: 54.8, facultyStudentRatio: 52.1, internationalResearchNetwork: 34.9, employmentOutcomes: 58.2, sustainability: 41.3, internationalDiversity: 27.8 },
    trend: [22, 21, 21, 20, 20, 20], highlights: ["IEEE-affiliated research groups", "Largest engineering intake in BD", "Industry-ready curriculum focus"],
  },
  {
    id: "ulab", name: "University of Liberal Arts Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 2004, students: 5500, researchFocus: "Arts & Humanities", logo: "🇧🇩", domain: "ulab.edu.bd",
    pillars: { academicReputation: 43.1, citationsPerFaculty: 40.6, employerReputation: 48.3, facultyStudentRatio: 60.2, internationalResearchNetwork: 36.5, employmentOutcomes: 50.7, sustainability: 47.2, internationalDiversity: 25.4 },
    trend: [23, 22, 22, 21, 21, 21], highlights: ["Bangladesh's first liberal arts university", "Award-winning media & film department", "Center for Bangladeshi Studies"],
  },
  // ─── More Famous World Universities ────────────────────────────────────────
  {
    id: "harvard", name: "Harvard University", country: "USA", city: "Cambridge, MA", founded: 1636, students: 21000, researchFocus: "Law & Medicine", logo: "🏛️", domain: "harvard.edu",
    pillars: { academicReputation: 100, citationsPerFaculty: 98.7, employerReputation: 100, facultyStudentRatio: 97.1, internationalResearchNetwork: 95.8, employmentOutcomes: 99.2, sustainability: 93.5, internationalDiversity: 89.6 },
    trend: [2, 2, 3, 3, 2, 2], highlights: ["Oldest university in the USA", "$50.9B endowment — world's largest", "161 Nobel laureates affiliated"],
  },
  {
    id: "caltech", name: "California Institute of Technology", country: "USA", city: "Pasadena, CA", founded: 1891, students: 2240, researchFocus: "Physics & Engineering", logo: "🔬", domain: "caltech.edu",
    pillars: { academicReputation: 96.2, citationsPerFaculty: 100, employerReputation: 88.5, facultyStudentRatio: 100, internationalResearchNetwork: 91.4, employmentOutcomes: 92.3, sustainability: 86.1, internationalDiversity: 88.9 },
    trend: [6, 6, 5, 5, 6, 6], highlights: ["NASA's JPL management", "Highest citations per faculty globally", "46 Nobel laureates"],
  },
  {
    id: "imperial", name: "Imperial College London", country: "UK", city: "London", founded: 1907, students: 22000, researchFocus: "Engineering & Medicine", logo: "🇬🇧", domain: "imperial.ac.uk",
    pillars: { academicReputation: 93.8, citationsPerFaculty: 94.2, employerReputation: 93.1, facultyStudentRatio: 90.4, internationalResearchNetwork: 96.3, employmentOutcomes: 91.7, sustainability: 90.2, internationalDiversity: 97.8 },
    trend: [8, 7, 7, 6, 7, 7], highlights: ["World-leading biomedical engineering", "Fleming discovered penicillin here", "Top employer connections in London"],
  },
  {
    id: "yale", name: "Yale University", country: "USA", city: "New Haven, CT", founded: 1701, students: 14776, researchFocus: "Law & Arts", logo: "🏛️", domain: "yale.edu",
    pillars: { academicReputation: 97.5, citationsPerFaculty: 89.3, employerReputation: 96.8, facultyStudentRatio: 95.6, internationalResearchNetwork: 88.2, employmentOutcomes: 97.1, sustainability: 91.8, internationalDiversity: 82.4 },
    trend: [9, 9, 8, 8, 9, 9], highlights: ["5 US Presidents alumni", "World-class law & drama schools", "Sterling Memorial Library — 15M volumes"],
  },
  {
    id: "ucl", name: "University College London", country: "UK", city: "London", founded: 1826, students: 49000, researchFocus: "Medicine & Social Sciences", logo: "🇬🇧", domain: "ucl.ac.uk",
    pillars: { academicReputation: 91.5, citationsPerFaculty: 86.8, employerReputation: 89.2, facultyStudentRatio: 78.3, internationalResearchNetwork: 94.7, employmentOutcomes: 86.5, sustainability: 91.4, internationalDiversity: 96.1 },
    trend: [10, 10, 9, 9, 10, 10], highlights: ["London's global university", "30 Nobel Prize winners", "Pioneering neuroscience research"],
  },
  {
    id: "peking", name: "Peking University", country: "China", city: "Beijing", founded: 1898, students: 46000, researchFocus: "Sciences & Humanities", logo: "🏯", domain: "pku.edu.cn",
    pillars: { academicReputation: 90.4, citationsPerFaculty: 88.5, employerReputation: 86.7, facultyStudentRatio: 77.8, internationalResearchNetwork: 80.3, employmentOutcomes: 89.4, sustainability: 83.7, internationalDiversity: 58.2 },
    trend: [12, 11, 11, 10, 11, 11], highlights: ["China's most prestigious university", "Birthplace of the May Fourth Movement", "Leading in Chinese humanities research"],
  },
  {
    id: "columbia", name: "Columbia University", country: "USA", city: "New York, NY", founded: 1754, students: 33413, researchFocus: "Journalism & Law", logo: "🏛️", domain: "columbia.edu",
    pillars: { academicReputation: 95.1, citationsPerFaculty: 87.6, employerReputation: 94.3, facultyStudentRatio: 88.7, internationalResearchNetwork: 90.1, employmentOutcomes: 95.4, sustainability: 87.9, internationalDiversity: 85.3 },
    trend: [11, 12, 12, 11, 12, 12], highlights: ["Pulitzer Prize administrator", "NYC location — global finance hub", "100+ Nobel laureates affiliated"],
  },
  {
    id: "kyoto", name: "Kyoto University", country: "Japan", city: "Kyoto", founded: 1897, students: 22700, researchFocus: "Sciences & Philosophy", logo: "🗾", domain: "kyoto-u.ac.jp",
    pillars: { academicReputation: 84.2, citationsPerFaculty: 75.8, employerReputation: 83.6, facultyStudentRatio: 86.1, internationalResearchNetwork: 78.3, employmentOutcomes: 85.7, sustainability: 84.5, internationalDiversity: 60.4 },
    trend: [16, 15, 15, 14, 14, 14], highlights: ["11 Nobel Prize winners", "Japan's 2nd oldest imperial university", "iPS cell research pioneer — Shinya Yamanaka"],
  },
  // ─── Additional World Universities ──────────────────────────────────────────
  {
    id: "sorbonne", name: "Sorbonne University", country: "France", city: "Paris", founded: 1257, students: 55000, researchFocus: "Sciences & Humanities", logo: "🇫🇷", domain: "sorbonne-universite.fr",
    pillars: { academicReputation: 87.3, citationsPerFaculty: 82.1, employerReputation: 80.5, facultyStudentRatio: 70.2, internationalResearchNetwork: 88.4, employmentOutcomes: 78.9, sustainability: 86.3, internationalDiversity: 82.7 },
    trend: [14, 13, 13, 13, 12, 12], highlights: ["Oldest university in Paris", "Marie Curie's research home", "Leading European humanities center"],
  },
  {
    id: "karolinska", name: "Karolinska Institute", country: "Sweden", city: "Stockholm", founded: 1810, students: 8500, researchFocus: "Medicine & Health", logo: "🇸🇪", domain: "ki.se",
    pillars: { academicReputation: 88.1, citationsPerFaculty: 91.5, employerReputation: 78.3, facultyStudentRatio: 89.4, internationalResearchNetwork: 92.7, employmentOutcomes: 82.6, sustainability: 94.8, internationalDiversity: 85.3 },
    trend: [13, 14, 14, 14, 13, 13], highlights: ["Awards the Nobel Prize in Medicine", "World-leading biomedical research", "Top medical university in Europe"],
  },
  {
    id: "unam", name: "National Autonomous University of Mexico", country: "Mexico", city: "Mexico City", founded: 1551, students: 360000, researchFocus: "Sciences & Arts", logo: "🇲🇽", domain: "unam.mx",
    pillars: { academicReputation: 78.5, citationsPerFaculty: 55.2, employerReputation: 76.8, facultyStudentRatio: 52.3, internationalResearchNetwork: 68.7, employmentOutcomes: 70.4, sustainability: 80.2, internationalDiversity: 40.1 },
    trend: [18, 18, 17, 17, 16, 16], highlights: ["UNESCO World Heritage campus", "Largest university in Latin America", "Leading Spanish-language research output"],
  },
  {
    id: "leiden", name: "Leiden University", country: "Netherlands", city: "Leiden", founded: 1575, students: 32000, researchFocus: "Law & Governance", logo: "🇳🇱", domain: "universiteitleiden.nl",
    pillars: { academicReputation: 82.4, citationsPerFaculty: 79.8, employerReputation: 76.1, facultyStudentRatio: 74.5, internationalResearchNetwork: 90.2, employmentOutcomes: 77.3, sustainability: 88.9, internationalDiversity: 86.5 },
    trend: [17, 16, 16, 15, 15, 15], highlights: ["Oldest university in Netherlands", "Einstein was a professor here", "International Court of Justice partner"],
  },
  {
    id: "cairo", name: "Cairo University", country: "Egypt", city: "Cairo", founded: 1908, students: 155000, researchFocus: "Medicine & Engineering", logo: "🇪🇬", domain: "cu.edu.eg",
    pillars: { academicReputation: 65.2, citationsPerFaculty: 45.8, employerReputation: 62.7, facultyStudentRatio: 48.3, internationalResearchNetwork: 52.1, employmentOutcomes: 58.6, sustainability: 55.3, internationalDiversity: 38.2 },
    trend: [22, 21, 21, 20, 19, 19], highlights: ["Oldest modern university in Africa/Middle East", "Leading Arab-world research output", "Prominent medical school in MENA"],
  },
  {
    id: "moscow", name: "Lomonosov Moscow State University", country: "Russia", city: "Moscow", founded: 1755, students: 47000, researchFocus: "Physics & Mathematics", logo: "🇷🇺", domain: "msu.ru",
    pillars: { academicReputation: 83.6, citationsPerFaculty: 62.4, employerReputation: 80.1, facultyStudentRatio: 72.8, internationalResearchNetwork: 65.3, employmentOutcomes: 76.5, sustainability: 70.2, internationalDiversity: 55.8 },
    trend: [16, 15, 15, 16, 17, 17], highlights: ["Russia's oldest and largest university", "13 Nobel Prize winners", "Iconic Stalinist skyscraper campus"],
  },
  {
    id: "technion", name: "Technion — Israel Institute of Technology", country: "Israel", city: "Haifa", founded: 1912, students: 14000, researchFocus: "Engineering & CS", logo: "🇮🇱", domain: "technion.ac.il",
    pillars: { academicReputation: 79.8, citationsPerFaculty: 88.6, employerReputation: 82.4, facultyStudentRatio: 83.5, internationalResearchNetwork: 80.1, employmentOutcomes: 86.7, sustainability: 76.3, internationalDiversity: 60.2 },
    trend: [15, 16, 16, 15, 14, 14], highlights: ["4 Nobel Prize winners", "Israel's MIT", "Iron Dome technology origins"],
  },
  {
    id: "kaust", name: "King Abdullah University of Science & Technology", country: "Saudi Arabia", city: "Thuwal", founded: 2009, students: 1200, researchFocus: "Energy & Environmental Science", logo: "🇸🇦", domain: "kaust.edu.sa",
    pillars: { academicReputation: 62.5, citationsPerFaculty: 95.2, employerReputation: 58.3, facultyStudentRatio: 98.7, internationalResearchNetwork: 78.4, employmentOutcomes: 65.8, sustainability: 82.1, internationalDiversity: 96.4 },
    trend: [20, 19, 18, 17, 16, 16], highlights: ["Highest citations per faculty in Middle East", "$20B endowment", "100% graduate-level institution"],
  },
  {
    id: "nairobi", name: "University of Nairobi", country: "Kenya", city: "Nairobi", founded: 1956, students: 84000, researchFocus: "Agriculture & Public Health", logo: "🇰🇪", domain: "uonbi.ac.ke",
    pillars: { academicReputation: 55.8, citationsPerFaculty: 38.5, employerReputation: 56.2, facultyStudentRatio: 42.7, internationalResearchNetwork: 48.3, employmentOutcomes: 52.1, sustainability: 58.7, internationalDiversity: 35.4 },
    trend: [25, 24, 24, 23, 22, 22], highlights: ["East Africa's leading university", "Wangari Maathai's alma mater", "Key partner in tropical disease research"],
  },
  {
    id: "uba", name: "University of Buenos Aires", country: "Argentina", city: "Buenos Aires", founded: 1821, students: 328000, researchFocus: "Law & Social Sciences", logo: "🇦🇷", domain: "uba.ar",
    pillars: { academicReputation: 76.4, citationsPerFaculty: 52.3, employerReputation: 74.8, facultyStudentRatio: 48.5, internationalResearchNetwork: 62.5, employmentOutcomes: 68.3, sustainability: 72.1, internationalDiversity: 42.7 },
    trend: [19, 19, 19, 18, 18, 18], highlights: ["5 Nobel Prize winners", "Largest university in Argentina", "Free public university tradition"],
  },
  // ─── Bangladesh — Government Universities ──────────────────────────────────
  {
    id: "du", name: "University of Dhaka", country: "Bangladesh", city: "Dhaka", founded: 1921, students: 37018, researchFocus: "Sciences & Social Sciences", logo: "🇧🇩", domain: "du.ac.bd",
    pillars: { academicReputation: 58.7, citationsPerFaculty: 42.3, employerReputation: 62.4, facultyStudentRatio: 45.8, internationalResearchNetwork: 40.1, employmentOutcomes: 60.2, sustainability: 48.5, internationalDiversity: 22.3 },
    trend: [16, 16, 16, 15, 15, 15], highlights: ["Oxford of the East", "Played pivotal role in 1952 Language Movement", "Bangladesh's oldest and largest public university"],
  },
  {
    id: "buet", name: "Bangladesh University of Engineering & Technology", country: "Bangladesh", city: "Dhaka", founded: 1962, students: 7000, researchFocus: "Engineering & Architecture", logo: "🇧🇩", domain: "buet.ac.bd",
    pillars: { academicReputation: 56.4, citationsPerFaculty: 50.8, employerReputation: 64.5, facultyStudentRatio: 62.3, internationalResearchNetwork: 37.6, employmentOutcomes: 68.7, sustainability: 44.2, internationalDiversity: 18.5 },
    trend: [17, 17, 16, 16, 16, 16], highlights: ["Top engineering institution in Bangladesh", "ICPC World Finals regular participant", "Highest employer demand among BD engineers"],
  },
  {
    id: "ru", name: "University of Rajshahi", country: "Bangladesh", city: "Rajshahi", founded: 1953, students: 33000, researchFocus: "Agriculture & Sciences", logo: "🇧🇩", domain: "ru.ac.bd",
    pillars: { academicReputation: 48.5, citationsPerFaculty: 38.2, employerReputation: 50.1, facultyStudentRatio: 44.7, internationalResearchNetwork: 32.5, employmentOutcomes: 52.3, sustainability: 46.8, internationalDiversity: 15.2 },
    trend: [22, 21, 21, 20, 20, 20], highlights: ["2nd oldest university in Bangladesh", "Leading agricultural research in NW Bangladesh", "763-acre green campus — largest in BD"],
  },
  {
    id: "cu", name: "University of Chittagong", country: "Bangladesh", city: "Chittagong", founded: 1966, students: 27000, researchFocus: "Marine Sciences & Business", logo: "🇧🇩", domain: "cu.ac.bd",
    pillars: { academicReputation: 46.2, citationsPerFaculty: 36.5, employerReputation: 48.8, facultyStudentRatio: 43.2, internationalResearchNetwork: 30.8, employmentOutcomes: 50.6, sustainability: 45.1, internationalDiversity: 14.8 },
    trend: [24, 23, 23, 22, 22, 22], highlights: ["Major port-city university", "Institute of Marine Sciences and Fisheries", "Largest campus area in Bangladesh — 2,100 acres"],
  },
  {
    id: "ju", name: "Jahangirnagar University", country: "Bangladesh", city: "Savar, Dhaka", founded: 1970, students: 15000, researchFocus: "Sciences & Social Sciences", logo: "🇧🇩", domain: "juniv.edu",
    pillars: { academicReputation: 47.1, citationsPerFaculty: 39.4, employerReputation: 49.5, facultyStudentRatio: 48.6, internationalResearchNetwork: 31.2, employmentOutcomes: 51.8, sustainability: 50.3, internationalDiversity: 13.5 },
    trend: [23, 22, 22, 21, 21, 21], highlights: ["Only fully residential public university in BD", "Migratory bird sanctuary on campus", "Strong mathematics and physics departments"],
  },
  {
    id: "kuet", name: "Khulna University of Engineering & Technology", country: "Bangladesh", city: "Khulna", founded: 2003, students: 5500, researchFocus: "Engineering & Technology", logo: "🇧🇩", domain: "kuet.ac.bd",
    pillars: { academicReputation: 42.8, citationsPerFaculty: 40.1, employerReputation: 48.2, facultyStudentRatio: 55.7, internationalResearchNetwork: 28.4, employmentOutcomes: 54.6, sustainability: 41.9, internationalDiversity: 12.1 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Leading engineering university in SW Bangladesh", "Strong renewable energy research", "Growing industrial partnerships in Khulna region"],
  },
  {
    id: "bau", name: "Bangladesh Agricultural University", country: "Bangladesh", city: "Mymensingh", founded: 1961, students: 5200, researchFocus: "Agriculture & Veterinary", logo: "🇧🇩", domain: "bau.edu.bd",
    pillars: { academicReputation: 44.5, citationsPerFaculty: 41.7, employerReputation: 46.3, facultyStudentRatio: 50.2, internationalResearchNetwork: 35.8, employmentOutcomes: 49.1, sustainability: 55.4, internationalDiversity: 16.7 },
    trend: [25, 24, 24, 23, 23, 23], highlights: ["Top agricultural university in South Asia", "Pioneering rice and fisheries research", "Key contributor to Bangladesh's Green Revolution"],
  },
  // ─── Bangladesh — More Universities ────────────────────────────────────────
  {
    id: "sust", name: "Shahjalal University of Science & Technology", country: "Bangladesh", city: "Sylhet", founded: 1991, students: 13000, researchFocus: "Sciences & Technology", logo: "🇧🇩", domain: "sust.edu",
    pillars: { academicReputation: 46.8, citationsPerFaculty: 40.5, employerReputation: 49.2, facultyStudentRatio: 47.3, internationalResearchNetwork: 31.6, employmentOutcomes: 52.4, sustainability: 47.8, internationalDiversity: 14.1 },
    trend: [24, 23, 23, 22, 22, 22], highlights: ["First science & technology university in BD", "Strong CS and physics departments", "Scenic hill-adjacent campus in Sylhet"],
  },
  {
    id: "kushtia", name: "Islamic University", country: "Bangladesh", city: "Kushtia", founded: 1979, students: 22000, researchFocus: "Islamic Studies & Sciences", logo: "🇧🇩", domain: "iu.ac.bd",
    pillars: { academicReputation: 40.2, citationsPerFaculty: 34.8, employerReputation: 43.5, facultyStudentRatio: 41.6, internationalResearchNetwork: 26.3, employmentOutcomes: 46.7, sustainability: 42.1, internationalDiversity: 12.8 },
    trend: [28, 27, 27, 26, 26, 26], highlights: ["Leading Islamic studies research in BD", "Applied chemistry & biochemistry programs", "Expanding distance learning programs"],
  },
  {
    id: "jkkniu", name: "Jatiya Kabi Kazi Nazrul Islam University", country: "Bangladesh", city: "Mymensingh", founded: 2005, students: 8000, researchFocus: "Arts & Sciences", logo: "🇧🇩", domain: "jkkniu.edu.bd",
    pillars: { academicReputation: 38.5, citationsPerFaculty: 33.2, employerReputation: 41.8, facultyStudentRatio: 46.5, internationalResearchNetwork: 24.7, employmentOutcomes: 44.3, sustainability: 40.8, internationalDiversity: 10.5 },
    trend: [30, 29, 29, 28, 28, 28], highlights: ["Named after national poet Kazi Nazrul Islam", "Growing research in Bangla literature", "One of the newer public universities"],
  },
  {
    id: "ruet", name: "Rajshahi University of Engineering & Technology", country: "Bangladesh", city: "Rajshahi", founded: 2003, students: 4500, researchFocus: "Engineering & Technology", logo: "🇧🇩", domain: "ruet.ac.bd",
    pillars: { academicReputation: 43.1, citationsPerFaculty: 41.2, employerReputation: 49.6, facultyStudentRatio: 54.8, internationalResearchNetwork: 27.9, employmentOutcomes: 55.8, sustainability: 40.3, internationalDiversity: 11.4 },
    trend: [27, 26, 26, 25, 25, 25], highlights: ["Premier engineering institute in NW Bangladesh", "Strong ICPC competitive programming", "Growing renewable energy research"],
  },
  {
    id: "cuet", name: "Chittagong University of Engineering & Technology", country: "Bangladesh", city: "Chittagong", founded: 2003, students: 5000, researchFocus: "Engineering & Architecture", logo: "🇧🇩", domain: "cuet.ac.bd",
    pillars: { academicReputation: 43.5, citationsPerFaculty: 40.8, employerReputation: 50.3, facultyStudentRatio: 55.2, internationalResearchNetwork: 28.1, employmentOutcomes: 56.2, sustainability: 41.5, internationalDiversity: 11.9 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Top engineering school in SE Bangladesh", "Strong civil and mechanical programs", "Industry ties with Chittagong port economy"],
  },
  {
    id: "ku", name: "Khulna University", country: "Bangladesh", city: "Khulna", founded: 1991, students: 9500, researchFocus: "Environmental Science & Forestry", logo: "🇧🇩", domain: "ku.ac.bd",
    pillars: { academicReputation: 44.1, citationsPerFaculty: 38.9, employerReputation: 46.7, facultyStudentRatio: 46.1, internationalResearchNetwork: 30.5, employmentOutcomes: 49.8, sustainability: 52.3, internationalDiversity: 13.2 },
    trend: [27, 26, 26, 25, 25, 25], highlights: ["Leading Sundarbans & mangrove research", "Strong forestry and environmental programs", "Gateway university for SW Bangladesh"],
  },
  {
    id: "pust", name: "Pabna University of Science & Technology", country: "Bangladesh", city: "Pabna", founded: 2008, students: 6000, researchFocus: "Sciences & Business", logo: "🇧🇩", domain: "pust.ac.bd",
    pillars: { academicReputation: 37.8, citationsPerFaculty: 32.5, employerReputation: 40.2, facultyStudentRatio: 48.3, internationalResearchNetwork: 23.1, employmentOutcomes: 43.5, sustainability: 39.7, internationalDiversity: 9.8 },
    trend: [31, 30, 30, 29, 29, 29], highlights: ["Rapidly growing science university", "Strong ICT and mathematics programs", "Focus on applied research for rural development"],
  },
  {
    id: "diu", name: "Daffodil International University", country: "Bangladesh", city: "Dhaka", founded: 2002, students: 25000, researchFocus: "CS & Business", logo: "🇧🇩", domain: "daffodilvarsity.edu.bd",
    pillars: { academicReputation: 44.8, citationsPerFaculty: 41.3, employerReputation: 52.1, facultyStudentRatio: 50.6, internationalResearchNetwork: 33.8, employmentOutcomes: 56.4, sustainability: 43.5, internationalDiversity: 24.3 },
    trend: [25, 24, 24, 23, 23, 23], highlights: ["Largest IT-focused private university in BD", "Active ICPC and hackathon participation", "Strong industry-academia collaboration"],
  },
  {
    id: "uiu", name: "United International University", country: "Bangladesh", city: "Dhaka", founded: 2003, students: 8000, researchFocus: "Engineering & Business", logo: "🇧🇩", domain: "uiu.ac.bd",
    pillars: { academicReputation: 42.5, citationsPerFaculty: 39.8, employerReputation: 50.4, facultyStudentRatio: 52.7, internationalResearchNetwork: 30.2, employmentOutcomes: 54.1, sustainability: 41.8, internationalDiversity: 22.6 },
    trend: [27, 26, 26, 25, 25, 25], highlights: ["Unitrax Foundation-backed", "Strong EEE and CSE departments", "Modern Satarkul campus"],
  },
  {
    id: "stamford", name: "Stamford University Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 2002, students: 18000, researchFocus: "Pharmacy & Business", logo: "🇧🇩", domain: "stamforduniversity.edu.bd",
    pillars: { academicReputation: 40.1, citationsPerFaculty: 36.7, employerReputation: 46.5, facultyStudentRatio: 49.1, internationalResearchNetwork: 27.5, employmentOutcomes: 50.3, sustainability: 38.9, internationalDiversity: 20.8 },
    trend: [29, 28, 28, 27, 27, 27], highlights: ["Leading pharmacy education in BD", "Film & media studies program", "Multiple campuses across Bangladesh"],
  },
  {
    id: "aust", name: "Ahsanullah University of Science & Technology", country: "Bangladesh", city: "Dhaka", founded: 1995, students: 9000, researchFocus: "Engineering & Architecture", logo: "🇧🇩", domain: "aust.edu",
    pillars: { academicReputation: 44.2, citationsPerFaculty: 40.5, employerReputation: 51.8, facultyStudentRatio: 53.4, internationalResearchNetwork: 29.6, employmentOutcomes: 55.7, sustainability: 40.1, internationalDiversity: 19.3 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Top private engineering university", "Strong architecture program", "Dhaka Tejgaon campus with modern labs"],
  },
  {
    id: "nstu", name: "Noakhali Science & Technology University", country: "Bangladesh", city: "Noakhali", founded: 2001, students: 7500, researchFocus: "Sciences & Fisheries", logo: "🇧🇩", domain: "nstu.edu.bd",
    pillars: { academicReputation: 39.4, citationsPerFaculty: 35.1, employerReputation: 42.3, facultyStudentRatio: 47.8, internationalResearchNetwork: 25.8, employmentOutcomes: 46.2, sustainability: 44.5, internationalDiversity: 11.2 },
    trend: [29, 28, 28, 27, 27, 27], highlights: ["Coastal region's leading university", "Marine fisheries and oceanography focus", "Growing applied sciences research"],
  },
  {
    id: "bsmmu", name: "Bangabandhu Sheikh Mujib Medical University", country: "Bangladesh", city: "Dhaka", founded: 1998, students: 3500, researchFocus: "Medicine & Public Health", logo: "🇧🇩", domain: "bsmmu.edu.bd",
    pillars: { academicReputation: 50.5, citationsPerFaculty: 46.8, employerReputation: 54.3, facultyStudentRatio: 58.7, internationalResearchNetwork: 36.4, employmentOutcomes: 62.1, sustainability: 46.2, internationalDiversity: 17.5 },
    trend: [21, 20, 20, 19, 19, 19], highlights: ["Bangladesh's only public medical university", "Leading clinical research in South Asia", "National referral center for specialized medicine"],
  },
  // ─── Bangladesh — Additional Universities ──────────────────────────────────
  {
    id: "bup", name: "Bangladesh University of Professionals", country: "Bangladesh", city: "Dhaka", founded: 2008, students: 7000, researchFocus: "Security & Management", logo: "🇧🇩", domain: "bup.edu.bd",
    pillars: { academicReputation: 46.5, citationsPerFaculty: 38.7, employerReputation: 55.3, facultyStudentRatio: 58.1, internationalResearchNetwork: 28.9, employmentOutcomes: 58.4, sustainability: 43.2, internationalDiversity: 15.8 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Run under Armed Forces Division", "Strong defense & security studies", "Rapidly growing civilian programs"],
  },
  {
    id: "mbstu", name: "Mawlana Bhashani Science & Technology University", country: "Bangladesh", city: "Tangail", founded: 2001, students: 8500, researchFocus: "Sciences & Technology", logo: "🇧🇩", domain: "mbstu.ac.bd",
    pillars: { academicReputation: 39.8, citationsPerFaculty: 34.2, employerReputation: 42.5, facultyStudentRatio: 46.8, internationalResearchNetwork: 25.4, employmentOutcomes: 45.8, sustainability: 43.1, internationalDiversity: 10.9 },
    trend: [30, 29, 29, 28, 28, 28], highlights: ["Named after Maulana Abdul Hamid Khan Bhashani", "Growing CS and textile engineering programs", "Eco-friendly campus initiatives"],
  },
  {
    id: "hstu", name: "Hajee Mohammad Danesh Science & Technology University", country: "Bangladesh", city: "Dinajpur", founded: 2002, students: 9000, researchFocus: "Agriculture & Engineering", logo: "🇧🇩", domain: "hstu.ac.bd",
    pillars: { academicReputation: 38.2, citationsPerFaculty: 33.5, employerReputation: 41.8, facultyStudentRatio: 45.2, internationalResearchNetwork: 24.1, employmentOutcomes: 44.5, sustainability: 46.3, internationalDiversity: 10.2 },
    trend: [31, 30, 30, 29, 29, 29], highlights: ["Leading university in Rangpur division", "Strong veterinary and agricultural programs", "Largest campus in northern Bangladesh"],
  },
  {
    id: "just", name: "Jessore University of Science & Technology", country: "Bangladesh", city: "Jessore", founded: 2007, students: 7200, researchFocus: "Sciences & Fisheries", logo: "🇧🇩", domain: "just.edu.bd",
    pillars: { academicReputation: 37.5, citationsPerFaculty: 32.8, employerReputation: 40.6, facultyStudentRatio: 47.1, internationalResearchNetwork: 23.5, employmentOutcomes: 43.2, sustainability: 41.5, internationalDiversity: 9.8 },
    trend: [32, 31, 31, 30, 30, 30], highlights: ["Major university in Khulna division", "Microbiology and biotechnology focus", "Growing fisheries research output"],
  },
  {
    id: "duet", name: "Dhaka University of Engineering & Technology", country: "Bangladesh", city: "Gazipur", founded: 2003, students: 5500, researchFocus: "Engineering & Technology", logo: "🇧🇩", domain: "duet.ac.bd",
    pillars: { academicReputation: 41.8, citationsPerFaculty: 39.5, employerReputation: 48.7, facultyStudentRatio: 54.1, internationalResearchNetwork: 27.2, employmentOutcomes: 53.4, sustainability: 39.8, internationalDiversity: 11.5 },
    trend: [28, 27, 27, 26, 26, 26], highlights: ["Formerly BIT Dhaka", "Strong mechanical and civil engineering", "Close proximity to Dhaka industrial zone"],
  },
  {
    id: "sau", name: "Sylhet Agricultural University", country: "Bangladesh", city: "Sylhet", founded: 2006, students: 3800, researchFocus: "Agriculture & Veterinary", logo: "🇧🇩", domain: "sau.ac.bd",
    pillars: { academicReputation: 36.8, citationsPerFaculty: 34.1, employerReputation: 39.5, facultyStudentRatio: 50.3, internationalResearchNetwork: 26.2, employmentOutcomes: 42.8, sustainability: 48.7, internationalDiversity: 10.1 },
    trend: [33, 32, 32, 31, 31, 31], highlights: ["Tea garden research specialization", "Veterinary and animal sciences focus", "Expanding aquaculture research"],
  },
  {
    id: "cvasu", name: "Chittagong Veterinary & Animal Sciences University", country: "Bangladesh", city: "Chittagong", founded: 2006, students: 2800, researchFocus: "Veterinary & Marine Sciences", logo: "🇧🇩", domain: "cvasu.ac.bd",
    pillars: { academicReputation: 38.5, citationsPerFaculty: 36.7, employerReputation: 41.2, facultyStudentRatio: 55.6, internationalResearchNetwork: 28.8, employmentOutcomes: 45.6, sustainability: 47.2, internationalDiversity: 12.4 },
    trend: [31, 30, 30, 29, 29, 29], highlights: ["Only dedicated veterinary university in BD", "Leading poultry and dairy research", "FAO and WHO collaborative projects"],
  },
  {
    id: "sbau", name: "Sher-e-Bangla Agricultural University", country: "Bangladesh", city: "Dhaka", founded: 2001, students: 4200, researchFocus: "Agriculture & Agribusiness", logo: "🇧🇩", domain: "sau.edu.bd",
    pillars: { academicReputation: 40.2, citationsPerFaculty: 37.4, employerReputation: 43.1, facultyStudentRatio: 49.8, internationalResearchNetwork: 29.5, employmentOutcomes: 46.3, sustainability: 50.1, internationalDiversity: 11.8 },
    trend: [29, 28, 28, 27, 27, 27], highlights: ["Located in heart of Dhaka — Agargaon campus", "Crop science and agroforestry focus", "Strong national food security research"],
  },
  {
    id: "cou", name: "Comilla University", country: "Bangladesh", city: "Comilla", founded: 2006, students: 7000, researchFocus: "Sciences & Arts", logo: "🇧🇩", domain: "cou.ac.bd",
    pillars: { academicReputation: 37.2, citationsPerFaculty: 31.8, employerReputation: 40.1, facultyStudentRatio: 45.5, internationalResearchNetwork: 22.8, employmentOutcomes: 42.7, sustainability: 40.2, internationalDiversity: 9.5 },
    trend: [33, 32, 32, 31, 31, 31], highlights: ["Major university in Comilla district", "Growing statistics and economics programs", "Active student research culture"],
  },
  {
    id: "brur", name: "Begum Rokeya University, Rangpur", country: "Bangladesh", city: "Rangpur", founded: 2008, students: 8500, researchFocus: "Sciences & Social Sciences", logo: "🇧🇩", domain: "brur.ac.bd",
    pillars: { academicReputation: 36.5, citationsPerFaculty: 31.2, employerReputation: 39.4, facultyStudentRatio: 44.8, internationalResearchNetwork: 22.1, employmentOutcomes: 41.5, sustainability: 39.8, internationalDiversity: 9.2 },
    trend: [34, 33, 33, 32, 32, 32], highlights: ["Named after women's rights pioneer Begum Rokeya", "Key university for Rangpur division", "Expanding social science research"],
  },
  {
    id: "bsmrstu", name: "Bangabandhu Sheikh Mujibur Rahman Science & Technology University", country: "Bangladesh", city: "Gopalganj", founded: 2011, students: 5500, researchFocus: "Sciences & Technology", logo: "🇧🇩", domain: "bsmrstu.edu.bd",
    pillars: { academicReputation: 35.8, citationsPerFaculty: 30.5, employerReputation: 38.7, facultyStudentRatio: 46.2, internationalResearchNetwork: 21.5, employmentOutcomes: 40.8, sustainability: 38.5, internationalDiversity: 8.8 },
    trend: [35, 34, 34, 33, 33, 33], highlights: ["Named after Father of the Nation", "Modern science labs and research facilities", "Growing ICT and data science programs"],
  },
  {
    id: "bou", name: "Bangladesh Open University", country: "Bangladesh", city: "Gazipur", founded: 1992, students: 500000, researchFocus: "Distance Education", logo: "🇧🇩", domain: "bou.ac.bd",
    pillars: { academicReputation: 35.1, citationsPerFaculty: 28.4, employerReputation: 38.2, facultyStudentRatio: 30.5, internationalResearchNetwork: 20.8, employmentOutcomes: 40.1, sustainability: 42.5, internationalDiversity: 8.5 },
    trend: [36, 35, 35, 34, 34, 34], highlights: ["Largest university in Bangladesh by enrollment", "Pioneer of distance learning in South Asia", "Reaching rural and underserved populations"],
  },
  {
    id: "iiuc", name: "International Islamic University Chittagong", country: "Bangladesh", city: "Chittagong", founded: 1995, students: 14000, researchFocus: "Islamic Studies & Sciences", logo: "🇧🇩", domain: "iiuc.ac.bd",
    pillars: { academicReputation: 41.5, citationsPerFaculty: 37.2, employerReputation: 47.3, facultyStudentRatio: 50.5, internationalResearchNetwork: 30.1, employmentOutcomes: 50.2, sustainability: 42.8, internationalDiversity: 22.1 },
    trend: [28, 27, 27, 26, 26, 26], highlights: ["Leading private university in Chittagong", "Strong EEE and pharmacy programs", "Active international student body"],
  },
  {
    id: "uap", name: "University of Asia Pacific", country: "Bangladesh", city: "Dhaka", founded: 1996, students: 6500, researchFocus: "Engineering & Architecture", logo: "🇧🇩", domain: "uap-bd.edu",
    pillars: { academicReputation: 42.1, citationsPerFaculty: 38.5, employerReputation: 49.8, facultyStudentRatio: 52.3, internationalResearchNetwork: 28.5, employmentOutcomes: 52.7, sustainability: 39.5, internationalDiversity: 18.5 },
    trend: [28, 27, 27, 26, 26, 26], highlights: ["Award-winning architecture department", "Strong civil engineering program", "Urban Dhaka campus with industry access"],
  },
  {
    id: "green", name: "Green University of Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 2003, students: 7000, researchFocus: "CS & Engineering", logo: "🇧🇩", domain: "green.edu.bd",
    pillars: { academicReputation: 38.8, citationsPerFaculty: 35.2, employerReputation: 45.1, facultyStudentRatio: 49.7, internationalResearchNetwork: 25.8, employmentOutcomes: 48.5, sustainability: 44.2, internationalDiversity: 16.8 },
    trend: [30, 29, 29, 28, 28, 28], highlights: ["Focus on green technology research", "Strong competitive programming culture", "Industry-linked CS curriculum"],
  },
  {
    id: "lus", name: "Leading University, Sylhet", country: "Bangladesh", city: "Sylhet", founded: 2001, students: 5000, researchFocus: "Business & CS", logo: "🇧🇩", domain: "lus.ac.bd",
    pillars: { academicReputation: 36.2, citationsPerFaculty: 32.1, employerReputation: 42.5, facultyStudentRatio: 48.4, internationalResearchNetwork: 23.5, employmentOutcomes: 46.1, sustainability: 38.2, internationalDiversity: 18.2 },
    trend: [32, 31, 31, 30, 30, 30], highlights: ["Top private university in Sylhet region", "Strong business administration program", "Growing IT and software engineering focus"],
  },
  {
    id: "pru", name: "Premier University, Chittagong", country: "Bangladesh", city: "Chittagong", founded: 2002, students: 8500, researchFocus: "Law & Business", logo: "🇧🇩", domain: "puc.ac.bd",
    pillars: { academicReputation: 37.5, citationsPerFaculty: 33.4, employerReputation: 44.2, facultyStudentRatio: 47.8, internationalResearchNetwork: 24.8, employmentOutcomes: 47.3, sustainability: 37.5, internationalDiversity: 17.5 },
    trend: [31, 30, 30, 29, 29, 29], highlights: ["Leading private university in Chittagong", "Strong law faculty", "Active moot court and legal aid programs"],
  },
  {
    id: "btu", name: "Bangladesh Textile University", country: "Bangladesh", city: "Dhaka", founded: 2010, students: 3500, researchFocus: "Textile Engineering", logo: "🇧🇩", domain: "butex.edu.bd",
    pillars: { academicReputation: 41.2, citationsPerFaculty: 38.8, employerReputation: 52.5, facultyStudentRatio: 56.3, internationalResearchNetwork: 30.2, employmentOutcomes: 60.1, sustainability: 45.8, internationalDiversity: 14.5 },
    trend: [27, 26, 26, 25, 25, 25], highlights: ["Only dedicated textile university in BD", "Strong ties to $45B RMG export industry", "Pioneering sustainable fashion research"],
  },
  // ─── Additional World Universities ─────────────────────────────────────────
  {
    id: "princeton", name: "Princeton University", country: "USA", city: "Princeton, NJ", founded: 1746, students: 8478, researchFocus: "Mathematics & Physics", logo: "🏛️", domain: "princeton.edu",
    pillars: { academicReputation: 99.1, citationsPerFaculty: 97.8, employerReputation: 97.2, facultyStudentRatio: 99.5, internationalResearchNetwork: 90.5, employmentOutcomes: 98.1, sustainability: 90.8, internationalDiversity: 85.7 },
    trend: [4, 4, 5, 5, 4, 4], highlights: ["69 Nobel laureates affiliated", "Strongest math department globally", "$35.8B endowment"],
  },
  {
    id: "uchicago", name: "University of Chicago", country: "USA", city: "Chicago, IL", founded: 1890, students: 17834, researchFocus: "Economics & Law", logo: "🏛️", domain: "uchicago.edu",
    pillars: { academicReputation: 96.8, citationsPerFaculty: 95.2, employerReputation: 94.5, facultyStudentRatio: 93.1, internationalResearchNetwork: 88.7, employmentOutcomes: 96.3, sustainability: 88.4, internationalDiversity: 83.2 },
    trend: [7, 7, 6, 6, 7, 7], highlights: ["100 Nobel Prize affiliates", "Chicago school of economics", "Birthplace of nuclear energy — Manhattan Project"],
  },
  {
    id: "upenn", name: "University of Pennsylvania", country: "USA", city: "Philadelphia, PA", founded: 1740, students: 28000, researchFocus: "Business & Medicine", logo: "🏛️", domain: "upenn.edu",
    pillars: { academicReputation: 94.5, citationsPerFaculty: 90.1, employerReputation: 95.8, facultyStudentRatio: 89.2, internationalResearchNetwork: 87.3, employmentOutcomes: 97.2, sustainability: 87.5, internationalDiversity: 84.8 },
    trend: [10, 10, 9, 9, 10, 10], highlights: ["Wharton School — #1 MBA globally", "First medical school in America", "Founded by Benjamin Franklin"],
  },
  {
    id: "jhu", name: "Johns Hopkins University", country: "USA", city: "Baltimore, MD", founded: 1876, students: 26402, researchFocus: "Medicine & Public Health", logo: "🏛️", domain: "jhu.edu",
    pillars: { academicReputation: 93.2, citationsPerFaculty: 96.4, employerReputation: 88.7, facultyStudentRatio: 91.8, internationalResearchNetwork: 92.5, employmentOutcomes: 90.8, sustainability: 86.2, internationalDiversity: 80.5 },
    trend: [11, 11, 10, 10, 11, 11], highlights: ["#1 in US federal research spending", "Bloomberg School of Public Health", "Pioneer of the American research university model"],
  },
  {
    id: "cornell", name: "Cornell University", country: "USA", city: "Ithaca, NY", founded: 1865, students: 25582, researchFocus: "Engineering & Agriculture", logo: "🏛️", domain: "cornell.edu",
    pillars: { academicReputation: 92.4, citationsPerFaculty: 87.5, employerReputation: 91.3, facultyStudentRatio: 88.6, internationalResearchNetwork: 86.8, employmentOutcomes: 92.1, sustainability: 89.5, internationalDiversity: 82.1 },
    trend: [13, 13, 12, 12, 13, 13], highlights: ["Only Ivy with a land-grant mission", "World-leading hotel administration school", "Cornell Tech campus in NYC"],
  },
  {
    id: "duke", name: "Duke University", country: "USA", city: "Durham, NC", founded: 1838, students: 17620, researchFocus: "Medicine & Public Policy", logo: "🏛️", domain: "duke.edu",
    pillars: { academicReputation: 91.8, citationsPerFaculty: 92.3, employerReputation: 90.5, facultyStudentRatio: 90.1, internationalResearchNetwork: 85.4, employmentOutcomes: 93.5, sustainability: 88.1, internationalDiversity: 79.6 },
    trend: [12, 12, 11, 11, 12, 12], highlights: ["Duke Health — top-ranked medical center", "Strong public policy research", "$12.7B endowment"],
  },
  {
    id: "nw", name: "Northwestern University", country: "USA", city: "Evanston, IL", founded: 1851, students: 22801, researchFocus: "Journalism & Engineering", logo: "🏛️", domain: "northwestern.edu",
    pillars: { academicReputation: 90.5, citationsPerFaculty: 88.2, employerReputation: 91.8, facultyStudentRatio: 87.4, internationalResearchNetwork: 84.1, employmentOutcomes: 93.8, sustainability: 86.7, internationalDiversity: 78.3 },
    trend: [14, 14, 13, 13, 14, 14], highlights: ["Medill School — #1 journalism program", "Kellogg School of Management", "Qatar and San Francisco satellite campuses"],
  },
  {
    id: "edinburgh", name: "University of Edinburgh", country: "UK", city: "Edinburgh", founded: 1583, students: 45000, researchFocus: "AI & Medicine", logo: "🇬🇧", domain: "ed.ac.uk",
    pillars: { academicReputation: 89.8, citationsPerFaculty: 84.5, employerReputation: 87.2, facultyStudentRatio: 76.5, internationalResearchNetwork: 93.1, employmentOutcomes: 85.3, sustainability: 91.5, internationalDiversity: 94.8 },
    trend: [14, 13, 13, 12, 12, 12], highlights: ["6th oldest English-speaking university", "Pioneering AI & informatics research", "Dolly the Sheep was cloned here"],
  },
  {
    id: "lse", name: "London School of Economics", country: "UK", city: "London", founded: 1895, students: 12500, researchFocus: "Economics & Political Science", logo: "🇬🇧", domain: "lse.ac.uk",
    pillars: { academicReputation: 91.2, citationsPerFaculty: 78.4, employerReputation: 94.7, facultyStudentRatio: 82.3, internationalResearchNetwork: 89.5, employmentOutcomes: 95.2, sustainability: 84.3, internationalDiversity: 97.5 },
    trend: [12, 12, 11, 11, 11, 11], highlights: ["World leader in social sciences", "18 Nobel Prize winners", "Most internationally diverse campus in UK"],
  },
  {
    id: "kcl", name: "King's College London", country: "UK", city: "London", founded: 1829, students: 35000, researchFocus: "Law & Health", logo: "🇬🇧", domain: "kcl.ac.uk",
    pillars: { academicReputation: 87.5, citationsPerFaculty: 82.8, employerReputation: 86.3, facultyStudentRatio: 74.8, internationalResearchNetwork: 91.2, employmentOutcomes: 84.7, sustainability: 87.8, internationalDiversity: 95.2 },
    trend: [16, 15, 15, 14, 14, 14], highlights: ["Strand campus in heart of London", "DNA structure discovered here", "Florence Nightingale's nursing school"],
  },
  {
    id: "manchester", name: "University of Manchester", country: "UK", city: "Manchester", founded: 1824, students: 44000, researchFocus: "Physics & Engineering", logo: "🇬🇧", domain: "manchester.ac.uk",
    pillars: { academicReputation: 86.2, citationsPerFaculty: 81.5, employerReputation: 84.8, facultyStudentRatio: 73.2, internationalResearchNetwork: 90.4, employmentOutcomes: 83.5, sustainability: 89.2, internationalDiversity: 91.8 },
    trend: [17, 16, 16, 15, 15, 15], highlights: ["25 Nobel laureates", "Graphene discovered here", "Largest single-site university in UK"],
  },
  {
    id: "tum", name: "Technical University of Munich", country: "Germany", city: "Munich", founded: 1868, students: 50000, researchFocus: "Engineering & CS", logo: "🇩🇪", domain: "tum.de",
    pillars: { academicReputation: 88.5, citationsPerFaculty: 85.2, employerReputation: 90.3, facultyStudentRatio: 72.8, internationalResearchNetwork: 87.6, employmentOutcomes: 89.5, sustainability: 91.8, internationalDiversity: 82.5 },
    trend: [13, 13, 12, 12, 12, 12], highlights: ["Germany's #1 technical university", "17 Nobel Prize winners", "Strong BMW, Siemens, SAP partnerships"],
  },
  {
    id: "heidelberg", name: "Heidelberg University", country: "Germany", city: "Heidelberg", founded: 1386, students: 30000, researchFocus: "Medicine & Natural Sciences", logo: "🇩🇪", domain: "uni-heidelberg.de",
    pillars: { academicReputation: 85.8, citationsPerFaculty: 83.7, employerReputation: 80.2, facultyStudentRatio: 76.5, internationalResearchNetwork: 88.9, employmentOutcomes: 81.3, sustainability: 87.4, internationalDiversity: 80.1 },
    trend: [15, 15, 14, 14, 14, 14], highlights: ["Germany's oldest university", "12 Nobel Prize winners", "Excellence cluster in molecular biology"],
  },
  {
    id: "epfl", name: "École Polytechnique Fédérale de Lausanne", country: "Switzerland", city: "Lausanne", founded: 1853, students: 13000, researchFocus: "Engineering & CS", logo: "🇨🇭", domain: "epfl.ch",
    pillars: { academicReputation: 90.2, citationsPerFaculty: 95.8, employerReputation: 88.7, facultyStudentRatio: 92.3, internationalResearchNetwork: 96.5, employmentOutcomes: 87.2, sustainability: 93.4, internationalDiversity: 97.1 },
    trend: [8, 8, 7, 7, 8, 8], highlights: ["Switzerland's leading tech university", "Human Brain Project headquarters", "Most international campus in Europe"],
  },
  {
    id: "uva", name: "University of Amsterdam", country: "Netherlands", city: "Amsterdam", founded: 1632, students: 39000, researchFocus: "Social Sciences & Humanities", logo: "🇳🇱", domain: "uva.nl",
    pillars: { academicReputation: 83.5, citationsPerFaculty: 80.2, employerReputation: 78.8, facultyStudentRatio: 71.5, internationalResearchNetwork: 89.8, employmentOutcomes: 79.4, sustainability: 87.2, internationalDiversity: 88.5 },
    trend: [17, 16, 16, 15, 15, 15], highlights: ["Largest university in Netherlands", "Spinoza Prize winners hub", "Leading media and communication research"],
  },
  {
    id: "kuleuven", name: "KU Leuven", country: "Belgium", city: "Leuven", founded: 1425, students: 65000, researchFocus: "Biomedical & Engineering", logo: "🇧🇪", domain: "kuleuven.be",
    pillars: { academicReputation: 87.8, citationsPerFaculty: 88.5, employerReputation: 83.2, facultyStudentRatio: 74.1, internationalResearchNetwork: 91.8, employmentOutcomes: 82.5, sustainability: 90.5, internationalDiversity: 84.3 },
    trend: [13, 13, 12, 12, 12, 12], highlights: ["Most innovative European university", "Oldest Catholic university in world", "Leading nanotechnology research — IMEC"],
  },
  {
    id: "copenhagen", name: "University of Copenhagen", country: "Denmark", city: "Copenhagen", founded: 1479, students: 38000, researchFocus: "Health & Natural Sciences", logo: "🇩🇰", domain: "ku.dk",
    pillars: { academicReputation: 86.5, citationsPerFaculty: 87.8, employerReputation: 79.5, facultyStudentRatio: 75.8, internationalResearchNetwork: 92.4, employmentOutcomes: 80.2, sustainability: 94.2, internationalDiversity: 83.8 },
    trend: [14, 14, 13, 13, 13, 13], highlights: ["9 Nobel Prize laureates", "Niels Bohr Institute for physics", "Leading in health and life sciences"],
  },
  {
    id: "helsinki", name: "University of Helsinki", country: "Finland", city: "Helsinki", founded: 1640, students: 31000, researchFocus: "Environmental & Life Sciences", logo: "🇫🇮", domain: "helsinki.fi",
    pillars: { academicReputation: 82.1, citationsPerFaculty: 83.4, employerReputation: 74.8, facultyStudentRatio: 73.5, internationalResearchNetwork: 90.1, employmentOutcomes: 76.3, sustainability: 95.8, internationalDiversity: 78.5 },
    trend: [18, 17, 17, 16, 16, 16], highlights: ["Finland's largest and oldest university", "Leading climate and atmospheric research", "Consistently ranked #1 in sustainability"],
  },
  {
    id: "kaist", name: "Korea Advanced Institute of Science & Technology", country: "South Korea", city: "Daejeon", founded: 1971, students: 11000, researchFocus: "Engineering & AI", logo: "🇰🇷", domain: "kaist.ac.kr",
    pillars: { academicReputation: 84.8, citationsPerFaculty: 88.2, employerReputation: 86.5, facultyStudentRatio: 87.3, internationalResearchNetwork: 78.4, employmentOutcomes: 89.7, sustainability: 80.5, internationalDiversity: 62.8 },
    trend: [12, 12, 11, 11, 11, 11], highlights: ["South Korea's MIT", "Leading robotics and AI research", "Strong Samsung and LG partnerships"],
  },
  {
    id: "hku", name: "University of Hong Kong", country: "China", city: "Hong Kong", founded: 1911, students: 31000, researchFocus: "Medicine & Law", logo: "🏯", domain: "hku.hk",
    pillars: { academicReputation: 88.2, citationsPerFaculty: 82.5, employerReputation: 90.8, facultyStudentRatio: 80.4, internationalResearchNetwork: 88.7, employmentOutcomes: 88.5, sustainability: 85.3, internationalDiversity: 93.2 },
    trend: [11, 11, 10, 10, 10, 10], highlights: ["Asia's most international university", "Strong common law program", "Gateway between East and West"],
  },
  {
    id: "ntu", name: "Nanyang Technological University", country: "Singapore", city: "Singapore", founded: 1991, students: 33000, researchFocus: "Engineering & Materials Science", logo: "🦁", domain: "ntu.edu.sg",
    pillars: { academicReputation: 87.5, citationsPerFaculty: 89.8, employerReputation: 91.2, facultyStudentRatio: 81.5, internationalResearchNetwork: 86.3, employmentOutcomes: 90.8, sustainability: 92.5, internationalDiversity: 90.1 },
    trend: [9, 9, 8, 8, 9, 9], highlights: ["World's most beautiful campus", "Young University #1 multiple times", "Leading materials science research"],
  },
  {
    id: "iitd", name: "Indian Institute of Technology Delhi", country: "India", city: "New Delhi", founded: 1961, students: 13000, researchFocus: "Engineering & CS", logo: "🇮🇳", domain: "iitd.ac.in",
    pillars: { academicReputation: 74.2, citationsPerFaculty: 79.5, employerReputation: 86.3, facultyStudentRatio: 84.8, internationalResearchNetwork: 60.5, employmentOutcomes: 90.2, sustainability: 69.8, internationalDiversity: 40.5 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["India's top-ranked IIT", "Strong Silicon Valley alumni network", "Leading AI and ML research in India"],
  },
  {
    id: "monash", name: "Monash University", country: "Australia", city: "Melbourne", founded: 1958, students: 86000, researchFocus: "Pharmacy & Engineering", logo: "🦘", domain: "monash.edu",
    pillars: { academicReputation: 85.4, citationsPerFaculty: 79.8, employerReputation: 84.5, facultyStudentRatio: 71.2, internationalResearchNetwork: 87.5, employmentOutcomes: 81.8, sustainability: 90.8, internationalDiversity: 94.7 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["Australia's largest university", "#1 in pharmacy globally", "Campuses on 4 continents"],
  },
  {
    id: "usyd", name: "University of Sydney", country: "Australia", city: "Sydney", founded: 1850, students: 73000, researchFocus: "Medicine & Veterinary", logo: "🦘", domain: "sydney.edu.au",
    pillars: { academicReputation: 86.8, citationsPerFaculty: 78.5, employerReputation: 86.2, facultyStudentRatio: 70.8, internationalResearchNetwork: 88.2, employmentOutcomes: 83.5, sustainability: 91.2, internationalDiversity: 93.5 },
    trend: [14, 14, 13, 13, 13, 13], highlights: ["Australia's first university", "Pioneering pain management research", "Gothic Revival architecture landmark"],
  },
  {
    id: "anu", name: "Australian National University", country: "Australia", city: "Canberra", founded: 1946, students: 25500, researchFocus: "Astrophysics & Policy", logo: "🦘", domain: "anu.edu.au",
    pillars: { academicReputation: 84.5, citationsPerFaculty: 81.2, employerReputation: 78.8, facultyStudentRatio: 79.5, internationalResearchNetwork: 90.8, employmentOutcomes: 79.2, sustainability: 89.5, internationalDiversity: 88.2 },
    trend: [16, 15, 15, 14, 14, 14], highlights: ["Australia's national research university", "Mount Stromlo Observatory", "Leading public policy research"],
  },
  {
    id: "mcgill", name: "McGill University", country: "Canada", city: "Montreal", founded: 1821, students: 40000, researchFocus: "Medicine & Neuroscience", logo: "🍁", domain: "mcgill.ca",
    pillars: { academicReputation: 88.5, citationsPerFaculty: 80.8, employerReputation: 83.5, facultyStudentRatio: 76.2, internationalResearchNetwork: 86.5, employmentOutcomes: 82.8, sustainability: 88.2, internationalDiversity: 91.5 },
    trend: [12, 12, 11, 11, 11, 11], highlights: ["12 Nobel laureates", "Osler — father of modern medicine trained here", "Bilingual Montreal setting"],
  },
  {
    id: "ubc", name: "University of British Columbia", country: "Canada", city: "Vancouver", founded: 1908, students: 66000, researchFocus: "Forestry & Environmental Sciences", logo: "🍁", domain: "ubc.ca",
    pillars: { academicReputation: 87.2, citationsPerFaculty: 79.5, employerReputation: 82.8, facultyStudentRatio: 73.5, internationalResearchNetwork: 88.1, employmentOutcomes: 81.5, sustainability: 93.2, internationalDiversity: 90.8 },
    trend: [13, 13, 12, 12, 12, 12], highlights: ["Stunning Pacific campus", "Leading forestry and sustainability research", "8 Nobel Prize winners"],
  },
  {
    id: "sapienza", name: "Sapienza University of Rome", country: "Italy", city: "Rome", founded: 1303, students: 112000, researchFocus: "Classics & Engineering", logo: "🇮🇹", domain: "uniroma1.it",
    pillars: { academicReputation: 80.5, citationsPerFaculty: 72.8, employerReputation: 76.3, facultyStudentRatio: 58.2, internationalResearchNetwork: 82.5, employmentOutcomes: 74.1, sustainability: 79.8, internationalDiversity: 72.5 },
    trend: [20, 19, 19, 18, 18, 18], highlights: ["Largest university in Europe by enrollment", "One of the world's oldest universities", "#1 in Classics globally"],
  },
  {
    id: "puc", name: "Pontificia Universidad Católica de Chile", country: "Chile", city: "Santiago", founded: 1888, students: 33000, researchFocus: "Engineering & Social Sciences", logo: "🇨🇱", domain: "uc.cl",
    pillars: { academicReputation: 78.8, citationsPerFaculty: 68.5, employerReputation: 82.1, facultyStudentRatio: 70.2, internationalResearchNetwork: 72.8, employmentOutcomes: 80.5, sustainability: 78.2, internationalDiversity: 55.8 },
    trend: [19, 18, 18, 17, 17, 17], highlights: ["#1 university in Latin America", "Strong astronomy — Atacama access", "Leading business school in South America"],
  },
  {
    id: "wits", name: "University of the Witwatersrand", country: "South Africa", city: "Johannesburg", founded: 1896, students: 40000, researchFocus: "Mining & Health Sciences", logo: "🇿🇦", domain: "wits.ac.za",
    pillars: { academicReputation: 70.2, citationsPerFaculty: 58.4, employerReputation: 68.5, facultyStudentRatio: 60.8, internationalResearchNetwork: 71.5, employmentOutcomes: 64.2, sustainability: 72.8, internationalDiversity: 62.5 },
    trend: [19, 18, 18, 17, 17, 17], highlights: ["Nelson Mandela's alma mater", "World-class paleontology — Cradle of Humankind", "Leading mining engineering research"],
  },
  // ─── More Global Universities ──────────────────────────────────────────────
  {
    id: "waseda", name: "Waseda University", country: "Japan", city: "Tokyo", founded: 1882, students: 42000, researchFocus: "Political Science & Engineering", logo: "🗾", domain: "waseda.jp",
    pillars: { academicReputation: 82.5, citationsPerFaculty: 71.8, employerReputation: 88.2, facultyStudentRatio: 70.5, internationalResearchNetwork: 76.4, employmentOutcomes: 87.5, sustainability: 78.3, internationalDiversity: 72.8 },
    trend: [20, 19, 19, 18, 18, 18], highlights: ["7 Japanese Prime Ministers alumni", "Largest private university in Japan", "Strong robotics and automotive research"],
  },
  {
    id: "fudan", name: "Fudan University", country: "China", city: "Shanghai", founded: 1905, students: 35000, researchFocus: "Medicine & Social Sciences", logo: "🏯", domain: "fudan.edu.cn",
    pillars: { academicReputation: 88.5, citationsPerFaculty: 85.3, employerReputation: 85.8, facultyStudentRatio: 76.2, internationalResearchNetwork: 79.5, employmentOutcomes: 87.2, sustainability: 81.4, internationalDiversity: 58.8 },
    trend: [14, 13, 13, 12, 12, 12], highlights: ["Leading medical research in China", "Shanghai's premier university", "Strong international exchange programs"],
  },
  {
    id: "zju", name: "Zhejiang University", country: "China", city: "Hangzhou", founded: 1897, students: 60000, researchFocus: "Engineering & Agriculture", logo: "🏯", domain: "zju.edu.cn",
    pillars: { academicReputation: 86.2, citationsPerFaculty: 84.8, employerReputation: 83.5, facultyStudentRatio: 72.8, internationalResearchNetwork: 78.2, employmentOutcomes: 85.5, sustainability: 82.8, internationalDiversity: 55.2 },
    trend: [16, 15, 15, 14, 14, 14], highlights: ["China's most prolific research output", "Alibaba collaboration hub", "Beautiful West Lake campus"],
  },
  {
    id: "vienna", name: "University of Vienna", country: "Austria", city: "Vienna", founded: 1365, students: 90000, researchFocus: "Philosophy & Sciences", logo: "🇦🇹", domain: "univie.ac.at",
    pillars: { academicReputation: 81.5, citationsPerFaculty: 75.2, employerReputation: 77.8, facultyStudentRatio: 60.5, internationalResearchNetwork: 86.8, employmentOutcomes: 75.3, sustainability: 85.2, internationalDiversity: 85.5 },
    trend: [20, 19, 19, 18, 18, 18], highlights: ["21 Nobel Prize winners", "One of Europe's oldest universities", "Schrödinger and Freud's alma mater"],
  },
  {
    id: "warsaw", name: "University of Warsaw", country: "Poland", city: "Warsaw", founded: 1816, students: 44000, researchFocus: "Mathematics & Physics", logo: "🇵🇱", domain: "uw.edu.pl",
    pillars: { academicReputation: 74.8, citationsPerFaculty: 68.5, employerReputation: 72.3, facultyStudentRatio: 65.2, internationalResearchNetwork: 78.5, employmentOutcomes: 70.8, sustainability: 76.2, internationalDiversity: 68.5 },
    trend: [22, 21, 21, 20, 20, 20], highlights: ["Poland's top-ranked university", "Strong mathematics tradition", "5 Nobel Prize winners"],
  },
  {
    id: "cuhk", name: "Chinese University of Hong Kong", country: "China", city: "Hong Kong", founded: 1963, students: 25000, researchFocus: "Business & Medicine", logo: "🏯", domain: "cuhk.edu.hk",
    pillars: { academicReputation: 83.5, citationsPerFaculty: 80.2, employerReputation: 85.8, facultyStudentRatio: 78.5, internationalResearchNetwork: 84.2, employmentOutcomes: 84.5, sustainability: 82.1, internationalDiversity: 88.5 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["Bilingual Chinese-English education", "Nobel laureate Charles Kao", "Mountain campus with harbour views"],
  },
  {
    id: "unam-mx", name: "Monterrey Institute of Technology", country: "Mexico", city: "Monterrey", founded: 1943, students: 90000, researchFocus: "Business & Engineering", logo: "🇲🇽", domain: "tec.mx",
    pillars: { academicReputation: 72.5, citationsPerFaculty: 58.8, employerReputation: 80.2, facultyStudentRatio: 68.5, internationalResearchNetwork: 65.8, employmentOutcomes: 82.5, sustainability: 74.2, internationalDiversity: 52.8 },
    trend: [21, 20, 20, 19, 19, 19], highlights: ["Mexico's top private university", "Strong entrepreneurship ecosystem", "26 campuses across Mexico"],
  },
  {
    id: "oslo", name: "University of Oslo", country: "Norway", city: "Oslo", founded: 1811, students: 27000, researchFocus: "Law & Medicine", logo: "🇳🇴", domain: "uio.no",
    pillars: { academicReputation: 80.8, citationsPerFaculty: 82.5, employerReputation: 74.5, facultyStudentRatio: 72.8, internationalResearchNetwork: 89.2, employmentOutcomes: 76.8, sustainability: 93.5, internationalDiversity: 78.2 },
    trend: [18, 17, 17, 16, 16, 16], highlights: ["5 Nobel Prize winners", "Awards the Nobel Peace Prize", "Norway's oldest and largest university"],
  },
  {
    id: "zurich", name: "University of Zurich", country: "Switzerland", city: "Zurich", founded: 1833, students: 28000, researchFocus: "Medicine & Economics", logo: "🇨🇭", domain: "uzh.ch",
    pillars: { academicReputation: 85.2, citationsPerFaculty: 86.8, employerReputation: 80.5, facultyStudentRatio: 74.2, internationalResearchNetwork: 90.5, employmentOutcomes: 80.2, sustainability: 91.2, internationalDiversity: 88.8 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["12 Nobel Prize winners", "Einstein studied here", "Leading immunology research"],
  },
  {
    id: "uq", name: "University of Queensland", country: "Australia", city: "Brisbane", founded: 1909, students: 55000, researchFocus: "Bioengineering & Mining", logo: "🦘", domain: "uq.edu.au",
    pillars: { academicReputation: 82.5, citationsPerFaculty: 77.8, employerReputation: 81.2, facultyStudentRatio: 70.5, internationalResearchNetwork: 85.8, employmentOutcomes: 80.5, sustainability: 89.8, internationalDiversity: 91.2 },
    trend: [17, 16, 16, 15, 15, 15], highlights: ["HPV vaccine developed here", "Leading coral reef research", "Triple-crown accredited business school"],
  },
  {
    id: "yonsei", name: "Yonsei University", country: "South Korea", city: "Seoul", founded: 1885, students: 38000, researchFocus: "Medicine & Engineering", logo: "🇰🇷", domain: "yonsei.ac.kr",
    pillars: { academicReputation: 82.8, citationsPerFaculty: 74.5, employerReputation: 85.2, facultyStudentRatio: 78.2, internationalResearchNetwork: 75.8, employmentOutcomes: 86.2, sustainability: 79.5, internationalDiversity: 68.5 },
    trend: [16, 15, 15, 14, 14, 14], highlights: ["Part of prestigious SKY universities", "First modern hospital in Korea — Severance", "Strong medical and engineering programs"],
  },
  {
    id: "lund", name: "Lund University", country: "Sweden", city: "Lund", founded: 1666, students: 46000, researchFocus: "Physics & Medicine", logo: "🇸🇪", domain: "lu.se",
    pillars: { academicReputation: 84.2, citationsPerFaculty: 82.8, employerReputation: 78.5, facultyStudentRatio: 73.8, internationalResearchNetwork: 91.2, employmentOutcomes: 79.5, sustainability: 93.8, internationalDiversity: 85.2 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["MAX IV synchrotron facility", "ESS neutron source partner", "Sweden's largest university"],
  },
  {
    id: "buenosaires-tec", name: "Instituto Tecnológico de Buenos Aires", country: "Argentina", city: "Buenos Aires", founded: 1959, students: 8000, researchFocus: "Engineering & Data Science", logo: "🇦🇷", domain: "itba.edu.ar",
    pillars: { academicReputation: 62.5, citationsPerFaculty: 55.8, employerReputation: 70.2, facultyStudentRatio: 72.5, internationalResearchNetwork: 52.8, employmentOutcomes: 72.5, sustainability: 60.5, internationalDiversity: 38.5 },
    trend: [25, 24, 24, 23, 23, 23], highlights: ["Top engineering school in Argentina", "Strong industry ties in Buenos Aires", "Growing AI and data science programs"],
  },
  {
    id: "stellenbosch", name: "Stellenbosch University", country: "South Africa", city: "Stellenbosch", founded: 1866, students: 32000, researchFocus: "Agriculture & Business", logo: "🇿🇦", domain: "sun.ac.za",
    pillars: { academicReputation: 67.5, citationsPerFaculty: 62.8, employerReputation: 65.2, facultyStudentRatio: 62.5, internationalResearchNetwork: 70.2, employmentOutcomes: 65.8, sustainability: 75.5, internationalDiversity: 55.8 },
    trend: [21, 20, 20, 19, 19, 19], highlights: ["South Africa's #2 research university", "Winelands setting — viticulture research", "First heart transplant team trained here"],
  },
  {
    id: "lagos", name: "University of Lagos", country: "Nigeria", city: "Lagos", founded: 1962, students: 57000, researchFocus: "Medicine & Engineering", logo: "🇳🇬", domain: "unilag.edu.ng",
    pillars: { academicReputation: 58.2, citationsPerFaculty: 42.5, employerReputation: 60.8, facultyStudentRatio: 45.2, internationalResearchNetwork: 48.5, employmentOutcomes: 55.8, sustainability: 52.5, internationalDiversity: 32.8 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Nigeria's premier university", "Located in Africa's largest city", "Leading medical research in West Africa"],
  },
  {
    id: "makerere", name: "Makerere University", country: "Uganda", city: "Kampala", founded: 1922, students: 36000, researchFocus: "Public Health & Agriculture", logo: "🇺🇬", domain: "mak.ac.ug",
    pillars: { academicReputation: 55.8, citationsPerFaculty: 40.2, employerReputation: 54.5, facultyStudentRatio: 42.8, internationalResearchNetwork: 52.5, employmentOutcomes: 50.2, sustainability: 56.8, internationalDiversity: 38.5 },
    trend: [27, 26, 26, 25, 25, 25], highlights: ["East Africa's oldest university", "Leading infectious disease research", "Partnership with Johns Hopkins and Yale"],
  },
  {
    id: "auc", name: "American University in Cairo", country: "Egypt", city: "Cairo", founded: 1919, students: 6500, researchFocus: "Engineering & Liberal Arts", logo: "🇪🇬", domain: "aucegypt.edu",
    pillars: { academicReputation: 62.8, citationsPerFaculty: 55.2, employerReputation: 68.5, facultyStudentRatio: 72.5, internationalResearchNetwork: 60.8, employmentOutcomes: 66.5, sustainability: 62.8, internationalDiversity: 58.5 },
    trend: [23, 22, 22, 21, 21, 21], highlights: ["Top liberal arts university in Arab world", "State-of-the-art New Cairo campus", "Strong Egyptology and Middle East studies"],
  },
  {
    id: "itu", name: "Istanbul Technical University", country: "Turkey", city: "Istanbul", founded: 1773, students: 35000, researchFocus: "Engineering & Architecture", logo: "🇹🇷", domain: "itu.edu.tr",
    pillars: { academicReputation: 70.5, citationsPerFaculty: 62.8, employerReputation: 72.5, facultyStudentRatio: 65.8, internationalResearchNetwork: 68.2, employmentOutcomes: 70.5, sustainability: 65.8, internationalDiversity: 52.5 },
    trend: [22, 21, 21, 20, 20, 20], highlights: ["250 years of engineering education", "Turkey's oldest technical university", "Leading earthquake engineering research"],
  },
  {
    id: "tehran", name: "University of Tehran", country: "Iran", city: "Tehran", founded: 1934, students: 50000, researchFocus: "Engineering & Medicine", logo: "🇮🇷", domain: "ut.ac.ir",
    pillars: { academicReputation: 68.5, citationsPerFaculty: 60.2, employerReputation: 66.8, facultyStudentRatio: 58.5, internationalResearchNetwork: 55.8, employmentOutcomes: 62.5, sustainability: 58.2, internationalDiversity: 35.8 },
    trend: [24, 23, 23, 22, 22, 22], highlights: ["Iran's oldest modern university", "Leading nanotechnology research", "Strong engineering and medical faculties"],
  },
  {
    id: "chula", name: "Chulalongkorn University", country: "Thailand", city: "Bangkok", founded: 1917, students: 38000, researchFocus: "Medicine & Engineering", logo: "🇹🇭", domain: "chula.ac.th",
    pillars: { academicReputation: 72.8, citationsPerFaculty: 62.5, employerReputation: 78.2, facultyStudentRatio: 68.5, internationalResearchNetwork: 65.8, employmentOutcomes: 75.5, sustainability: 72.8, internationalDiversity: 52.2 },
    trend: [20, 19, 19, 18, 18, 18], highlights: ["Thailand's oldest and most prestigious university", "Named after King Chulalongkorn", "Leading tropical medicine research"],
  },
  {
    id: "up", name: "University of the Philippines", country: "Philippines", city: "Quezon City", founded: 1908, students: 66000, researchFocus: "Marine Science & Public Policy", logo: "🇵🇭", domain: "up.edu.ph",
    pillars: { academicReputation: 65.2, citationsPerFaculty: 48.5, employerReputation: 68.8, facultyStudentRatio: 55.2, internationalResearchNetwork: 52.8, employmentOutcomes: 62.8, sustainability: 60.5, internationalDiversity: 35.8 },
    trend: [24, 23, 23, 22, 22, 22], highlights: ["Philippines' national university", "Strong marine biology programs", "Produced most Philippine national leaders"],
  },
  {
    id: "um", name: "University of Malaya", country: "Malaysia", city: "Kuala Lumpur", founded: 1905, students: 28000, researchFocus: "Engineering & Medicine", logo: "🇲🇾", domain: "um.edu.my",
    pillars: { academicReputation: 75.8, citationsPerFaculty: 68.2, employerReputation: 78.5, facultyStudentRatio: 72.5, internationalResearchNetwork: 72.8, employmentOutcomes: 78.2, sustainability: 78.5, internationalDiversity: 62.8 },
    trend: [18, 17, 17, 16, 16, 16], highlights: ["Malaysia's oldest university", "QS Top 100 globally", "Leading palm oil and tropical research"],
  },
  {
    id: "hanoi", name: "Vietnam National University, Hanoi", country: "Vietnam", city: "Hanoi", founded: 1906, students: 42000, researchFocus: "Sciences & Technology", logo: "🇻🇳", domain: "vnu.edu.vn",
    pillars: { academicReputation: 60.5, citationsPerFaculty: 48.8, employerReputation: 62.5, facultyStudentRatio: 55.8, internationalResearchNetwork: 50.2, employmentOutcomes: 58.5, sustainability: 55.8, internationalDiversity: 32.5 },
    trend: [26, 25, 25, 24, 24, 24], highlights: ["Vietnam's most prestigious university", "Strong mathematics tradition", "Growing CS and AI research programs"],
  },
  {
    id: "waterloo", name: "University of Waterloo", country: "Canada", city: "Waterloo, ON", founded: 1957, students: 42000, researchFocus: "CS & Mathematics", logo: "🍁", domain: "uwaterloo.ca",
    pillars: { academicReputation: 82.5, citationsPerFaculty: 78.8, employerReputation: 88.5, facultyStudentRatio: 75.2, internationalResearchNetwork: 80.5, employmentOutcomes: 90.5, sustainability: 82.8, internationalDiversity: 85.2 },
    trend: [15, 14, 14, 13, 13, 13], highlights: ["World's largest co-op program", "Top feeder to Silicon Valley", "Leading quantum computing — IQC"],
  },
  {
    id: "berkeley", name: "University of California, Berkeley", country: "USA", city: "Berkeley, CA", founded: 1868, students: 45000, researchFocus: "CS & Public Policy", logo: "🏛️", domain: "berkeley.edu",
    pillars: { academicReputation: 98.2, citationsPerFaculty: 95.5, employerReputation: 96.8, facultyStudentRatio: 82.5, internationalResearchNetwork: 92.8, employmentOutcomes: 95.2, sustainability: 92.5, internationalDiversity: 78.5 },
    trend: [5, 5, 4, 4, 5, 5], highlights: ["114 Nobel laureates", "Birthplace of the Free Speech Movement", "Leading public university globally"],
  },
  {
    id: "ucla", name: "University of California, Los Angeles", country: "USA", city: "Los Angeles, CA", founded: 1919, students: 46000, researchFocus: "Film & Medicine", logo: "🏛️", domain: "ucla.edu",
    pillars: { academicReputation: 94.5, citationsPerFaculty: 88.2, employerReputation: 93.5, facultyStudentRatio: 78.8, internationalResearchNetwork: 89.5, employmentOutcomes: 93.8, sustainability: 90.2, internationalDiversity: 80.5 },
    trend: [9, 9, 8, 8, 9, 9], highlights: ["Most applied-to university in the US", "Pioneering internet — birthplace of ARPANET", "Award-winning film school — TFT"],
  },
  // ─── Bangladesh — More Universities ────────────────────────────────────────
  {
    id: "nu", name: "National University, Bangladesh", country: "Bangladesh", city: "Gazipur", founded: 1992, students: 2800000, researchFocus: "Affiliated Colleges", logo: "🇧🇩", domain: "nu.ac.bd",
    pillars: { academicReputation: 38.5, citationsPerFaculty: 28.2, employerReputation: 42.5, facultyStudentRatio: 25.8, internationalResearchNetwork: 20.5, employmentOutcomes: 42.8, sustainability: 38.5, internationalDiversity: 8.2 },
    trend: [38, 37, 37, 36, 36, 36], highlights: ["Largest university by enrollment globally", "Affiliates 2,200+ colleges nationwide", "Massive distance education reach"],
  },
  {
    id: "sec", name: "Southeast University", country: "Bangladesh", city: "Dhaka", founded: 2002, students: 7500, researchFocus: "CS & Textile", logo: "🇧🇩", domain: "seu.edu.bd",
    pillars: { academicReputation: 37.2, citationsPerFaculty: 33.5, employerReputation: 43.8, facultyStudentRatio: 48.2, internationalResearchNetwork: 24.5, employmentOutcomes: 47.5, sustainability: 38.8, internationalDiversity: 16.5 },
    trend: [33, 32, 32, 31, 31, 31], highlights: ["Growing CS and IT programs", "Strong textile engineering department", "Industry-focused curriculum"],
  },
  {
    id: "primeasia", name: "Primeasia University", country: "Bangladesh", city: "Dhaka", founded: 2003, students: 5500, researchFocus: "Business & Law", logo: "🇧🇩", domain: "primeasia.edu.bd",
    pillars: { academicReputation: 35.5, citationsPerFaculty: 30.2, employerReputation: 40.5, facultyStudentRatio: 46.8, internationalResearchNetwork: 22.5, employmentOutcomes: 44.2, sustainability: 36.5, internationalDiversity: 14.8 },
    trend: [35, 34, 34, 33, 33, 33], highlights: ["Central Dhaka location", "Strong law and business programs", "Growing student body"],
  },
  {
    id: "bgc", name: "BGC Trust University Bangladesh", country: "Bangladesh", city: "Chittagong", founded: 2012, students: 4000, researchFocus: "Medicine & Engineering", logo: "🇧🇩", domain: "bgctub.ac.bd",
    pillars: { academicReputation: 34.8, citationsPerFaculty: 31.5, employerReputation: 39.2, facultyStudentRatio: 52.5, internationalResearchNetwork: 22.8, employmentOutcomes: 43.5, sustainability: 37.2, internationalDiversity: 12.5 },
    trend: [36, 35, 35, 34, 34, 34], highlights: ["Medical college and engineering combined", "Chittagong-based charitable trust university", "Modern laboratory facilities"],
  },
  {
    id: "cubd", name: "City University Bangladesh", country: "Bangladesh", city: "Dhaka", founded: 2002, students: 9000, researchFocus: "Business & CS", logo: "🇧🇩", domain: "cityuniversity.edu.bd",
    pillars: { academicReputation: 36.8, citationsPerFaculty: 32.2, employerReputation: 42.8, facultyStudentRatio: 47.5, internationalResearchNetwork: 23.8, employmentOutcomes: 46.5, sustainability: 37.8, internationalDiversity: 17.2 },
    trend: [34, 33, 33, 32, 32, 32], highlights: ["Strong BBA and MBA programs", "Central Dhaka campus", "Active industry engagement"],
  },
  {
    id: "bubt", name: "Bangladesh University of Business & Technology", country: "Bangladesh", city: "Dhaka", founded: 2003, students: 12000, researchFocus: "Business & Technology", logo: "🇧🇩", domain: "bubt.edu.bd",
    pillars: { academicReputation: 38.2, citationsPerFaculty: 33.8, employerReputation: 44.5, facultyStudentRatio: 48.8, internationalResearchNetwork: 25.2, employmentOutcomes: 48.8, sustainability: 39.2, internationalDiversity: 18.5 },
    trend: [32, 31, 31, 30, 30, 30], highlights: ["Mirpur campus with modern facilities", "Strong business administration focus", "Active student organizations"],
  },
  {
    id: "baiust", name: "Bangladesh Army International University of Science & Technology", country: "Bangladesh", city: "Comilla", founded: 2013, students: 3500, researchFocus: "Engineering & CS", logo: "🇧🇩", domain: "baiust.edu.bd",
    pillars: { academicReputation: 36.5, citationsPerFaculty: 33.2, employerReputation: 42.2, facultyStudentRatio: 55.8, internationalResearchNetwork: 23.2, employmentOutcomes: 46.8, sustainability: 38.5, internationalDiversity: 12.8 },
    trend: [34, 33, 33, 32, 32, 32], highlights: ["Military-backed discipline", "Strong engineering programs", "Growing international collaborations"],
  },
  {
    id: "bauet", name: "Bangladesh Army University of Engineering & Technology", country: "Bangladesh", city: "Natore", founded: 2015, students: 2500, researchFocus: "Engineering & Technology", logo: "🇧🇩", domain: "bauet.ac.bd",
    pillars: { academicReputation: 35.2, citationsPerFaculty: 32.5, employerReputation: 41.5, facultyStudentRatio: 58.2, internationalResearchNetwork: 22.5, employmentOutcomes: 47.5, sustainability: 37.5, internationalDiversity: 10.5 },
    trend: [35, 34, 34, 33, 33, 33], highlights: ["Newest military engineering university", "Strict academic discipline", "Focus on applied engineering"],
  },
  {
    id: "bsmrau", name: "Bangabandhu Sheikh Mujibur Rahman Agricultural University", country: "Bangladesh", city: "Gazipur", founded: 1998, students: 3000, researchFocus: "Agriculture & Food Science", logo: "🇧🇩", domain: "bsmrau.edu.bd",
    pillars: { academicReputation: 42.5, citationsPerFaculty: 40.2, employerReputation: 44.8, facultyStudentRatio: 52.8, internationalResearchNetwork: 30.5, employmentOutcomes: 48.2, sustainability: 55.2, internationalDiversity: 12.2 },
    trend: [29, 28, 28, 27, 27, 27], highlights: ["Specialized agricultural research university", "Food security and crop science focus", "Strong ties to national agriculture sector"],
  },
];


// Build the final dataset with computed scores and ranks
export function generateUniversities(): University[] {
  const withScores = RAW.map((u) => ({
    ...u,
    overallScore: calculateOverallScore(u.pillars),
    rank: 0,
  }));
  withScores.sort((a, b) => b.overallScore - a.overallScore);
  withScores.forEach((u, i) => (u.rank = i + 1));
  return withScores;
}

/**
 * Generate simulated 5-year rank history for a university.
 * Uses seeded deterministic variation based on university id.
 */
export function generateRankHistory(uni: University): { ranks: number[]; scores: number[] } {
  // Simple hash from id for determinism
  let hash = 0;
  for (let i = 0; i < uni.id.length; i++) hash = ((hash << 5) - hash + uni.id.charCodeAt(i)) | 0;
  const seed = Math.abs(hash);

  const ranks: number[] = [];
  const scores: number[] = [];

  for (let y = 0; y < 5; y++) {
    // Simulate gradual improvement or decline based on current rank
    const drift = ((seed * (y + 1) * 7) % 7) - 3; // -3 to +3
    const yearRank = Math.max(1, uni.rank + (4 - y) * drift);
    ranks.push(Math.round(yearRank));

    const scoreDrift = ((seed * (y + 1) * 13) % 11) - 5; // -5 to +5
    const yearScore = Math.max(0, Math.min(100, uni.overallScore + (4 - y) * scoreDrift * 0.3));
    scores.push(Math.round(yearScore * 10) / 10);
  }

  // Last year is always current
  ranks[4] = uni.rank;
  scores[4] = uni.overallScore;

  return { ranks, scores };
}

/**
 * Simulate a real-time refresh: jitter every pillar by ±2 points,
 * then recalculate scores and re-sort.
 */
export function refreshScores(unis: University[]): University[] {
  const jitter = () => Math.round((Math.random() * 4 - 2) * 10) / 10;
  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const updated = unis.map((u) => {
    const newPillars = { ...u.pillars };
    for (const key of Object.keys(newPillars) as PillarKey[]) {
      newPillars[key] = clamp(newPillars[key] + jitter());
    }
    return { ...u, pillars: newPillars, overallScore: calculateOverallScore(newPillars) };
  });

  updated.sort((a, b) => b.overallScore - a.overallScore);
  updated.forEach((u, i) => (u.rank = i + 1));
  return updated;
}

// ─── Region mapping ─────────────────────────────────────────────────────────
export const REGION_MAP: Record<string, string> = {
  "USA": "North America", "Canada": "North America",
  "Mexico": "Latin America", "Brazil": "Latin America", "Argentina": "Latin America", "Chile": "Latin America",
  "UK": "Europe", "Germany": "Europe", "Switzerland": "Europe", "France": "Europe",
  "Sweden": "Europe", "Netherlands": "Europe", "Russia": "Europe",
  "Belgium": "Europe", "Denmark": "Europe", "Finland": "Europe", "Italy": "Europe",
  "Austria": "Europe", "Poland": "Europe", "Norway": "Europe",
  "Japan": "Asia", "China": "Asia", "Singapore": "Asia", "South Korea": "Asia",
  "India": "Asia", "Bangladesh": "Asia", "Thailand": "Asia", "Philippines": "Asia",
  "Malaysia": "Asia", "Vietnam": "Asia",
  "Israel": "Middle East", "Saudi Arabia": "Middle East", "Turkey": "Middle East", "Iran": "Middle East",
  "Egypt": "Africa", "South Africa": "Africa", "Kenya": "Africa", "Nigeria": "Africa", "Uganda": "Africa",
  "Australia": "Oceania",
};

export const REGIONS = [...new Set(Object.values(REGION_MAP))].sort();

// ─── Filter constants ───────────────────────────────────────────────────────
export const COUNTRIES = [...new Set(RAW.map((u) => u.country))].sort();
export const RESEARCH_FOCUSES = [...new Set(RAW.map((u) => u.researchFocus))].sort();
export const SUBJECTS = [
  "Engineering", "Computer Science", "Medicine", "Business",
  "Arts & Humanities", "Natural Sciences", "Technology",
  "Law", "Sciences", "Humanities", "Mathematics",
  "Agriculture", "Social Sciences", "Economics",
  "Architecture", "Environmental", "Pharmacy",
];

// ─── Activity feed simulation ───────────────────────────────────────────────
export interface ActivityItem {
  id: number;
  text: string;
  time: string;
  type: "update" | "new" | "alert";
  universityName?: string;
  universityDomain?: string;
}

export function generateActivityFeed(): ActivityItem[] {
  const names = RAW.map((r) => r.name);
  const actions = [
    { prefix: "Updated: Citations data for", type: "update" as const },
    { prefix: "New: Employer survey results for", type: "new" as const },
    { prefix: "Updated: Sustainability index for", type: "update" as const },
    { prefix: "Alert: Rank change detected for", type: "alert" as const },
    { prefix: "New: International partnership for", type: "new" as const },
    { prefix: "Updated: Student satisfaction for", type: "update" as const },
  ];
  const mins = [1, 3, 7, 12, 18, 25, 34, 45];
  return Array.from({ length: 8 }, (_, i) => {
    const action = actions[i % actions.length];
    const uni = RAW[Math.floor(Math.random() * RAW.length)];
    return { id: i, text: `${action.prefix} ${uni.name}`, time: `${mins[i]}m ago`, type: action.type, universityName: uni.name, universityDomain: uni.domain };
  });
}
