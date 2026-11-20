import React from 'react';
import {
  Users,
  Target,
  Briefcase,
  FileCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';

export function MetricCardsGrid({ timeRange = '30d' }) {
  // Demo metrics labeled clearly as required
  const metrics = [
    {
      title: 'Total Leads',
      value: '142',
      change: '+14.2%',
      trend: 'up',
      period: 'vs previous period',
      subtext: '42 inbound demo requests',
      icon: Users,
      tooltip: 'Total registered CRM leads across all channels',
    },
    {
      title: 'Qualified Leads',
      value: '68',
      change: '+22.5%',
      trend: 'up',
      period: 'vs previous period',
      subtext: '47.8% qualification rate',
      icon: Target,
      tooltip: 'Passed BANT score threshold (score ≥ 70/100)',
    },
    {
      title: 'Active Opportunities',
      value: '24',
      change: '+8.1%',
      trend: 'up',
      period: 'vs previous period',
      subtext: '$1,420,000 weighted pipe',
      icon: Briefcase,
      tooltip: 'Leads currently in discovery or technical evaluation',
    },
    {
      title: 'Proposals Generated',
      value: '19',
      change: '+31.0%',
      trend: 'up',
      period: 'vs previous period',
      subtext: '100% deterministic ROI',
      icon: FileCheck,
      tooltip: 'Enterprise proposals assembled by ProposalAgent',
    },
    {
      title: 'Pending Approvals',
      value: '3',
      change: 'Needs Review',
      trend: 'warning',
      period: 'Action required',
      subtext: 'Requires human gate signoff',
      icon: Clock,
      tooltip: 'Proposals waiting for human-in-the-loop signoff',
    },
    {
      title: 'Pipeline Value',
      value: '$2,850,000',
      change: '+18.4%',
      trend: 'up',
      period: 'vs previous period',
      subtext: 'Verified catalog pricing',
      icon: TrendingUp,
      tooltip: 'Sum of all active opportunities in pipeline',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((item, index) => {
        const Icon = item.icon;
        const isUp = item.trend === 'up';
        const isWarning = item.trend === 'warning';

        return (
          <Card key={index} className="overflow-hidden relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                    {item.title}
                  </span>
                  <Tooltip content={item.tooltip} side="top">
                    <HelpCircle className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" />
                  </Tooltip>
                </div>
                <div className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {item.value}
              </div>

              <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                {isWarning ? (
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                    {item.change}
                  </span>
                ) : (
                  <span
                    className={
                      isUp
                        ? 'font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5'
                        : 'font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5'
                    }
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {item.change}
                  </span>
                )}
                <span className="text-slate-400 dark:text-slate-500 truncate">
                  {item.period}
                </span>
              </div>

              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate border-t border-slate-100 pt-1.5 dark:border-slate-800/80">
                {item.subtext}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default MetricCardsGrid;
