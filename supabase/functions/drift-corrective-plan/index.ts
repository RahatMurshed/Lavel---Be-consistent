import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { identityLabel, currentPct, previousPct, habits, frictionTriggers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const habitSummary = (habits || [])
      .map((h: any) => `"${h.name}": ${h.alignmentPct}% (${h.fullVotes}F/${h.minVotes}M/${h.missVotes}X)`)
      .join("\n");

    const frictionSummary = (frictionTriggers || [])
      .map((f: any) => `${f.tag}: ${f.count}x`)
      .join(", ");

    const systemPrompt = `You are an identity alignment coach. A user's behavior is drifting from their chosen identity. Analyze their habit data and friction triggers to create a specific, actionable corrective plan. Be empathetic but direct.`;

    const userPrompt = `Identity: "${identityLabel}"
Current alignment: ${currentPct}% (was ${previousPct}% last week)
Drift: ${previousPct - currentPct}% decline

Habit breakdown:
${habitSummary || "No habit data available"}

Recent friction triggers: ${frictionSummary || "None recorded"}

Create a corrective plan with specific daily actions to get back on track within 7 days.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_corrective_plan",
              description: "Generate a corrective plan for identity drift",
              parameters: {
                type: "object",
                properties: {
                  diagnosis: { type: "string", description: "1-2 sentence diagnosis of why the drift is happening" },
                  urgency: { type: "string", enum: ["low", "moderate", "high"], description: "How urgent is the correction" },
                  daily_actions: {
                    type: "array",
                    description: "3-5 specific daily actions",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string", description: "Specific action to take" },
                        timing: { type: "string", description: "When to do it (morning/afternoon/evening)" },
                        habit_link: { type: "string", description: "Which habit this addresses" },
                      },
                      required: ["action", "timing", "habit_link"],
                      additionalProperties: false,
                    },
                  },
                  environment_changes: {
                    type: "array",
                    description: "1-3 environmental tweaks",
                    items: { type: "string" },
                  },
                  motivation: { type: "string", description: "A brief motivational message, 1-2 sentences" },
                },
                required: ["diagnosis", "urgency", "daily_actions", "environment_changes", "motivation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_corrective_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const plan = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("drift-corrective-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
