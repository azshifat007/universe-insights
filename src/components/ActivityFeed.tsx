import { ActivityItem } from "@/data/universities";
import { Activity, RefreshCw, AlertCircle, PlusCircle } from "lucide-react";
import UniversityLogo from "@/components/UniversityLogo";

interface ActivityFeedProps {
  items: ActivityItem[];
}

const iconMap = {
  update: RefreshCw,
  new: PlusCircle,
  alert: AlertCircle,
};

const colorMap = {
  update: "text-secondary",
  new: "text-chart-5",
  alert: "text-destructive",
};

const ActivityFeed = ({ items }: ActivityFeedProps) => (
  <div className="glass-card rounded-lg p-5">
    <div className="flex items-center gap-2 mb-4">
      <Activity className="h-4 w-4 text-secondary" />
      <h3 className="font-display text-sm font-bold uppercase tracking-wider">Activity Log</h3>
    </div>
    <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {items.map((item) => {
        const Icon = iconMap[item.type];
        return (
          <li key={item.id} className="flex items-center gap-2.5 text-xs table-row-enter" style={{ animationDelay: `${item.id * 60}ms` }}>
            <Icon className={`h-3.5 w-3.5 shrink-0 ${colorMap[item.type]}`} />
            {item.universityDomain && (
              <UniversityLogo domain={item.universityDomain} name={item.universityName || ""} className="h-5 w-5" />
            )}
            <span className="text-foreground/80 leading-relaxed flex-1 truncate">{item.text}</span>
            <span className="ml-auto text-muted-foreground shrink-0">{item.time}</span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default ActivityFeed;
