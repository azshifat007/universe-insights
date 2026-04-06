import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, RefreshCw, Newspaper, GraduationCap, Clock, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  type: "news" | "rankings";
  timestamp: string;
  status: "success" | "error";
  responseTime: number;
  data: unknown;
  endpoint: string;
}

export function SystemLogsTab() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-system-logs"],
    queryFn: async () => {
      const entries: LogEntry[] = [];

      // Fetch news API response
      const newsStart = performance.now();
      try {
        const { data, error } = await supabase.functions.invoke("fetch-news");
        const newsEnd = performance.now();
        entries.push({
          id: `news-${Date.now()}`,
          type: "news",
          timestamp: new Date().toISOString(),
          status: error ? "error" : "success",
          responseTime: Math.round(newsEnd - newsStart),
          data: error || data,
          endpoint: "fetch-news",
        });
      } catch (e: any) {
        entries.push({
          id: `news-err-${Date.now()}`,
          type: "news",
          timestamp: new Date().toISOString(),
          status: "error",
          responseTime: 0,
          data: { error: e.message },
          endpoint: "fetch-news",
        });
      }

      // Fetch rankings (universities) raw response
      const rankStart = performance.now();
      try {
        const { data, error, count } = await supabase
          .from("universities")
          .select("*", { count: "exact" })
          .order("academic_reputation", { ascending: false })
          .limit(10);
        const rankEnd = performance.now();
        entries.push({
          id: `rank-${Date.now()}`,
          type: "rankings",
          timestamp: new Date().toISOString(),
          status: error ? "error" : "success",
          responseTime: Math.round(rankEnd - rankStart),
          data: error || { count, rows: data },
          endpoint: "universities (top 10 by academic_reputation)",
        });
      } catch (e: any) {
        entries.push({
          id: `rank-err-${Date.now()}`,
          type: "rankings",
          timestamp: new Date().toISOString(),
          status: "error",
          responseTime: 0,
          data: { error: e.message },
          endpoint: "universities",
        });
      }

      // Fetch recent news from DB
      const dbNewsStart = performance.now();
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(5);
        const dbNewsEnd = performance.now();
        entries.push({
          id: `dbnews-${Date.now()}`,
          type: "news",
          timestamp: new Date().toISOString(),
          status: error ? "error" : "success",
          responseTime: Math.round(dbNewsEnd - dbNewsStart),
          data: error || data,
          endpoint: "news (DB, latest 5)",
        });
      } catch (e: any) {
        entries.push({
          id: `dbnews-err-${Date.now()}`,
          type: "news",
          timestamp: new Date().toISOString(),
          status: "error",
          responseTime: 0,
          data: { error: e.message },
          endpoint: "news (DB)",
        });
      }

      return entries;
    },
    refetchOnWindowFocus: false,
  });

  const copyJson = (id: string, data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Logs
              </CardTitle>
              <CardDescription>
                Live API responses from Trending News and Ranking endpoints
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {log.type === "news" ? (
                    <Newspaper className="h-4 w-4 text-blue-500" />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{log.endpoint}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {log.responseTime}ms
                  </Badge>
                  <Badge
                    variant={log.status === "success" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {log.status === "success" ? "200 OK" : "ERROR"}
                  </Badge>
                </div>
              </button>
              {expandedId === log.id && (
                <div className="border-t">
                  <div className="flex items-center justify-end px-4 py-2 bg-[#1e1e2e]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyJson(log.id, log.data)}
                      className="text-xs text-slate-400 hover:text-slate-200 gap-1"
                    >
                      {copiedId === log.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === log.id ? "Copied" : "Copy JSON"}
                    </Button>
                  </div>
                  <ScrollArea className="max-h-[400px]">
                    <pre className="p-4 bg-[#1e1e2e] text-[#a6e3a1] text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No logs available. Click Refresh to fetch live data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
