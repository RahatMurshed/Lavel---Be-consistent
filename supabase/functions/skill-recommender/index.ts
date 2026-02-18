import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, identities } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skillList = (skills || []).map((s: any) => `${s.name} (${s.category})`).join(", ");
    const identityList = (identities || []).map((i: any) => i.label).join(", ");

    const systemPrompt = `You are a growth intelligence advisor. Given a user's current skills and identity goals, recommend 3 skill stacks. Each stack should be a themed group of 3-4 related skills that build on each other and align with their identity aspirations.

Return ONLY valid JSON using this exact tool call format.`;

    const userPrompt = `Current skills: ${skillList || "None yet"}
Identity goals: ${identityList || "General growth"}

Recommend 3 skill stacks that would accelerate their growth. Each stack should have a theme, description, and 3-4 specific skills to learn.`;

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
              name: "recommend_skill_stacks",
              description: "Return 3 themed skill stack recommendations",
              parameters: {
                type: "object",
                properties: {
                  stacks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        theme: { type: "string", description: "Stack theme name" },
                        emoji: { type: "string", description: "Single emoji for the stack" },
                        description: { type: "string", description: "Why this stack matters, 1-2 sentences" },
                        skills: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              category: { type: "string", enum: ["technical", "creative", "physical", "social", "mental", "general"] },
                              reason: { type: "string", description: "Why learn this, one sentence" },
                            },
                            required: ["name", "category", "reason"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["theme", "emoji", "description", "skills"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["stacks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_skill_stacks" } },
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

    const stacks = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(stacks), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("skill-recommender error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
