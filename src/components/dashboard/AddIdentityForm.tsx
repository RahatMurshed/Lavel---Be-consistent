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

const AddIdentityForm = () => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const createIdentity = useCreateIdentity();

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    createIdentity.mutate(
      { label: trimmed, emoji: "🎯", color: "teal" },
      {
        onSuccess: () => {
          toast.success("Identity created!");
          setLabel("");
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
            <Label>Identity Label</Label>
            <Input
              placeholder="e.g. Athlete, Creator, Leader"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground">
              Define who you want to become — every habit is a vote for this identity.
            </p>
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
