import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, Check, Download, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function SyntaxHighlightedJson({ json }: { json: string }) {
  // Simple syntax highlighting for JSON
  const highlighted = json.replace(
    /("(?:\\.|[^"\\])*")\s*:/g,
    '<span class="text-orange-400">$1</span>:'
  ).replace(
    /:\s*("(?:\\.|[^"\\])*")/g,
    ': <span class="text-emerald-400">$1</span>'
  ).replace(
    /:\s*(\d+\.?\d*)/g,
    ': <span class="text-purple-400">$1</span>'
  ).replace(
    /:\s*(true|false)/g,
    ': <span class="text-sky-400">$1</span>'
  ).replace(
    /:\s*(null)/g,
    ': <span class="text-red-400">$1</span>'
  );

  return (
    <pre
      className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

export function DataAuditTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: universities, isLoading } = useQuery({
    queryKey: ["admin-audit-universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!universities) return [];
    if (!search) return universities;
    const q = search.toLowerCase();
    return universities.filter(
      (u) => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [universities, search]);

  const selected = useMemo(() => {
    if (!selectedId || !universities) return null;
    return universities.find((u) => u.id === selectedId) ?? null;
  }, [selectedId, universities]);

  const jsonStr = useMemo(() => {
    if (!selected) return "";
    return JSON.stringify(selected, null, 2);
  }, [selected]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!selected) return;
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.slug}_raw_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg">Data Audit</h2>
        <span className="text-sm text-muted-foreground ml-2">
          Inspect raw JSON objects from the database
        </span>
      </div>

      <div className="flex gap-0 rounded-lg overflow-hidden border" style={{ height: "calc(100vh - 220px)" }}>
        {/* Left panel: University list */}
        <div className="w-72 min-w-[280px] flex flex-col bg-card border-r">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filtered.length} universities
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1">
              {filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors",
                    selectedId === u.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <p className="font-medium truncate">{u.name}</p>
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    selectedId === u.id ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {u.country} · {u.city}
                  </p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No results found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel: JSON viewer */}
        <div className="flex-1 flex flex-col" style={{ background: "#0f172a" }}>
          {selected ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selected.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{selected.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-1.5 text-xs"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadJson}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <SyntaxHighlightedJson json={jsonStr} />
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code2 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400 text-sm">Select a university to inspect its raw JSON data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
