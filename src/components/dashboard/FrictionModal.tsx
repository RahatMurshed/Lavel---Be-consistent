import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const FRICTION_TAGS = [
  "Low energy",
  "Time mismanagement",
  "Forgot",
  "Mood",
  "Environment",
  "Competing priority",
  "Motivation",
];

interface FrictionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tags: string[], notes: string) => void;
  habitName: string;
}

export function FrictionModal({ open, onClose, onSubmit, habitName }: FrictionModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = () => {
    onSubmit(selected, notes);
    setSelected([]);
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">What stopped you?</DialogTitle>
          <p className="text-sm text-muted-foreground">Missed: {habitName}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FRICTION_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selected.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Textarea
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-secondary/30 border-border/30"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Skip</Button>
          <Button onClick={handleSubmit}>Log Friction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
