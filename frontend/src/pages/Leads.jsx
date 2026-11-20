import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { LeadFilterBar } from '@/components/leads/LeadFilterBar';
import { LeadTable } from '@/components/leads/LeadTable';
import { leadService } from '@/services/leadService';

export function Leads() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data, isLoading, error } = useQuery({ queryKey: ['leads'], queryFn: () => leadService.getLeads() });
  const leads = (data?.leads || []).map((lead) => ({
    id: lead.lead_id, company: lead.company_name, industry: lead.industry || 'Unknown',
    budget: lead.budget_range || 'Undisclosed', timeline: lead.timeline || 'Unspecified',
    source: 'CRM', status: lead.status ? lead.status[0].toUpperCase() + lead.status.slice(1) : 'New',
    priority: (lead.score ?? 0) >= 70 ? 'High' : (lead.score ?? 0) >= 40 ? 'Medium' : 'Low',
    score: lead.score ?? 0, rep: lead.assigned_to || 'Unassigned',
  }));
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !searchTerm ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.rep.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchIndustry = industryFilter === 'all' || lead.industry === industryFilter;
      const matchPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

      return matchSearch && matchStatus && matchIndustry && matchPriority;
    });
  }, [leads, searchTerm, statusFilter, industryFilter, priorityFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIndustryFilter('all');
    setPriorityFilter('all');
  };

  const handleQualifyWithAI = (leadId) => {
    navigate('/workspace', {
      state: { initialPrompt: `Qualify ${leadId} for our enterprise solution` },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              Leads Management
            </h2>
            <Badge variant="default" className="text-xs">
              CRM Synchronized
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time lead registry with BANT qualification scores, CRM interaction timelines, and autonomous agent evaluation triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => handleQualifyWithAI('LEAD-001')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Qualify Lead with AI
          </Button>
        </div>
      </div>

      {/* Mini KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Total Pipeline Leads</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">
            {leads.length}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
            +14% new this month
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">BANT Qualified</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {leads.filter((l) => l.status.toLowerCase() === 'qualified').length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Score $\ge 70/100$
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Active Evaluation</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {leads.filter((l) => l.status.toLowerCase() === 'evaluating').length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            In discovery call stage
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Unscored / New</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1 block">
            {leads.filter((l) => l.status.toLowerCase() === 'new').length}
          </span>
          <span className="text-[10px] text-indigo-500 mt-0.5 block font-medium">
            Ready for AI qualification
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <LeadFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        onReset={handleReset}
      />

      {/* Table Container */}
      <Card className="overflow-hidden">
        {isLoading && <div className="p-6 text-sm text-slate-500">Loading leads…</div>}
        {error && <div role="alert" className="p-6 text-sm text-rose-600">Unable to load leads: {error.message}</div>}
        <LeadTable
          leads={filteredLeads}
          onQualifyWithAI={handleQualifyWithAI}
        />
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredLeads.length}</strong> of {leads.length} registered leads
          </span>
          <span className="font-mono text-[11px]">
            CRM API
          </span>
        </div>
      </Card>
    </div>
  );
}

export default Leads;
