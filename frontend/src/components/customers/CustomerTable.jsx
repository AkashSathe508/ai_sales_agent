import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CustomerTable({ customers = [], onAnalyzeAccount }) {
  const navigate = useNavigate();

  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No accounts match the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <th className="p-3.5 font-semibold">Account ID</th>
            <th className="p-3.5 font-semibold">Company Name</th>
            <th className="p-3.5 font-semibold">Industry</th>
            <th className="p-3.5 font-semibold">Tier</th>
            <th className="p-3.5 font-semibold">Annual Contract Value</th>
            <th className="p-3.5 font-semibold">Subscribed Modules</th>
            <th className="p-3.5 font-semibold">Health Score</th>
            <th className="p-3.5 font-semibold">Account Manager</th>
            <th className="p-3.5 font-semibold">Status</th>
            <th className="p-3.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {customers.map((cust) => (
            <tr
              key={cust.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
              onClick={() => navigate(`/customers/${cust.id}`)}
            >
              <td className="p-3.5 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {cust.id}
              </td>
              <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                {cust.name}
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                {cust.industry}
              </td>
              <td className="p-3.5">
                <Badge variant="outline">{cust.tier}</Badge>
              </td>
              <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
                {cust.annualContractValue}
              </td>
              <td className="p-3.5">
                <div className="flex flex-wrap gap-1">
                  {(cust.products || []).slice(0, 2).map((prod, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300"
                    >
                      {prod}
                    </span>
                  ))}
                  {(cust.products || []).length > 2 && (
                    <span className="text-[10px] text-slate-400">
                      +{cust.products.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span
                    className={
                      cust.healthScore >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : cust.healthScore >= 75
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {cust.healthScore}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (NPS {cust.nps || 9})
                  </span>
                </div>
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-300">
                {cust.accountManager}
              </td>
              <td className="p-3.5">
                <Badge variant="success">{cust.status}</Badge>
              </td>
              <td className="p-3.5 text-right">
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onAnalyzeAccount(cust.id, cust.name)}
                    className="gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-[11px]"
                    title="Run Intelligence Agent in AI Workspace"
                  >
                    <Sparkles className="h-3 w-3" />
                    Analyze
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/customers/${cust.id}`)}
                    className="gap-0.5 text-[11px]"
                  >
                    Dossier <ChevronRight className="h-3 w-3" />
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

export default CustomerTable;
