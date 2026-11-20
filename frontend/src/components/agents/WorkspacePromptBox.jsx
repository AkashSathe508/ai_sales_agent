import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  SlidersHorizontal,
  ShieldAlert,
  Bot,
  Building,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function WorkspacePromptBox({
  onSubmit,
  isLoading = false,
  initialPrompt = '',
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [autoApprove, setAutoApprove] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [orgId, setOrgId] = useState('org_demo');
  const [userId, setUserId] = useState('user_demo');

  const samplePrompts = [
    'Qualify LEAD-001.',
    'Analyze Meridian Financial Group.',
    'Prepare a sales meeting brief for LEAD-001.',
    'Identify opportunities for ABC Corp.',
    'Generate a proposal for LEAD-001.',
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit({
      query: prompt.trim(),
      organizationId: orgId,
      userId: userId,
      autoApprove: autoApprove,
    });
  };

  const handleSelectSample = (sampleText) => {
    setPrompt(sampleText);
    onSubmit({
      query: sampleText,
      organizationId: orgId,
      userId: userId,
      autoApprove: autoApprove,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-indigo-200/90 bg-white p-4 sm:p-5 shadow-premium dark:border-indigo-900/70 dark:bg-slate-900/80 space-y-3.5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white">
              <Bot className="h-3 w-3" />
            </span>
            Sales Intelligence Instruction
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <SlidersHorizontal className="h-3 w-3" />
              {showAdvanced ? 'Hide Options' : 'Execution Options'}
            </button>
          </div>
        </div>

        {/* Text Input area */}
        <div className="relative">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g. Qualify LEAD-001 or Prepare a proposal for LEAD-001..."
            disabled={isLoading}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
          />

          <div className="absolute right-2.5 bottom-2.5">
            <Button
              type="submit"
              size="sm"
              disabled={!prompt.trim() || isLoading}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm text-xs font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Routing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Dispatch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Options Pane */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs animate-in fade-in-50 duration-200">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Organization ID</span>
              <input
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">User ID</span>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="auto-approve-check"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="auto-approve-check" className="text-[11px] text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                Auto-approve proposals (Demo Mode)
              </label>
            </div>
          </div>
        )}

        {/* Quick Prompts Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Suggestions:
          </span>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sp)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {sp}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export default WorkspacePromptBox;
