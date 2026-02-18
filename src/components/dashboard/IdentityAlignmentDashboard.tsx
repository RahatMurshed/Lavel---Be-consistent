import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIdentityAlignment } from "@/hooks/useIdentityAlignment";
import { useDeleteIdentity } from "@/hooks/useHabits";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, ChevronDown, ChevronUp, Check, Minus, X, Target, Trash2 } from "lucide-react";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import AddIdentityForm from "./AddIdentityForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const cardFade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export function IdentityAlignmentDashboard() {
  const { data: alignments, isLoading, totalVotes } = useIdentityAlignment(7);
  const [expanded, setExpanded] = useState<string | null>(null);
  const deleteIdentity = useDeleteIdentity();

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-secondary/20 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <PremiumIcon icon={Target} theme="violet" size="lg" animated />
            Identity Alignment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every action is a vote for the person you wish to become
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddIdentityForm />
          <Card className="glass-card-premium px-4 py-2">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-primary" />
              <span className="font-display font-bold text-foreground text-lg">{totalVotes}</span>
              <span className="text-xs text-muted-foreground">votes this week</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Identity Cards */}
      {alignments.length === 0 ? (
        <Card className="glass-card-premium">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No identities configured yet. Complete onboarding to define who you want to become.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="space-y-4"
        >
          {alignments.map((identity) => {
            const isExpanded = expanded === identity.id;
            const pct = identity.alignmentPct;

            return (
              <motion.div key={identity.id} variants={cardFade}>
                <Card className="glass-card-premium overflow-hidden hover-float group">
                  {/* Top accent line — unified primary gradient */}
                  <div className="h-[2px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Alignment percentage as the main visual element */}
                        <div className="relative h-14 w-14 flex-shrink-0">
                          <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
                            <circle
                              cx="24" cy="24" r="20"
                              fill="none"
                              stroke="hsl(var(--secondary))"
                              strokeWidth="3"
                            />
                            <motion.circle
                              cx="24" cy="24" r="20"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - pct / 100) }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                            />
                          </svg>
                          {identity.logo_url ? (
                            <img
                              src={identity.logo_url}
                              alt={identity.label}
                              className="absolute inset-[6px] rounded-full object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-primary">
                              {pct}%
                            </span>
                          )}
                        </div>

                        <div>
                          <CardTitle className="font-display text-lg text-foreground">
                            {identity.label}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {identity.habitCount} habit{identity.habitCount !== 1 ? "s" : ""} · {identity.totalVotes} votes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300"
                              title="Delete identity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{identity.label}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Linked habits will be kept but unlinked from this identity. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteIdentity.mutate(identity.id, {
                                    onSuccess: () => toast.success(`"${identity.label}" deleted`),
                                    onError: () => toast.error("Failed to delete identity"),
                                  });
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : identity.id)}
                          className="p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-muted-foreground transition-colors duration-300"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    {/* Vote breakdown — minimal pills */}
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success">
                        <Check className="h-3 w-3" /> {identity.fullVotes} full
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                        <Minus className="h-3 w-3" /> {identity.minVotes} min
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                        <X className="h-3 w-3" /> {identity.missVotes} miss
                      </span>
                    </div>

                    {/* Expanded habit breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                            {identity.habits.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No habits linked to this identity</p>
                            ) : (
                              identity.habits.map((habit) => (
                                <div key={habit.id} className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-foreground">{habit.name}</span>
                                    <span className="text-xs font-medium text-primary">
                                      {habit.alignmentPct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${habit.alignmentPct}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      className="h-full rounded-full bg-primary/70"
                                    />
                                  </div>
                                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                                    <span>{habit.fullVotes} full</span>
                                    <span>{habit.minVotes} min</span>
                                    <span>{habit.missVotes} miss</span>
                                    <span className="ml-auto">{habit.totalVotes} total</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
