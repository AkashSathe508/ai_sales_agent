import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    stage: 'Lead Ingestion',
    leads: 142,
    value: '$4,800,000',
    conversionRate: '100%',
    color: '#94a3b8',
  },
  {
    stage: 'BANT Qualified',
    leads: 68,
    value: '$3,200,000',
    conversionRate: '47.8%',
    color: '#6366f1',
  },
  {
    stage: 'Sales Intelligence',
    leads: 42,
    value: '$2,450,000',
    conversionRate: '61.7%',
    color: '#3b82f6',
  },
  {
    stage: 'Proposal Built',
    leads: 19,
    value: '$1,420,000',
    conversionRate: '45.2%',
    color: '#8b5cf6',
  },
  {
    stage: 'Approval / Review',
    leads: 8,
    value: '$840,000',
    conversionRate: '42.1%',
    color: '#f59e0b',
  },
  {
    stage: 'Closed Won',
    leads: 5,
    value: '$560,000',
    conversionRate: '62.5%',
    color: '#10b981',
  },
];

function CustomPipelineTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 text-xs">
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2 border-b border-slate-100 pb-1 dark:border-slate-800">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          {data.stage}
        </div>
        <div className="space-y-1 text-slate-500">
          <div className="flex justify-between gap-4">
            <span>Entity Count:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {data.leads} leads
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Stage Pipeline Value:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {data.value}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Stage Conversion:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {data.conversionRate}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function OpportunityPipelineChart() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              Opportunity Pipeline & Funnel Velocity
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-slate-500">
              Demo Data
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Stage-by-stage progression from initial lead discovery to deterministic contract execution
          </CardDescription>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Qualified Value: <strong className="text-slate-900 dark:text-slate-100">$2.85M</strong>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PIPELINE_STAGES}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis
                type="number"
                stroke="currentColor"
                className="text-[11px] text-slate-400 dark:text-slate-500"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="stage"
                type="category"
                stroke="currentColor"
                className="text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip content={<CustomPipelineTooltip />} />
              <Bar dataKey="leads" radius={[0, 4, 4, 0]} barSize={18}>
                {PIPELINE_STAGES.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stage Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {PIPELINE_STAGES.map((stg, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center"
            >
              <div className="text-[10px] text-slate-500 truncate">{stg.stage}</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stg.leads}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                {stg.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default OpportunityPipelineChart;
