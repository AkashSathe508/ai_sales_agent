import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  Bot,
  Database,
  FileText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function ExecutionTimeline({ currentStage, stages = [], status = 'idle' }) {
  const defaultStages = [
    { id: 'request', label: 'User Request', icon: Clock, desc: 'Validated query' },
    { id: 'validation', label: 'Input Validation', icon: ShieldCheck, desc: 'Entity extraction' },
    { id: 'supervisor', label: 'Supervisor Router', icon: Cpu, desc: 'Intent classification' },
    { id: 'specialized', label: 'Specialized Agent', icon: Bot, desc: 'Pipeline execution' },
    { id: 'tools', label: 'Tool Execution', icon: Database, desc: 'CRM / RAG / ROI' },
    { id: 'result', label: 'Structured Result', icon: FileText, desc: 'Grounded output' },
  ];

  const activeStages = stages.length > 0 ? stages : defaultStages;

  return (
    <div className="w-full rounded-xl border border-slate-200/90 bg-white p-4 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Agent Execution Timeline
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {status === 'running' ? (
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Processing Pipeline...
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Completed (6/6 Stages)
            </span>
          ) : status === 'error' ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Execution Halted
            </span>
          ) : (
            <span>Ready for query</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {activeStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone =
            status === 'completed' ||
            (currentStage && activeStages.findIndex((s) => s.id === currentStage) > idx);
          const isCurrent = currentStage === stage.id && status === 'running';
          const isPending = !isDone && !isCurrent;

          return (
            <div
              key={stage.id}
              className={cn(
                'relative flex flex-col justify-between rounded-lg border p-2.5 transition-all text-xs',
                isDone &&
                  'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100',
                isCurrent &&
                  'border-indigo-400 bg-indigo-50/70 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20',
                isPending &&
                  'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30 text-slate-400'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-bold',
                    isDone && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-indigo-600 text-white animate-pulse',
                    isPending && 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {isDone ? '✓' : idx + 1}
                </span>

                <Icon
                  className={cn(
                    'h-3.5 w-3.5',
                    isDone && 'text-emerald-600 dark:text-emerald-400',
                    isCurrent && 'text-indigo-600 dark:text-indigo-400 animate-spin',
                    isPending && 'text-slate-400'
                  )}
                />
              </div>

              <div>
                <div
                  className={cn(
                    'font-semibold text-[11px] truncate',
                    isDone && 'text-emerald-900 dark:text-emerald-300',
                    isCurrent && 'text-indigo-900 dark:text-indigo-200 font-bold',
                    isPending && 'text-slate-600 dark:text-slate-400'
                  )}
                >
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {stage.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutionTimeline;
