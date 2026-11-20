import React, { useState } from 'react';
import {
  HelpCircle,
  Copy,
  Check,
  ShieldAlert,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ObjectionPlaybook({ objections = [] }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-500" />
              Anticipated Objections & Counter-Strategies
            </CardTitle>
            <CardDescription className="text-xs">
              Pre-computed responses backed by customer case studies and architecture specs
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
            {objections.length} Battlecards
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {objections.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 shadow-subtle space-y-3 text-xs"
            >
              {/* Objection Statement */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] mt-0.5">
                    !
                  </span>
                  <div>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block">
                      Prospect Objection
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 text-sm">
                      "{item.objection}"
                    </h4>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {item.category || 'Architecture'}
                </Badge>
              </div>

              {/* Rep Battle-Tested Response */}
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950/80 p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Recommended Talk Track:
                  </span>
                  <button
                    onClick={() => handleCopy(item.response, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Pitch</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.response}
                </p>
              </div>

              {/* Document citation evidence for this objection */}
              {item.evidenceSource && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Grounding citation: {item.evidenceSource}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ObjectionPlaybook;
