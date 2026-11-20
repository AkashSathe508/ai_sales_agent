import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  TrendingUp,
  User,
  Building2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function LeadTable({ leads = [], onQualifyWithAI }) {
  const navigate = useNavigate();

  if (!leads || leads.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No leads match the selected filter criteria.
      </div>
    );
  }

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'qualified':
        return 'success';
      case 'evaluating':
        return 'warning';
      case 'new':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <th className="p-3.5 font-semibold">Lead ID</th>
            <th className="p-3.5 font-semibold">Company</th>
            <th className="p-3.5 font-semibold">Industry</th>
            <th className="p-3.5 font-semibold">Budget</th>
            <th className="p-3.5 font-semibold">Timeline</th>
            <th className="p-3.5 font-semibold">Source</th>
            <th className="p-3.5 font-semibold">BANT Score</th>
            <th className="p-3.5 font-semibold">Status</th>
            <th className="p-3.5 font-semibold">Priority</th>
            <th className="p-3.5 font-semibold">Assigned Rep</th>
            <th className="p-3.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <td className="p-3.5 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {lead.id}
              </td>
              <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                {lead.company}
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                {lead.industry}
              </td>
              <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                {lead.budget}
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                {lead.timeline}
              </td>
              <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                {lead.source}
              </td>
              <td className="p-3.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span
                    className={
                      lead.score >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : lead.score >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }
                  >
                    {lead.score}
                  </span>
                  <span className="text-slate-400 text-[10px]">/ 100</span>
                </div>
              </td>
              <td className="p-3.5">
                <Badge variant={getStatusVariant(lead.status)}>
                  {lead.status}
                </Badge>
              </td>
              <td className="p-3.5">
                <Badge variant={getPriorityVariant(lead.priority)} className="text-[10px]">
                  {lead.priority}
                </Badge>
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-300">
                {lead.rep}
              </td>
              <td className="p-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onQualifyWithAI(lead.id)}
                    className="gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-[11px]"
                    title="Run Qualification Agent in AI Workspace"
                  >
                    <Sparkles className="h-3 w-3" />
                    Qualify
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="gap-0.5 text-[11px]"
                  >
                    Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
