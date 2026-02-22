export interface University {
  id: number;
  name: string;
  country: string;
  researchFocus: string;
  researchImpact: number;
  studentSatisfaction: number;
  infrastructureScore: number;
  overallScore: number;
  trend: number[]; // last 6 months ranking positions
}

const calcOverall = (r: number, s: number, i: number) =>
  Math.round((r * 0.4 + s * 0.3 + i * 0.3) * 10) / 10;

const BASE_DATA: Omit<University, "overallScore">[] = [
  { id: 1, name: "Massachusetts Institute of Technology", country: "USA", researchFocus: "Engineering", researchImpact: 98.2, studentSatisfaction: 94.1, infrastructureScore: 97.5, trend: [1, 1, 2, 1, 1, 1] },
  { id: 2, name: "University of Oxford", country: "UK", researchFocus: "Humanities", researchImpact: 96.8, studentSatisfaction: 93.5, infrastructureScore: 95.2, trend: [3, 2, 2, 2, 2, 2] },
  { id: 3, name: "Stanford University", country: "USA", researchFocus: "Technology", researchImpact: 97.1, studentSatisfaction: 92.8, infrastructureScore: 96.0, trend: [2, 3, 1, 3, 3, 3] },
  { id: 4, name: "University of Cambridge", country: "UK", researchFocus: "Sciences", researchImpact: 95.5, studentSatisfaction: 91.7, infrastructureScore: 94.8, trend: [4, 4, 4, 4, 4, 4] },
  { id: 5, name: "ETH Zurich", country: "Switzerland", researchFocus: "Engineering", researchImpact: 94.2, studentSatisfaction: 90.5, infrastructureScore: 96.3, trend: [5, 5, 5, 5, 5, 5] },
  { id: 6, name: "University of Tokyo", country: "Japan", researchFocus: "Sciences", researchImpact: 91.8, studentSatisfaction: 88.2, infrastructureScore: 93.5, trend: [7, 6, 6, 6, 6, 6] },
  { id: 7, name: "National University of Singapore", country: "Singapore", researchFocus: "Technology", researchImpact: 90.5, studentSatisfaction: 89.7, infrastructureScore: 94.1, trend: [6, 7, 7, 7, 7, 7] },
  { id: 8, name: "University of Melbourne", country: "Australia", researchFocus: "Medicine", researchImpact: 89.3, studentSatisfaction: 87.5, infrastructureScore: 91.2, trend: [8, 8, 9, 8, 8, 8] },
  { id: 9, name: "University of Toronto", country: "Canada", researchFocus: "Humanities", researchImpact: 88.7, studentSatisfaction: 86.9, infrastructureScore: 90.8, trend: [9, 9, 8, 9, 9, 9] },
  { id: 10, name: "Tsinghua University", country: "China", researchFocus: "Engineering", researchImpact: 92.1, studentSatisfaction: 85.3, infrastructureScore: 93.8, trend: [10, 10, 10, 10, 10, 10] },
  { id: 11, name: "Ludwig Maximilian University", country: "Germany", researchFocus: "Sciences", researchImpact: 87.4, studentSatisfaction: 84.6, infrastructureScore: 89.5, trend: [11, 12, 11, 11, 11, 11] },
  { id: 12, name: "Seoul National University", country: "South Korea", researchFocus: "Technology", researchImpact: 86.9, studentSatisfaction: 85.1, infrastructureScore: 90.2, trend: [12, 11, 12, 12, 12, 12] },
  { id: 13, name: "University of São Paulo", country: "Brazil", researchFocus: "Medicine", researchImpact: 83.5, studentSatisfaction: 82.1, infrastructureScore: 85.7, trend: [14, 13, 13, 14, 13, 13] },
  { id: 14, name: "Indian Institute of Technology Bombay", country: "India", researchFocus: "Engineering", researchImpact: 85.2, studentSatisfaction: 81.8, infrastructureScore: 84.3, trend: [13, 14, 14, 13, 14, 14] },
  { id: 15, name: "University of Cape Town", country: "South Africa", researchFocus: "Humanities", researchImpact: 80.1, studentSatisfaction: 79.5, infrastructureScore: 82.6, trend: [15, 15, 15, 15, 15, 15] },
];

export const generateUniversities = (): University[] =>
  BASE_DATA.map((u) => ({
    ...u,
    overallScore: calcOverall(u.researchImpact, u.studentSatisfaction, u.infrastructureScore),
  })).sort((a, b) => b.overallScore - a.overallScore);

export const refreshScores = (unis: University[]): University[] =>
  unis
    .map((u) => {
      const jitter = () => Math.round((Math.random() * 4 - 2) * 10) / 10;
      const clamp = (v: number) => Math.min(100, Math.max(0, v));
      const ri = clamp(u.researchImpact + jitter());
      const ss = clamp(u.studentSatisfaction + jitter());
      const is_ = clamp(u.infrastructureScore + jitter());
      return {
        ...u,
        researchImpact: ri,
        studentSatisfaction: ss,
        infrastructureScore: is_,
        overallScore: calcOverall(ri, ss, is_),
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);

export const COUNTRIES = [...new Set(BASE_DATA.map((u) => u.country))].sort();
export const RESEARCH_FOCUSES = [...new Set(BASE_DATA.map((u) => u.researchFocus))].sort();
