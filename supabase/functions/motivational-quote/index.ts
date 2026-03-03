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
    const { streak, completionRate, identities, burnoutRisk, energy, recentMisses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userContext = [
      `Current streak: ${streak} days`,
      `Completion rate: ${completionRate}%`,
      `Identities: ${identities?.join(", ") || "not set"}`,
      `Burnout risk: ${burnoutRisk}`,
      energy !== undefined ? `Today's energy: ${energy}/10` : "Energy: not checked in yet",
      recentMisses !== undefined ? `Recent misses (7d): ${recentMisses}` : "",
    ].filter(Boolean).join(". ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a consistency coach. Based on the user's behavioral data, write a short, powerful motivational message (1-2 sentences max). Be warm, specific to their situation, and focused on consistency over perfection. Never use generic platitudes. Reference their actual data points naturally.",
          },
          { role: "user", content: `Here is my current progress: ${userContext}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_quote",
              description: "Return a personalized motivational quote",
              parameters: {
                type: "object",
                properties: {
                  quote: { type: "string", description: "The motivational message" },
                },
                required: ["quote"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_quote" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Return a fallback quote instead of an error status so the client always gets a 200
      const fallbackQuotes = [
        "Consistency isn't about being perfect — it's about showing up. You're here, and that matters.",
        "Small steps compound. Every check-in is proof you're building something real.",
        "The person you're becoming is shaped by what you do today, not tomorrow.",
        "Progress isn't linear, but your commitment can be. Keep going.",
        "You don't need motivation to act — action creates motivation.",
      ];
      const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      return new Response(JSON.stringify({ quote: fallback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ quote: result.quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("motivational-quote error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
