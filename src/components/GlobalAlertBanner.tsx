import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

const GlobalAlertBanner = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: notice } = useQuery({
    queryKey: ["urgent-notice"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .eq("type", "Important")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  if (!notice || dismissed.includes(notice.id)) return null;

  return (
    <div className="bg-destructive text-destructive-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium truncate">{notice.title}</span>
          <Link to="/notices" className="underline underline-offset-2 shrink-0 hover:opacity-80">
            Read more →
          </Link>
        </div>
        <button onClick={() => setDismissed((p) => [...p, notice.id])} className="shrink-0 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GlobalAlertBanner;
