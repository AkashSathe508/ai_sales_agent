import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Bot,
  Database,
  Search,
  Filter,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function Activities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('All');

  const { data, isLoading, error } = useQuery({ queryKey: ['activities'], queryFn: () => apiClient.get('/api/v1/activities') });
  const activities = (data?.activities || []).map((a) => ({
    id: a.id, correlationId: a.correlationId || a.correlation_id || '—', agent: a.agent || 'System',
    action: a.action || '—', entity: a.entity || '—', status: a.status || 'Unknown',
    duration: a.duration || '—', timestamp: a.timestamp || '—',
  }));

  const agentFilters = ['All', 'Supervisor Agent', 'Qualification Agent', 'Proposal Agent', 'Sales Intelligence Agent', 'Guardrails & Governance', 'RAG Retriever'];

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.correlationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgent === 'All' || act.agent === selectedAgent;
    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Audit Trail & Execution Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end correlation IDs, tool latency, and agent decision histories recorded from the LangGraph execution runtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1">
            Average Tool Latency: 210ms
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by action, correlation ID (req_...), or target entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 mr-2 text-[11px] font-medium">Subsystem:</span>
            {agentFilters.map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedAgent === agent
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {agent}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <th className="p-3.5 font-semibold">Event ID</th>
                <th className="p-3.5 font-semibold">Correlation ID</th>
                <th className="p-3.5 font-semibold">Subsystem</th>
                <th className="p-3.5 font-semibold">Action Description</th>
                <th className="p-3.5 font-semibold">Entity</th>
                <th className="p-3.5 font-semibold">Latency</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && <tr><td colSpan="8" className="p-5">Loading activities…</td></tr>}
              {error && <tr><td colSpan="8" role="alert" className="p-5 text-rose-600">Unable to load activities: {error.message}</td></tr>}
              {filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-500">{act.id}</td>
                  <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400">
                    {act.correlationId}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {act.agent}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {act.action}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="outline">{act.entity}</Badge>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{act.duration}</td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        act.status === 'Success'
                          ? 'success'
                          : act.status === 'Intercepted'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {act.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right text-slate-500">{act.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Activities;
