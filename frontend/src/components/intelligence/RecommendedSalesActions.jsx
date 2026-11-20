import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RecommendedSalesActions({ actions = [], onExecuteAction }) {
  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'immediate':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Recommended Next Best Sales Actions
          </CardTitle>
          <Badge variant="default" className="text-[10px]">
            AI Prioritized
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Strategically sequenced steps to accelerate enterprise deal velocity
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {actions.map((act, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityVariant(act.priority)} className="text-[10px]">
                    {act.priority}
                  </Badge>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {act.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                  <strong>Expected Impact:</strong> {act.impact}
                </p>
                <div className="text-[10px] text-slate-400 pl-1">
                  Owner: {act.owner} • Suggested Timeline: {act.timeline}
                </div>
              </div>

              {act.ctaLabel && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onExecuteAction && onExecuteAction(act)}
                  className="gap-1 text-xs self-start sm:self-auto shrink-0"
                >
                  {act.ctaLabel} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendedSalesActions;
