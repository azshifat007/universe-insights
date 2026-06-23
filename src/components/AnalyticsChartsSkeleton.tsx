import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = ({ title }: { title: string }) => (
  <div className="glass-card rounded-lg p-6">
    <Skeleton className="h-5 w-48 mb-4" />
    <div className="h-[280px] flex items-end justify-between gap-2 px-2 pb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${30 + ((i * 53) % 65)}%` }}
        />
      ))}
    </div>
    <span className="sr-only">Loading {title}</span>
  </div>
);

const AnalyticsChartsSkeleton = () => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <ChartSkeleton title="Top 5 — Key Metrics" />
    <ChartSkeleton title="Ranking Trend" />
  </div>
);

export default AnalyticsChartsSkeleton;
