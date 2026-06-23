import { useState } from "react";
import { ActivityItem } from "@/data/universities";
import { Activity, RefreshCw, AlertCircle, PlusCircle, Circle, ExternalLink, Tag, Sparkles, ListChecks } from "lucide-react";
import UniversityLogo from "@/components/UniversityLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const ActivityFeed = ({ items }: ActivityFeedProps) => {
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const style = selected ? styleMap[selected.type] : null;
  const Icon = selected ? iconMap[selected.type] : null;

  return (
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
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />

        {items.map((item, idx) => {
          const ItemIcon = iconMap[item.type];
          const s = styleMap[item.type];
          return (
            <li
              key={item.id}
              className="table-row-enter"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="relative flex w-full items-start gap-3 rounded-md p-2 -ml-1 text-left hover:bg-muted/40 focus:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
                aria-label={`View details for ${item.text}`}
              >
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.bg} ring-2 ring-background group-hover:ring-secondary/30 transition-all`}>
                  <ItemIcon className={`h-3.5 w-3.5 ${s.icon}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${s.badge}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.universityDomain && (
                      <UniversityLogo domain={item.universityDomain} name={item.universityName || ""} className="h-4 w-4 shrink-0" />
                    )}
                    <p className="text-xs text-foreground/90 leading-snug truncate group-hover:text-foreground">{item.text}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="glass-card max-w-lg">
          {selected && style && Icon && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${style.bg}`}>
                    <Icon className={`h-5 w-5 ${style.icon}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`w-fit text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                      {style.label} • {selected.time}
                    </span>
                  </div>
                </div>
                <DialogTitle className="flex items-center gap-2 text-base">
                  {selected.universityDomain && (
                    <UniversityLogo domain={selected.universityDomain} name={selected.universityName || ""} className="h-5 w-5 shrink-0" />
                  )}
                  <span className="leading-snug">{selected.text}</span>
                </DialogTitle>
                <DialogDescription className="pt-1">{selected.summary}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{selected.category}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="h-3.5 w-3.5 text-secondary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">What changed</h4>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {selected.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-md p-3 bg-secondary/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-secondary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Impact</h4>
                  </div>
                  <p className="text-xs text-foreground/90">{selected.impact}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Sources</h4>
                  <ul className="space-y-1.5">
                    {selected.sources.map((src, i) => (
                      <li key={i}>
                        <a
                          href={src.url}
                          target={src.url.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {src.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityFeed;
