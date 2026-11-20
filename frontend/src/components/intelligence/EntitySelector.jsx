import React from 'react';
import { Building2, Target, Sparkles, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function EntitySelector({
  selectedEntityId,
  onSelectEntity,
  entities = [],
  onTriggerAnalysis,
}) {
  const currentEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Target Account / Lead Dossier
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {currentEntity?.name || 'Selected Entity'}
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              {currentEntity?.id}
            </Badge>
            <Badge variant="success" className="text-[10px]">
              {currentEntity?.industry || 'Enterprise'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick select buttons */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-800 dark:bg-slate-950">
          {entities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => onSelectEntity(entity.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedEntityId === entity.id
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold dark:bg-slate-800 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {entity.shortName || entity.id}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => onTriggerAnalysis(currentEntity)}
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Re-analyze Account
        </Button>
      </div>
    </div>
  );
}

export default EntitySelector;
