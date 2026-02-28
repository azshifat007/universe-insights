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
    const { messages, universityData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt with live university data
    const systemPrompt = `You are the Universe AI Counselor — a friendly, knowledgeable assistant for the Universe Analytics university ranking platform.

Your role:
- Help users explore university rankings, compare institutions, and find their best-fit university.
- Answer questions about ranking methodology, university profiles, and admissions guidance.
- Be concise, helpful, and use data from the live rankings when available.

LIVE RANKING DATA (use this to answer questions about current rankings):
${universityData || "No ranking data available at the moment."}

RANKING METHODOLOGY:
The Overall Score (0–100) is a weighted average of 8 pillars:
1. Academic Reputation — 30% (peer review surveys)
2. Citations per Faculty — 20% (research impact)
3. Employer Reputation — 15% (employability surveys)
4. Faculty-to-Student Ratio — 10%
5. International Research Network — 5%
6. Employment Outcomes — 5%
7. Sustainability — 5%
8. International Diversity — 10%

Guidelines:
- When users ask about specific university ranks or scores, reference the LIVE RANKING DATA above.
- Format scores to 1 decimal place.
- If asked about topics completely unrelated to education/universities, still try to help but mention you specialize in university rankings.
- Keep responses concise (2-4 sentences for simple questions, more for detailed comparisons).
- Use emoji sparingly for friendliness.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("universe-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
