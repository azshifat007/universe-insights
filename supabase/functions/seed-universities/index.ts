import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if universities already seeded
    const { count } = await supabaseAdmin.from("universities").select("*", { count: "exact", head: true });
    if (count && count > 0) {
      return new Response(JSON.stringify({ message: `Already seeded with ${count} universities` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batch } = await req.json();
    
    if (!batch || !Array.isArray(batch) || batch.length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert in chunks of 50
    const chunkSize = 50;
    let inserted = 0;
    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin.from("universities").insert(chunk);
      if (error) {
        console.error(`Error inserting chunk ${i}:`, error);
        // Skip duplicates
        if (!error.message.includes("duplicate")) {
          throw error;
        }
      } else {
        inserted += chunk.length;
      }
    }

    return new Response(JSON.stringify({ message: `Seeded ${inserted} universities` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
