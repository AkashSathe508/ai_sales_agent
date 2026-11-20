import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Database,
  FileText,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RecentActivitiesFeed() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 'ACT-9081',
      agent: 'Supervisor',
      icon: Bot,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
      action: 'Classified query intent as "lead_qualification" (confidence 96%)',
      entity: 'LEAD-001',
      time: '12m ago',
      category: 'supervisor',
    },
    {
      id: 'ACT-9082',
      agent: 'CRM Tool',
      icon: Database,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60',
      action: 'Retrieved Meridian Financial profile and verified 5 pain points',
      entity: 'LEAD-001',
      time: '12m ago',
      category: 'crm',
    },
    {
      id: 'ACT-9083',
      agent: 'RAG Tool',
      icon: FileText,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
      action: 'Retrieved 4 citations from pricing_guide.md and roi_assumptions.md',
      entity: 'DocStore',
      time: '18m ago',
      category: 'rag',
    },
    {
      id: 'ACT-9084',
      agent: 'Proposal Agent',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
      action: 'Calculated 240% ROI ($576k savings) with 6.5-month payback guarantee',
      entity: 'PROP-2024-001',
      time: '24m ago',
      category: 'proposal',
    },
    {
      id: 'ACT-9085',
      agent: 'Policy Guardrail',
      icon: ShieldCheck,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
      action: 'Intercepted automated PPTX generation; triggered human approval gate',
      entity: 'APPR-2024-001',
      time: '24m ago',
      category: 'guardrail',
    },
  ];

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((act) => act.category === filter);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Live Agent Execution Feed
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Traceable agent decisions and tool invocations
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/activities')}
            className="text-xs gap-1 text-indigo-600 dark:text-indigo-400 self-start sm:self-auto"
          >
            Audit Trail <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'supervisor', label: 'Supervisor' },
            { id: 'crm', label: 'CRM' },
            { id: 'rag', label: 'RAG' },
            { id: 'proposal', label: 'Proposal' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                filter === btn.id
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3.5">
          {filteredActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-start gap-3 text-xs group">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${act.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {act.agent}
                    </span>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {act.action}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      {act.entity}
                    </Badge>
                    <span className="text-[9px] font-mono text-slate-400">
                      {act.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivitiesFeed;
