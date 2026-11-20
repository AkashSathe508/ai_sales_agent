import React from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  FileText,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function BusinessNeedsMatching({
  businessNeeds = [],
  painPoints = [],
  productMatch = [],
  opportunities = [],
  risks = [],
}) {
  return (
    <div className="space-y-6">
      {/* Needs & Pain Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Validated Business Needs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Strategic Business Needs
            </CardTitle>
            <CardDescription className="text-xs">
              Extracted from customer interactions & board mandates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {businessNeeds.map((need, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 flex items-start gap-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{need}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operational Pain Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Verified Operational Pain Points
            </CardTitle>
            <CardDescription className="text-xs">
              Directly grounded in CRM notes and rep interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {painPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/20 flex items-start gap-2.5"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{point}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Product / Solution Capability Match */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Product & Solution Capability Match
              </CardTitle>
              <CardDescription className="text-xs">
                Zero hallucination: Every product capability is grounded in documentation
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs self-start sm:self-auto">
              100% Traceable Match
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            {productMatch.map((match, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {match.feature}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono self-start sm:self-auto">
                    Doc: {match.docSource}
                  </Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  {match.benefit}
                </p>
                {match.chunkExcerpt && (
                  <div className="ml-6 p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 italic">
                    "{match.chunkExcerpt}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Opportunities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Strategic Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/20 flex items-start gap-2.5 text-slate-700 dark:text-slate-300"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{opp}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Identified Deal Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              Potential Deal Risks & Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {risks.map((risk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/20 flex items-start gap-2.5 text-slate-700 dark:text-slate-300"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{risk}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BusinessNeedsMatching;
