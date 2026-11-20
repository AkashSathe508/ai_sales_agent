import React from 'react';
import {
  Cpu,
  Bot,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Target,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SupervisorRoutingCard({ decision, intent, leadId, customerId, dealId, requestId }) {
  if (!decision && !intent) return null;

  const intentKey = ({ qualification: 'lead_qualification', proposal: 'proposal_generation', intelligence: 'sales_intelligence' })[intent] || intent;
  const confidence = decision?.confidence != null ? Math.round(decision.confidence * 100) : null;
  const selectedAgent =
    decision?.selected_agent || decision?.agent ||
    (intentKey === 'lead_qualification'
      ? 'QualificationAgent'
      : intentKey === 'proposal_generation'
      ? 'ProposalAgent'
      : 'SalesIntelligenceAgent');

  const intentLabels = {
    qualification: 'Lead Qualification Audit',
    lead_qualification: 'Lead Qualification Audit',
    intelligence: 'Sales Intelligence & Hybrid RAG',
    sales_intelligence: 'Sales Intelligence & Hybrid RAG',
    proposal: 'Enterprise Proposal Automation',
    proposal_generation: 'Enterprise Proposal Automation',
  };

  return (
    <Card className="overflow-hidden border-indigo-200/80 dark:border-indigo-900/60 shadow-subtle">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-transparent p-3.5 dark:border-indigo-950 dark:from-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Supervisor Routing Decision
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  LangGraph
                </Badge>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Deterministic intent classification and graph routing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Confidence:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
              <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              {confidence == null ? '—' : `${confidence}%`}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              Detected Intent
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
              {intentLabels[intentKey] || intent || 'Sales Query'}
            </span>
            <span className="font-mono text-[10px] text-indigo-500">
              {intent || 'auto_detected'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              Delegated Agent
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 block flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" />
              {selectedAgent}
            </span>
            <span className="text-[10px] text-slate-400">
              Autonomous execution node
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              Extracted Entities
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {leadId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  Lead: {leadId}
                </Badge>
              )}
              {customerId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  Cust: {customerId}
                </Badge>
              )}
              {dealId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  Deal: {dealId}
                </Badge>
              )}
              {!leadId && !customerId && !dealId && (
                <span className="text-slate-400 text-[11px]">Direct query context</span>
              )}
            </div>
          </div>
        </div>

        {decision?.reason && (
          <div className="p-2.5 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300">
            <strong className="text-indigo-900 dark:text-indigo-200 font-semibold mr-1">
              Routing Rationale:
            </strong>
            {decision.reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SupervisorRoutingCard;
