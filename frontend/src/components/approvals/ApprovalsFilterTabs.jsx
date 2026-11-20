import React from 'react';
import { Badge } from '@/components/ui/badge';

export function ApprovalsFilterTabs({
  activeFilter,
  setActiveFilter,
  counts = {},
}) {
  const tabs = [
    { id: 'pending', label: 'Pending Signoff', count: counts.pending || 0, color: 'warning' },
    { id: 'approved', label: 'Approved', count: counts.approved || 0, color: 'success' },
    { id: 'changes', label: 'Changes Requested', count: counts.changes || 0, color: 'secondary' },
    { id: 'rejected', label: 'Rejected', count: counts.rejected || 0, color: 'destructive' },
    { id: 'all', label: 'All Requests', count: counts.all || 0, color: 'default' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
            activeFilter === tab.id
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold shadow-sm border border-indigo-200/60 dark:border-indigo-800/60'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>{tab.label}</span>
          <Badge
            variant={tab.color}
            className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
          >
            {tab.count}
          </Badge>
        </button>
      ))}
    </div>
  );
}

export default ApprovalsFilterTabs;
