import { useState } from "react";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodos, useAddTodo, useToggleTodo, useDeleteTodo } from "@/hooks/useTodos";

const TodoList = () => {
  const [newTitle, setNewTitle] = useState("");
  const { data: todos = [], isLoading } = useTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    addTodo.mutate(trimmed);
    setNewTitle("");
  };

  const sorted = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          To-Do List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Add a task…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="outline" disabled={addTodo.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        )}

        {!isLoading && sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        )}

        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {sorted.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 group"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() =>
                    toggleTodo.mutate({ id: todo.id, completed: todo.completed })
                  }
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTodo.mutate(todo.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
