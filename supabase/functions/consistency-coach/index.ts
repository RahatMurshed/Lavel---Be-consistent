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
    const {
      consistencyScore,
      completionRatio,
      trendStability,
      recoverySpeed,
      resilienceIndex,
      energyAlignment,
      streak,
      burnoutRisk,
      energy,
      recentMisses,
      totalLogs,
      frictionTriggers,
      identities,
      habitPerformance,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userContext = [
      `Overall Consistency Score: ${consistencyScore ?? "N/A"}/100`,
      `Completion Ratio: ${completionRatio ?? "N/A"}%`,
      `Trend Stability: ${trendStability ?? "N/A"}%`,
      `Recovery Speed: ${recoverySpeed ?? "N/A"}%`,
      `Resilience Index: ${resilienceIndex ?? "N/A"}%`,
      `Energy Alignment: ${energyAlignment ?? "N/A"}%`,
      `Current streak: ${streak ?? 0} days`,
      `Burnout Risk: ${burnoutRisk ?? "Unknown"}`,
      energy !== undefined ? `Today's energy: ${energy}/10` : "Energy: not checked in",
      `Recent misses (7d): ${recentMisses ?? "N/A"}`,
      `Total logs (30d): ${totalLogs ?? 0}`,
      frictionTriggers?.length > 0
        ? `Top friction triggers: ${frictionTriggers.map((f: any) => `${f.tag} (${f.count}x)`).join(", ")}`
        : "",
      identities?.length > 0
        ? `Active identities: ${identities.map((i: any) => `${i.label} (${i.alignmentPct}% aligned)`).join(", ")}`
        : "",
      habitPerformance?.length > 0
        ? `Habit performance: ${habitPerformance.map((h: any) => `${h.name}: ${h.completionPct}%`).join(", ")}`
        : "",
    ].filter(Boolean).join("\n");

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
            content: `You are an elite behavioral consistency coach. Analyze the user's detailed metrics and provide a comprehensive coaching analysis.

Your analysis should be structured, actionable, and empathetic. Focus on:
1. Recognizing genuine progress and strengths
2. Identifying the single biggest leverage point for improvement
3. Detecting burnout risk and recommending protective strategies
4. Suggesting specific behavioral adjustments based on the data

Be warm but data-driven. Reference specific numbers from their data. Never use generic advice.
If Recovery Speed is low, suggest switching to "Grace Mode" (minimums only).
If Resilience Index is dropping, recommend environmental design changes.
If Energy Alignment is poor, suggest rearranging habit timing.`,
          },
          { role: "user", content: `Here is my behavioral data:\n${userContext}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "coach_analysis",
              description: "Return a structured coaching analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_assessment: {
                    type: "string",
                    description: "2-3 sentence overall assessment of their consistency journey",
                  },
                  strength: {
                    type: "string",
                    description: "Their biggest strength right now (1 sentence)",
                  },
                  focus_area: {
                    type: "string",
                    description: "The single most important area to focus on (1 sentence)",
                  },
                  action_items: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 specific, actionable recommendations",
                  },
                  mode_suggestion: {
                    type: "string",
                    enum: ["sprint", "grace", "maintenance", "none"],
                    description: "Suggested seasonal mode based on their data",
                  },
                  mode_reason: {
                    type: "string",
                    description: "Brief reason for the mode suggestion (1 sentence)",
                  },
                  encouragement: {
                    type: "string",
                    description: "A personalized, specific encouragement message (1-2 sentences)",
                  },
                },
                required: [
                  "overall_assessment",
                  "strength",
                  "focus_area",
                  "action_items",
                  "mode_suggestion",
                  "mode_reason",
                  "encouragement",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "coach_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("consistency-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
