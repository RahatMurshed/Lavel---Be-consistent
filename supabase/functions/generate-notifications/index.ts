import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      icon: string;
    }> = [];

    // 1. Streak warnings
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .single();

    if (gamification) {
      // Check if user hasn't logged today
      const today = new Date().toISOString().split("T")[0];
      const { data: todayLogs } = await supabase
        .from("behavior_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("log_date", today)
        .limit(1);

      if (!todayLogs || todayLogs.length === 0) {
        if (gamification.current_streak >= 3) {
          notifications.push({
            user_id: userId,
            type: "streak",
            title: `🔥 ${gamification.current_streak}-day streak at risk!`,
            message: `You haven't logged any habits today. Don't break your ${gamification.current_streak}-day streak!`,
            icon: "flame",
          });
        }
      }

      // Milestone celebrations
      if (
        gamification.current_streak > 0 &&
        gamification.current_streak === gamification.longest_streak &&
        [7, 14, 30, 60, 100].includes(gamification.current_streak)
      ) {
        notifications.push({
          user_id: userId,
          type: "streak",
          title: `🏆 New record: ${gamification.current_streak} days!`,
          message: `You've hit your longest streak ever. Incredible consistency!`,
          icon: "trophy",
        });
      }
    }

    // 2. Group activity — new challenges
    const { data: memberGroups } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (memberGroups && memberGroups.length > 0) {
      const groupIds = memberGroups.map((g) => g.group_id);
      const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

      const { data: recentChallenges } = await supabase
        .from("group_challenges")
        .select("title, group_id")
        .in("group_id", groupIds)
        .gte("created_at", oneDayAgo)
        .neq("created_by", userId)
        .limit(3);

      if (recentChallenges) {
        for (const ch of recentChallenges) {
          notifications.push({
            user_id: userId,
            type: "group",
            title: "📢 New group challenge",
            message: `"${ch.title}" — join now and compete with your group!`,
            icon: "users",
          });
        }
      }
    }

    // 3. AI Insight — consistency trend
    const { data: scores } = await supabase
      .from("consistency_scores")
      .select("overall_score, score_date")
      .eq("user_id", userId)
      .order("score_date", { ascending: false })
      .limit(7);

    if (scores && scores.length >= 3) {
      const recent = scores.slice(0, 3).reduce((s, r) => s + Number(r.overall_score), 0) / 3;
      const older = scores.slice(3).reduce((s, r) => s + Number(r.overall_score), 0) / Math.max(1, scores.length - 3);

      if (older > 0 && recent < older * 0.8) {
        notifications.push({
          user_id: userId,
          type: "ai_insight",
          title: "📉 Consistency dip detected",
          message: `Your consistency dropped ${Math.round((1 - recent / older) * 100)}% this week. Try focusing on your minimum habit versions.`,
          icon: "sparkles",
        });
      } else if (older > 0 && recent > older * 1.15) {
        notifications.push({
          user_id: userId,
          type: "ai_insight",
          title: "📈 You're on fire!",
          message: `Consistency up ${Math.round((recent / older - 1) * 100)}% this week. Your system is working — keep going!`,
          icon: "sparkles",
        });
      }
    }

    // 4. Identity drift alerts
    const { data: driftAlerts } = await supabase
      .from("identity_drift_alerts")
      .select("severity, identity_id")
      .eq("user_id", userId)
      .eq("dismissed", false)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .limit(2);

    if (driftAlerts && driftAlerts.length > 0) {
      notifications.push({
        user_id: userId,
        type: "warning",
        title: "⚠️ Identity drift detected",
        message: `${driftAlerts.length} of your identities are drifting. Check your Identity page for corrective actions.`,
        icon: "alert-triangle",
      });
    }

    // Deduplicate — don't send if identical notification exists recently
    if (notifications.length > 0) {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { data: recentNotifs } = await supabase
        .from("notifications")
        .select("title")
        .eq("user_id", userId)
        .gte("created_at", oneHourAgo);

      const existingTitles = new Set((recentNotifs || []).map((n) => n.title));
      const newNotifs = notifications.filter((n) => !existingTitles.has(n.title));

      if (newNotifs.length > 0) {
        await supabase.from("notifications").insert(newNotifs);
      }

      return new Response(
        JSON.stringify({ generated: newNotifs.length, skipped: notifications.length - newNotifs.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ generated: 0, message: "No new notifications" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
