import React from 'react';
import { Calendar, CheckCircle2, Flag, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ProposalImplementationTimeline({ milestones = [] }) {
  const defaultMilestones = [
    {
      title: 'Environment Provisioning & Security Signoff',
      duration: 'Weeks 1-2',
      deliverables: [
        'Dedicated VPC deployment and SSL/TLS certificate configuration',
        'Salesforce read/write OAuth2 API connector authorization',
        'Delivery of SOC2 Type II compliance audit packet to CTO James Liu',
      ],
    },
    {
      title: 'CRM Schema Mapping & Hybrid RAG Indexing',
      duration: 'Weeks 3-4',
      deliverables: [
        'Field mapping between custom CRM objects and standard pipeline metrics',
        'Ingestion and chunking of product pricing sheets and sales playbooks',
        'Historical pipeline baseline calibration across 12 months of deal data',
      ],
    },
    {
      title: 'Pilot Rollout & Sales Team Enablement',
      duration: 'Weeks 5-6',
      deliverables: [
        'Pilot deployment for 10 initial sales representatives and 2 managers',
        'Automated CRM hygiene verification and weekly meeting brief testing',
        'Stakeholder feedback review with VP Sarah Chen',
      ],
    },
    {
      title: 'Full 50-Rep Team Launch & Executive Dashboard Signoff',
      duration: 'Weeks 7-8',
      deliverables: [
        'Company-wide enablement for all 50 sales representatives',
        'Executive pipeline forecasting dashboards enabled for Monday board reviews',
        'Formal signoff and transition to dedicated Customer Success Manager',
      ],
    },
  ];

  const plan = milestones.length > 0 ? milestones : defaultMilestones;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              8-Week Phased Implementation & Rollout Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Structured milestone delivery ensuring zero downtime and rapid adoption velocity
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
            4 Milestones • 8 Weeks Total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-xs">
          {plan.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/60 shadow-subtle space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {m.title}
                  </h4>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] self-start sm:self-auto">
                  {m.duration}
                </Badge>
              </div>

              <div className="pl-7 space-y-1.5 text-slate-600 dark:text-slate-300">
                {m.deliverables.map((del, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProposalImplementationTimeline;
