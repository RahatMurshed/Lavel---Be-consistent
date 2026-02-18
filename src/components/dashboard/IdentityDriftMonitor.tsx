import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIdentityDriftMonitor, useCorrectivePlan, DriftAlert } from "@/hooks/useIdentityDrift";
import { useWeekFriction } from "@/hooks/useHabits";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, TrendingDown, Sparkles, Loader2, Clock, Lightbulb,
  Shield, ChevronDown, ChevronUp, X, ArrowDownRight, Zap, MapPin,
} from "lucide-react";

const SEVERITY_STYLES = {
  critical: {
    border: "ring-1 ring-destructive/40",
    badge: "bg-destructive/20 text-destructive",
    icon: "text-destructive",
    label: "Critical Drift",
  },
  warning: {
    border: "ring-1 ring-warning/40",
    badge: "bg-warning/20 text-warning",
    icon: "text-warning",
    label: "Drifting",
  },
  info: {
    border: "ring-1 ring-primary/20",
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
    label: "Monitor",
  },
};

export function IdentityDriftMonitor() {
  const { alerts, isLoading } = useIdentityDriftMonitor();
  const { data: friction } = useWeekFriction();
  const { plan, isLoading: planLoading, error: planError, generate, setPlan } = useCorrectivePlan();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [planForIdentity, setPlanForIdentity] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (isLoading) return null;

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.identityId));

  if (visibleAlerts.length === 0) return null;

  const handleGeneratePlan = (alert: DriftAlert) => {
    setPlanForIdentity(alert.identityId);
    generate(alert, friction || []);
  };

  const handleDismiss = (identityId: string) => {
    setDismissedIds((prev) => new Set([...prev, identityId]));
    if (planForIdentity === identityId) {
      setPlan(null);
      setPlanForIdentity(null);
    }
  };

  return (
    <Card className="glass-card-premium">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-warning" />
          Identity Drift Monitor
          <span className="text-[10px] bg-warning/15 text-warning px-1.5 py-0.5 rounded-full ml-auto">
            {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleAlerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity];
          const isExpanded = expandedAlert === alert.identityId;
          const showingPlan = planForIdentity === alert.identityId && plan;

          return (
            <motion.div
              key={alert.identityId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card overflow-hidden ${style.border}`}
            >
              {/* Alert Header */}
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="shrink-0 mt-0.5">
                    {alert.severity === "critical" ? (
                      <AlertTriangle className={`h-4 w-4 ${style.icon}`} />
                    ) : (
                      <TrendingDown className={`h-4 w-4 ${style.icon}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {alert.emoji} {alert.identityLabel}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {alert.previousPct}%
                      </span>
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                      <span className={`text-xs font-bold ${alert.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                        {alert.currentPct}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({alert.drift > 0 ? `-${alert.drift}` : alert.drift}% this week)
                      </span>
                    </div>
                    <Progress
                      value={alert.currentPct}
                      className="h-1.5 mt-1.5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.identityId)}
                    className="p-1 rounded hover:bg-secondary/30 text-muted-foreground transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.identityId)}
                    className="p-1 rounded hover:bg-secondary/30 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3 border-t border-border/20 pt-2">
                      {/* Habit breakdown */}
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Habit Breakdown</p>
                        {alert.habits.map((h, i) => (
                          <div key={i} className="flex items-center justify-between py-1">
                            <span className="text-xs text-foreground">{h.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono ${h.alignmentPct < 40 ? "text-destructive" : h.alignmentPct < 60 ? "text-warning" : "text-foreground"}`}>
                                {h.alignmentPct}%
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {h.fullVotes}F/{h.minVotes}M/{h.missVotes}X
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Generate corrective plan */}
                      {!showingPlan && (
                        <Button
                          size="sm"
                          className="btn-gradient w-full text-xs"
                          onClick={() => handleGeneratePlan(alert)}
                          disabled={planLoading && planForIdentity === alert.identityId}
                        >
                          {planLoading && planForIdentity === alert.identityId ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          Generate Corrective Plan
                        </Button>
                      )}

                      {planError && planForIdentity === alert.identityId && (
                        <p className="text-xs text-destructive">{planError}</p>
                      )}

                      {/* Corrective Plan */}
                      {showingPlan && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="glass-card p-3 space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Zap className="h-3 w-3" /> AI Diagnosis
                            </p>
                            <p className="text-xs text-foreground">{plan.diagnosis}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              plan.urgency === "high" ? "bg-destructive/20 text-destructive" :
                              plan.urgency === "moderate" ? "bg-warning/20 text-warning" :
                              "bg-primary/10 text-primary"
                            }`}>
                              {plan.urgency} urgency
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Daily Actions
                            </p>
                            {plan.daily_actions.map((action, i) => (
                              <div key={i} className="glass-card p-2 flex items-start gap-2">
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                                  {action.timing}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs text-foreground">{action.action}</p>
                                  <p className="text-[10px] text-muted-foreground">→ {action.habit_link}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {plan.environment_changes.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Environment Changes
                              </p>
                              {plan.environment_changes.map((change, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                  <Lightbulb className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                                  <span>{change}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="glass-card p-2 border-l-2 border-primary/50">
                            <p className="text-xs text-foreground italic">{plan.motivation}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
