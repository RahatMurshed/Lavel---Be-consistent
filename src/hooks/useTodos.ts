import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TodoPriority = "critical" | "important" | "bonus";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  priority: TodoPriority;
  category: string | null;
}

export interface TodoSuggestion {
  title: string;
  priority: TodoPriority;
  category: string;
}

const PRIORITY_ORDER: Record<TodoPriority, number> = {
  critical: 0,
  important: 1,
  bonus: 2,
};

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const todos = (data ?? []) as unknown as Todo[];

      // Sort: incomplete first by priority, then completed at bottom
      return todos.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pa = PRIORITY_ORDER[a.priority] ?? 1;
        const pb = PRIORITY_ORDER[b.priority] ?? 1;
        if (pa !== pb) return pa - pb;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, priority = "important", category }: { title: string; priority?: TodoPriority; category?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("todos")
        .insert({ title, user_id: user.id, priority, category } as any);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("todos")
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
};

export const useUpdateTodoPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: TodoPriority }) => {
      const { error } = await supabase
        .from("todos")
        .update({ priority } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
};

export const useAISuggestTodos = () => {
  return useMutation({
    mutationFn: async (payload: {
      habits: any[];
      skills: any[];
      currentTodos: string[];
      energy: number | null;
    }): Promise<TodoSuggestion[]> => {
      const { data, error } = await supabase.functions.invoke("todo-suggester", {
        body: payload,
      });

      if (error) {
        toast.error("Failed to get suggestions. Try again.");
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      return data?.suggestions ?? [];
    },
  });
};
