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
    name: u.name.length > 20 ? u.name.slice(0, 18) + "…" : u.name,
    "Research Impact": u.researchImpact,
  }));

  const lineData = MONTHS.map((month, i) => {
    const point: Record<string, string | number> = { month };
    top5.forEach((u) => {
      const shortName = u.name.length > 15 ? u.name.slice(0, 13) + "…" : u.name;
      point[shortName] = u.trend[i] ?? i + 1;
    });
    return point;
  });

  const lineColors = [
    "hsl(160, 60%, 40%)",
    "hsl(222, 60%, 18%)",
    "hsl(160, 50%, 55%)",
    "hsl(222, 40%, 30%)",
    "hsl(45, 90%, 55%)",
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="glass-card rounded-lg p-6">
        <h3 className="font-display text-lg font-bold mb-4">Top 5 — Research Impact</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0,0%,100%)",
                border: "1px solid hsl(220,15%,88%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="Research Impact" fill="hsl(160,60%,40%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="glass-card rounded-lg p-6">
        <h3 className="font-display text-lg font-bold mb-4">Ranking Trend — Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis reversed domain={[1, 15]} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0,0%,100%)",
                border: "1px solid hsl(220,15%,88%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            {top5.map((u, i) => {
              const shortName = u.name.length > 15 ? u.name.slice(0, 13) + "…" : u.name;
              return (
                <Line
                  key={u.id}
                  type="monotone"
                  dataKey={shortName}
                  stroke={lineColors[i]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
