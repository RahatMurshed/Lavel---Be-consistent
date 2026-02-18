import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AddIdentityForm = () => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createIdentity = useCreateIdentity();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setIsCreating(true);

    createIdentity.mutate(
      { label: trimmed, emoji: "🎯", color: "teal" },
      {
        onSuccess: async (data) => {
          const identityId = data?.[0]?.id;
          if (!identityId) {
            toast.success("Identity created!");
            setIsCreating(false);
            setLabel("");
            setOpen(false);
            return;
          }

          toast.success("Identity created! Generating logo…");

          // Fire off logo generation in background
          try {
            const { data: logoData, error } = await supabase.functions.invoke(
              "generate-identity-logo",
              { body: { label: trimmed, identityId } }
            );

            if (error) {
              console.error("Logo generation error:", error);
              toast.error("Logo generation failed — you can retry later.");
            } else {
              toast.success("Logo generated!");
            }
          } catch (e) {
            console.error("Logo generation error:", e);
          }

          queryClient.invalidateQueries({ queryKey: ["identities"] });
          setIsCreating(false);
          setLabel("");
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create identity");
          setIsCreating(false);
        },
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
              onKeyDown={(e) => e.key === "Enter" && !isCreating && handleSubmit()}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              A unique AI-generated logo will be created for your identity.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!label.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Logo…
              </>
            ) : (
              "Create Identity"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIdentityForm;
