import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const MONTHLY_DATA_6M = [
  { month: 'Jun', totalLeads: 48, qualified: 22, proposals: 7 },
  { month: 'Jul', totalLeads: 62, qualified: 29, proposals: 9 },
  { month: 'Aug', totalLeads: 74, qualified: 36, proposals: 11 },
  { month: 'Sep', totalLeads: 89, qualified: 44, proposals: 14 },
  { month: 'Oct', totalLeads: 115, qualified: 54, proposals: 16 },
  { month: 'Nov', totalLeads: 142, qualified: 68, proposals: 19 },
];

const MONTHLY_DATA_12M = [
  { month: 'Dec 23', totalLeads: 32, qualified: 14, proposals: 4 },
  { month: 'Jan', totalLeads: 38, qualified: 16, proposals: 5 },
  { month: 'Feb', totalLeads: 42, qualified: 19, proposals: 6 },
  { month: 'Mar', totalLeads: 45, qualified: 20, proposals: 6 },
  { month: 'Apr', totalLeads: 40, qualified: 18, proposals: 5 },
  { month: 'May', totalLeads: 51, qualified: 24, proposals: 7 },
  { month: 'Jun', totalLeads: 48, qualified: 22, proposals: 7 },
  { month: 'Jul', totalLeads: 62, qualified: 29, proposals: 9 },
  { month: 'Aug', totalLeads: 74, qualified: 36, proposals: 11 },
  { month: 'Sep', totalLeads: 89, qualified: 44, proposals: 14 },
  { month: 'Oct', totalLeads: 115, qualified: 54, proposals: 16 },
  { month: 'Nov', totalLeads: 142, qualified: 68, proposals: 19 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 text-xs">
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2 border-b border-slate-100 pb-1 dark:border-slate-800">
          {label} Performance
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Total Leads:
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {payload[0]?.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Qualified Leads:
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {payload[1]?.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Proposals Generated:
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {payload[2]?.value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function MonthlyLeadGenerationChart() {
  const [range, setRange] = useState('6m');
  const data = range === '6m' ? MONTHLY_DATA_6M : MONTHLY_DATA_12M;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Monthly Lead Generation & Conversion
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-slate-500">
              Demo Data
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Total CRM leads vs AI-qualified readiness vs resulting proposals
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setRange('6m')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              range === '6m'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setRange('12m')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              range === '12m'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            12 Months
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalLeadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="qualifiedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="proposalsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
              />

              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-[11px] text-slate-400 dark:text-slate-500"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-slate-400 dark:text-slate-500"
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="totalLeads"
                name="Total Leads"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalLeadsGradient)"
              />
              <Area
                type="monotone"
                dataKey="qualified"
                name="Qualified Leads"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#qualifiedGradient)"
              />
              <Area
                type="monotone"
                dataKey="proposals"
                name="Proposals"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#proposalsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend summary row */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-400">Total Leads</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">142</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Qualified Leads</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">68</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-400">Proposals Created</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">19</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyLeadGenerationChart;
