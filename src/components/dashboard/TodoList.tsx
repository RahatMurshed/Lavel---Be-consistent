import { useState } from "react";
import { ListTodo, Plus, Trash2, Sparkles, Clock, AlertTriangle, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useTodos,
  useAddTodo,
  useToggleTodo,
  useDeleteTodo,
  useUpdateTodoPriority,
  useAISuggestTodos,
  TodoPriority,
  TodoSuggestion,
} from "@/hooks/useTodos";
import { useActiveHabits } from "@/hooks/useHabits";
import { useSkills } from "@/hooks/useSkills";
import { useTodayCheckin } from "@/hooks/useDailyCheckin";
import { formatDistanceToNow } from "date-fns";

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; dot: string; textClass: string }> = {
  critical: { label: "Critical", dot: "bg-destructive", textClass: "font-semibold" },
  important: { label: "Important", dot: "bg-amber-500", textClass: "" },
  bonus: { label: "Bonus", dot: "bg-muted-foreground/50", textClass: "text-muted-foreground" },
};

const TodoList = () => {
  const [newTitle, setNewTitle] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>("important");
  const [suggestions, setSuggestions] = useState<TodoSuggestion[]>([]);

  const { data: todos = [], isLoading } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const updatePriority = useUpdateTodoPriority();
  const aiSuggest = useAISuggestTodos();

  const { data: habits } = useActiveHabits();
  const { data: skills } = useSkills();
  const { data: checkin } = useTodayCheckin();

  const handleAdd = (title?: string, priority?: TodoPriority, category?: string) => {
    const t = (title ?? newTitle).trim();
    if (!t) return;
    addTodo.mutate({ title: t, priority: priority ?? selectedPriority, category });
    if (!title) setNewTitle("");
  };

  const handleSuggest = () => {
    aiSuggest.mutate(
      {
        habits: (habits ?? []).map((h: any) => ({ name: h.name, identity: h.identity_id })),
        skills: (skills ?? []).map((s: any) => ({ name: s.name, category: s.category })),
        currentTodos: todos.filter((t) => !t.completed).map((t) => t.title),
        energy: checkin?.energy ?? null,
      },
      { onSuccess: (data) => setSuggestions(data) }
    );
  };

  // Stats
  const incomplete = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);
  const totalToday = todos.length;
  const doneToday = completed.length;
  const pct = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;

  // Burnout
  const activeCount = incomplete.length;
  const burnoutLevel = activeCount >= 9 ? "red" : activeCount >= 6 ? "yellow" : null;

  // Focus task: first incomplete critical, or first incomplete important
  const focusTask =
    incomplete.find((t) => t.priority === "critical") ??
    incomplete.find((t) => t.priority === "important");

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            To-Do List
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleSuggest}
            disabled={aiSuggest.isPending}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiSuggest.isPending ? "Thinking…" : "Suggest"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Burnout Warning */}
        <AnimatePresence>
          {burnoutLevel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
                burnoutLevel === "red"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              {burnoutLevel === "red"
                ? "Overloaded! Focus on your Critical tasks and defer the rest."
                : "Full plate. Consider moving some tasks to Bonus priority."}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Focus */}
        {focusTask && !focusTask.completed && (
          <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <Target className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Tackle this first</p>
              <p className="text-sm font-medium truncate">{focusTask.title}</p>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(focusTask.created_at), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Add Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Add a task…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" variant="outline" disabled={addTodo.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            {(["critical", "important", "bonus"] as TodoPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] transition-colors border ${
                  selectedPriority === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>
        </form>

        {/* AI Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Suggested tasks
              </p>
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 py-1.5"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_CONFIG[s.priority].dot}`} />
                  <span className="flex-1 text-sm truncate">{s.title}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {s.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      handleAdd(s.title, s.priority, s.category);
                      setSuggestions((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                  >
                    Add
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        )}

        {!isLoading && todos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        )}

        {/* Todo List */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {todos.map((todo, idx) => {
              const isFocus = focusTask && todo.id === focusTask.id && !todo.completed;
              const cfg = PRIORITY_CONFIG[todo.priority];
              return (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 group ${
                    isFocus
                      ? "ring-1 ring-primary/30 bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() =>
                      toggleTodo.mutate({ id: todo.id, completed: todo.completed })
                    }
                  />
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span
                    className={`flex-1 text-sm truncate ${cfg.textClass} ${
                      todo.completed ? "line-through text-muted-foreground !font-normal" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  {/* Quick reschedule to bonus */}
                  {!todo.completed && todo.priority !== "bonus" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Defer to bonus"
                      onClick={() => updatePriority.mutate({ id: todo.id, priority: "bonus" })}
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTodo.mutate(todo.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* Footer Stats */}
      {totalToday > 0 && (
        <CardFooter className="pt-0 pb-4 px-6 flex-col gap-1.5">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>{doneToday} of {totalToday} done</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </CardFooter>
      )}
    </Card>
  );
};

export default TodoList;
