import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMyGroups() {
  return useQuery({
    queryKey: ["my-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: memberships, error: mErr } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", user.id);
      if (mErr) throw mErr;
      if (!memberships || memberships.length === 0) return [];
      
      const groupIds = memberships.map((m) => m.group_id);
      const { data: groups, error } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      if (error) throw error;
      return (groups || []).map((g) => ({
        ...g,
        myRole: memberships.find((m) => m.group_id === g.id)?.role || "member",
      }));
    },
  });
}

export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ["group-members", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .eq("group_id", groupId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("groups")
        .insert({ name, description, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      // Auto-join as admin
      await supabase.from("group_members").insert({
        group_id: data.id,
        user_id: user.id,
        role: "admin",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: group, error: gErr } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();
      if (gErr) throw new Error("Invalid invite code");
      const { error } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
      });
      if (error) throw error;
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
  });
}
