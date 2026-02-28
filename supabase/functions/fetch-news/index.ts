import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY");
    if (!GNEWS_API_KEY) throw new Error("GNEWS_API_KEY is not configured");

    const url = `https://gnews.io/api/v4/search?q="higher education" OR "university rankings"&lang=en&max=6&apikey=${GNEWS_API_KEY}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error("GNews API error:", resp.status, text);
      throw new Error(`GNews API error: ${resp.status}`);
    }

    const data = await resp.json();

    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || "Unknown",
    }));

    return new Response(JSON.stringify({ articles, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", articles: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
