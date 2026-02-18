import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateIdentity } from "@/hooks/useHabits";
import { toast } from "sonner";

const COLORS = [
  { name: "violet", class: "bg-violet-500" },
  { name: "teal", class: "bg-teal-500" },
  { name: "amber", class: "bg-amber-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "emerald", class: "bg-emerald-500" },
];

const EMOJIS = ["🎯", "💪", "🧠", "🎨", "📚", "🏃", "🧘", "💼", "🎵", "🌱", "⭐", "🔥"];

const AddIdentityForm = () => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState("violet");
  const createIdentity = useCreateIdentity();

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    createIdentity.mutate(
      { label: trimmed, emoji, color },
      {
        onSuccess: () => {
          toast.success("Identity created!");
          setLabel("");
          setEmoji("🎯");
          setColor("violet");
          setOpen(false);
        },
        onError: () => toast.error("Failed to create identity"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Identity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Identity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              placeholder="e.g. Athlete, Creator, Leader"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-md border transition-colors ${
                    emoji === e
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`h-8 w-8 rounded-full ${c.class} transition-all ${
                    color === c.name
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!label.trim() || createIdentity.isPending}
          >
            {createIdentity.isPending ? "Creating…" : "Create Identity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIdentityForm;
