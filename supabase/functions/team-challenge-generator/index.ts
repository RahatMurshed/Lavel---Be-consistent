import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { groupName, memberCount, existingChallenges } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const existing = (existingChallenges || []).map((c: any) => c.title).join(", ");

    const systemPrompt = `You are a team growth coach. Generate 3 unique group challenges that promote accountability, consistency, and collective growth. Challenges should be achievable within 7-14 days and encourage healthy competition.`;

    const userPrompt = `Group: "${groupName || "Growth Team"}" with ${memberCount || 2} members.
${existing ? `Already completed/active challenges: ${existing}` : "No previous challenges."}

Create 3 fresh team challenges. Each should have a clear measurable target.`;

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
              name: "suggest_challenges",
              description: "Return 3 group challenge suggestions",
              parameters: {
                type: "object",
                properties: {
                  challenges: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Challenge title, max 8 words" },
                        description: { type: "string", description: "1-2 sentence description" },
                        challenge_type: { type: "string", enum: ["habit_streak", "skill_count", "xp_race", "completion_rate"] },
                        target_value: { type: "integer", description: "Numeric target to reach" },
                        duration_days: { type: "integer", description: "7 or 14" },
                        emoji: { type: "string", description: "Single emoji" },
                      },
                      required: ["title", "description", "challenge_type", "target_value", "duration_days", "emoji"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["challenges"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_challenges" } },
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
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("team-challenge-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
