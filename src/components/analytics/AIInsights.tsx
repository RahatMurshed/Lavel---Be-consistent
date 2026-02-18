import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  avgCompletion: number;
  streak: number;
  bestDay: string;
  worstDay: string;
}

export default function AIInsights({ avgCompletion, streak, bestDay, worstDay }: Props) {
  const [open, setOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (insight) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("consistency-coach", {
        body: {
          prompt: `Provide a brief 3-4 sentence analytics summary. Avg completion: ${avgCompletion}%. Current streak: ${streak} days. Best day: ${bestDay}. Worst day: ${worstDay}. Give actionable advice.`,
        },
      });
      if (error) throw error;
      setInsight(data?.message || data?.response || "Unable to generate insights at this time.");
    } catch {
      setInsight("Unable to generate AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card-premium">
      <Collapsible open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchInsights(); }}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-secondary/20 transition-colors rounded-t-lg">
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Growth Insights
              <ChevronDown className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing your data...
              </div>
            ) : insight ? (
              <p className="text-sm text-foreground/85 leading-relaxed">{insight}</p>
            ) : null}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
