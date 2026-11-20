import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart as PieIcon } from 'lucide-react';

const INDUSTRY_DATA = [
  { name: 'Financial Services', value: 48, color: '#4f46e5', share: '33.8%' },
  { name: 'SaaS & Technology', value: 36, color: '#06b6d4', share: '25.4%' },
  { name: 'Supply Chain & Logistics', value: 24, color: '#10b981', share: '16.9%' },
  { name: 'Healthcare & Pharma', value: 20, color: '#f59e0b', share: '14.1%' },
  { name: 'Retail & eCommerce', value: 14, color: '#8b5cf6', share: '9.8%' },
];

const SOURCE_DATA = [
  { name: 'Inbound Demo Request', value: 64, color: '#4f46e5', share: '45.1%' },
  { name: 'Direct Referral', value: 34, color: '#10b981', share: '23.9%' },
  { name: 'Cold Outreach', value: 26, color: '#f59e0b', share: '18.3%' },
  { name: 'Events & Webinars', value: 18, color: '#06b6d4', share: '12.7%' },
];

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 text-xs">
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          {data.name}
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 text-slate-500">
          <span>Leads:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {data.value} ({data.payload.share})
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function LeadDistributionChart() {
  const [view, setView] = useState('industry');
  const activeData = view === 'industry' ? INDUSTRY_DATA : SOURCE_DATA;
  const total = activeData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-indigo-500" />
                Lead Distribution
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-slate-500">
                Demo Data
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Breakdown by {view === 'industry' ? 'target industry sector' : 'acquisition channel'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setView('industry')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                view === 'industry'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Industry
            </button>
            <button
              onClick={() => setView('source')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                view === 'source'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Source
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {/* Donut chart with centered summary count */}
        <div className="relative h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={activeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {activeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {total}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Total Leads
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {activeData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-0.5"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.value}
                </span>
                <span className="text-slate-400">({item.share})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LeadDistributionChart;
