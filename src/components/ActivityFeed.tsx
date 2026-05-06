import { ActivityItem } from "@/data/universities";
import { Activity, RefreshCw, AlertCircle, PlusCircle, Circle } from "lucide-react";
import UniversityLogo from "@/components/UniversityLogo";

interface ActivityFeedProps {
  items: ActivityItem[];
}

const iconMap = {
  update: RefreshCw,
  new: PlusCircle,
  alert: AlertCircle,
};

const styleMap = {
  update: {
    icon: "text-secondary",
    bg: "bg-secondary/10",
    ring: "ring-secondary/20",
    label: "Update",
    badge: "bg-secondary/15 text-secondary",
  },
  new: {
    icon: "text-chart-5",
    bg: "bg-chart-5/10",
    ring: "ring-chart-5/20",
    label: "New",
    badge: "bg-chart-5/15 text-chart-5",
  },
  alert: {
    icon: "text-destructive",
    bg: "bg-destructive/10",
    ring: "ring-destructive/20",
    label: "Alert",
    badge: "bg-destructive/15 text-destructive",
  },
};

const ActivityFeed = ({ items }: ActivityFeedProps) => (
  <div className="glass-card rounded-lg p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Activity className="h-4 w-4 text-secondary" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
        </div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider">Activity Log</h3>
      </div>
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
        Live
      </span>
    </div>

    <ul className="relative space-y-2 max-h-80 overflow-y-auto pr-1 -mr-1">
      {/* vertical timeline line */}
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />

      {items.map((item, idx) => {
        const Icon = iconMap[item.type];
        const style = styleMap[item.type];
        return (
          <li
            key={item.id}
            className="relative flex items-start gap-3 rounded-md p-2 -ml-1 hover:bg-muted/40 transition-colors table-row-enter"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg} ring-2 ring-background`}>
              <Icon className={`h-3.5 w-3.5 ${style.icon}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                  {style.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.universityDomain && (
                  <UniversityLogo domain={item.universityDomain} name={item.universityName || ""} className="h-4 w-4 shrink-0" />
                )}
                <p className="text-xs text-foreground/90 leading-snug truncate">{item.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default ActivityFeed;
