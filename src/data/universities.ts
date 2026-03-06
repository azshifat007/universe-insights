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
  "Mexico": "Latin America", "Brazil": "Latin America", "Argentina": "Latin America",
  "UK": "Europe", "Germany": "Europe", "Switzerland": "Europe", "France": "Europe",
  "Sweden": "Europe", "Netherlands": "Europe", "Russia": "Europe",
  "Japan": "Asia", "China": "Asia", "Singapore": "Asia", "South Korea": "Asia",
  "India": "Asia", "Bangladesh": "Asia",
  "Israel": "Middle East", "Saudi Arabia": "Middle East",
  "Egypt": "Africa", "South Africa": "Africa", "Kenya": "Africa",
  "Australia": "Oceania",
};

export const REGIONS = [...new Set(Object.values(REGION_MAP))].sort();

// ─── Filter constants ───────────────────────────────────────────────────────
export const COUNTRIES = [...new Set(RAW.map((u) => u.country))].sort();
export const RESEARCH_FOCUSES = [...new Set(RAW.map((u) => u.researchFocus))].sort();
export const SUBJECTS = ["Engineering", "Computer Science", "Medicine", "Business", "Arts & Humanities", "Natural Sciences"];

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
