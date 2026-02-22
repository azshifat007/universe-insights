import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import type { University } from "@/data/universities";

interface AnalyticsChartsProps {
  universities: University[];
}

const MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

const AnalyticsCharts = ({ universities }: AnalyticsChartsProps) => {
  const top5 = universities.slice(0, 5);

  const barData = top5.map((u) => ({
    name: u.name.length > 18 ? u.name.slice(0, 16) + "…" : u.name,
    "Academic Rep": u.pillars.academicReputation,
    "Citations": u.pillars.citationsPerFaculty,
  }));

  const lineData = MONTHS.map((month, i) => {
    const point: Record<string, string | number> = { month };
    top5.forEach((u) => {
      const shortName = u.name.length > 14 ? u.name.slice(0, 12) + "…" : u.name;
      point[shortName] = u.trend[i] ?? i + 1;
    });
    return point;
  });

  const lineColors = [
    "hsl(160, 60%, 40%)", "hsl(222, 60%, 18%)", "hsl(160, 50%, 55%)",
    "hsl(222, 40%, 30%)", "hsl(45, 90%, 55%)",
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-card rounded-lg p-6">
        <h3 className="font-display text-lg font-bold mb-4">Top 5 — Key Metrics</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,88%)", borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Academic Rep" fill="hsl(222,60%,18%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Citations" fill="hsl(160,60%,40%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-lg p-6">
        <h3 className="font-display text-lg font-bold mb-4">Ranking Trend — Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis reversed domain={[1, 15]} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,88%)", borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            {top5.map((u, i) => {
              const shortName = u.name.length > 14 ? u.name.slice(0, 12) + "…" : u.name;
              return <Line key={u.id} type="monotone" dataKey={shortName} stroke={lineColors[i]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
