import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIdentityAlignment } from "@/hooks/useIdentityAlignment";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, ChevronDown, ChevronUp, Check, Minus, X, Target } from "lucide-react";
import { PremiumIcon } from "@/components/ui/PremiumIcon";
import AddIdentityForm from "./AddIdentityForm";

const IDENTITY_GRADIENTS: Record<string, string> = {
  violet: "from-[hsl(258,62%,63%)] to-[hsl(215,70%,62%)]",
  teal: "from-[hsl(172,50%,55%)] to-[hsl(152,55%,52%)]",
  amber: "from-[hsl(38,85%,65%)] to-[hsl(350,65%,65%)]",
  rose: "from-[hsl(350,65%,65%)] to-[hsl(258,62%,63%)]",
  blue: "from-[hsl(215,70%,62%)] to-[hsl(172,50%,55%)]",
  emerald: "from-[hsl(152,55%,52%)] to-[hsl(172,50%,55%)]",
};

const PROGRESS_COLORS: Record<string, string> = {
  violet: "bg-chart-violet",
  teal: "bg-chart-teal",
  amber: "bg-chart-amber",
  rose: "bg-chart-rose",
  blue: "bg-chart-blue",
  emerald: "bg-chart-emerald",
};

const cardFade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function IdentityAlignmentDashboard() {
  const { data: alignments, isLoading, totalVotes } = useIdentityAlignment(7);
  const [expanded, setExpanded] = useState<string | null>(null);

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
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-4"
        >
          {alignments.map((identity) => {
            const gradient = IDENTITY_GRADIENTS[identity.color || "violet"] || IDENTITY_GRADIENTS.violet;
            const progressColor = PROGRESS_COLORS[identity.color || "violet"] || PROGRESS_COLORS.violet;
            const isExpanded = expanded === identity.id;

            return (
              <motion.div key={identity.id} variants={cardFade}>
                <Card className="glass-card-premium overflow-hidden hover-float">
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg shadow-lg`}>
                          {identity.emoji || identity.label.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="font-display text-lg">{identity.label}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {identity.habitCount} habit{identity.habitCount !== 1 ? "s" : ""} · {identity.totalVotes} votes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-display text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                          {identity.alignmentPct}%
                        </span>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : identity.id)}
                          className="p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-muted-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {/* Main alignment bar */}
                    <div className="space-y-2">
                      <div className="h-2.5 rounded-full bg-secondary/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${identity.alignmentPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${progressColor}`}
                        />
                      </div>
                      {/* Vote breakdown */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-success" /> {identity.fullVotes} full
                        </span>
                        <span className="flex items-center gap-1">
                          <Minus className="h-3 w-3 text-chart-amber" /> {identity.minVotes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <X className="h-3 w-3 text-destructive" /> {identity.missVotes} miss
                        </span>
                      </div>
                    </div>

                    {/* Expanded habit breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
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
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {habit.alignmentPct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${habit.alignmentPct}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                      className={`h-full rounded-full ${progressColor} opacity-70`}
                                    />
                                  </div>
                                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                                    <span>{habit.fullVotes} full</span>
                                    <span>{habit.minVotes} min</span>
                                    <span>{habit.missVotes} miss</span>
                                    <span className="ml-auto">{habit.totalVotes} total votes</span>
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
