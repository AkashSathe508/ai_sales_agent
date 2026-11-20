import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { MetricCardsGrid } from '@/components/dashboard/MetricCardsGrid';
import { MonthlyLeadGenerationChart } from '@/components/dashboard/MonthlyLeadGenerationChart';
import { LeadDistributionChart } from '@/components/dashboard/LeadDistributionChart';
import { OpportunityPipelineChart } from '@/components/dashboard/OpportunityPipelineChart';
import { AgentExecutionStatusWidget } from '@/components/dashboard/AgentExecutionStatusWidget';
import { RecentProposalsTable } from '@/components/dashboard/RecentProposalsTable';
import { RecentActivitiesFeed } from '@/components/dashboard/RecentActivitiesFeed';

export function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');

  const quickPrompts = [
    'Qualify LEAD-001 for our enterprise solution',
    'Analyze Meridian Financial Group competitive positioning',
    'Prepare a sales meeting brief for LEAD-001',
    'Generate a proposal for LEAD-001 with sales reporting ROI',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Global Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Sales Intelligence
            </h2>
            <Badge variant="default" dot className="text-xs">
              Agent Mesh Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Autonomous qualification, hybrid RAG sales intelligence dossiers, and deterministic enterprise proposals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setTimeRange('30d')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === '30d'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === '90d'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === 'ytd'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              YTD
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/workspace')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Launch AI Workspace
          </Button>
        </div>
      </div>

      {/* Demo Data Notice Banner */}
      <div className="flex items-center justify-between rounded-lg border border-indigo-200/60 bg-indigo-50/50 px-4 py-2 text-xs text-indigo-800 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-indigo-500" />
          <span>
            <strong>Phase 2 Analytics Active:</strong> Charts and KPI metrics display clearly labeled simulated telemetry. Live LangGraph endpoints will connect in Phase 9.
          </span>
        </div>
        <Badge variant="outline" className="border-indigo-300 text-[10px] text-indigo-700 dark:border-indigo-800 dark:text-indigo-300">
          Demo Analytics
        </Badge>
      </div>

      {/* 1. KPI Cards Grid (Total Leads, Qualified Leads, Opportunities, Proposals, Approvals, Pipeline) */}
      <MetricCardsGrid timeRange={timeRange} />

      {/* 2. Agent Execution Status Telemetry Widget */}
      <AgentExecutionStatusWidget />

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Lead Generation Chart (2 cols) */}
        <div className="lg:col-span-2">
          <MonthlyLeadGenerationChart />
        </div>

        {/* Right: Lead Distribution Donut Chart (1 col) */}
        <div className="lg:col-span-1">
          <LeadDistributionChart />
        </div>
      </div>

      {/* 4. Opportunity Pipeline Funnel Chart */}
      <OpportunityPipelineChart />

      {/* 5. Lower Section: Recent Proposals & Live Activities Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Proposals Table (2 cols) */}
        <div className="lg:col-span-2">
          <RecentProposalsTable />
        </div>

        {/* Live Activities Feed (1 col) */}
        <div className="lg:col-span-1">
          <RecentActivitiesFeed />
        </div>
      </div>

      {/* 6. Quick AI Natural Language Workflow Triggers Card */}
      <Card glow className="overflow-hidden border-indigo-200 dark:border-indigo-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Quick Autonomous Agent Workflows
            </CardTitle>
            <Badge variant="default" className="text-[10px]">
              One-Click LangGraph Dispatch
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Trigger common sales queries directly into the multi-agent orchestration pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() =>
                  navigate('/workspace', { state: { initialPrompt: prompt } })
                }
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-subtle hover:border-indigo-500 hover:bg-indigo-50/30 hover:shadow-premium dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20 transition-all"
              >
                <span className="text-xs font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400 line-clamp-2">
                  "{prompt}"
                </span>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-500">
                  <span>Dispatch agent</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
