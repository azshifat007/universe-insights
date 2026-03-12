import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, AlertTriangle, Info, Bell } from "lucide-react";

const typeConfig: Record<string, { color: string; icon: typeof Info; dot: string }> = {
  Update: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Info, dot: "bg-blue-500" },
  Announcement: { color: "bg-secondary/10 text-secondary-foreground border-secondary/20", icon: Megaphone, dot: "bg-secondary" },
  Important: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle, dot: "bg-destructive" },
};

const Notices = () => {
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["active-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-7 w-7 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Notices & Updates</h1>
          </div>
          <p className="text-muted-foreground">Stay informed about the latest platform changes and announcements.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-24" />
              </Card>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-foreground mb-1">No new updates at the moment</h3>
              <p className="text-muted-foreground">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border hidden sm:block" />

            <div className="space-y-6">
              {notices.map((notice) => {
                const cfg = typeConfig[notice.type] || typeConfig.Announcement;
                const Icon = cfg.icon;
                return (
                  <div key={notice.id} className="relative flex gap-4 sm:gap-6">
                    {/* Timeline dot */}
                    <div className="hidden sm:flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${cfg.dot} ring-4 ring-background z-10 mt-5`} />
                    </div>

                    <Card className="flex-1 hover:shadow-md transition-shadow">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cfg.color}>
                            <Icon className="h-3 w-3 mr-1" />{notice.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(notice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-2">{notice.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{notice.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <DashboardFooter />
    </div>
  );
};

export default Notices;
