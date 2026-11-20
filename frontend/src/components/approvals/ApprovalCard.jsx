import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  ShieldAlert,
  History,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ApprovalCard({ item, onOpenDecisionModal }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Changes Requested':
        return <Badge variant="warning">Changes Requested</Badge>;
      default:
        return <Badge variant="warning">Pending Signoff</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="border-b border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {item.proposalId}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {item.customer}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {item.leadId}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(item.status)}
            <span className="text-[11px] text-slate-400">{item.requestedAt}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Metric Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <span className="text-slate-400 block text-[11px]">Proposed Value</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
              {item.annualValue}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <span className="text-slate-400 block text-[11px]">Calculated ROI</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
              {item.roi}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <span className="text-slate-400 block text-[11px]">Human Gate Reason</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {item.requiresGate}
            </span>
          </div>
        </div>

        {/* Verified Assumptions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <span>Audited Calculation Assumptions</span>
            <Badge variant="outline" className="text-[10px] py-0">Deterministic</Badge>
          </h4>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {item.assumptions.map((assump, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Supporting Evidence Citations */}
        {item.evidence && item.evidence.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Verified Grounding Sources
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {item.evidence.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                >
                  <FileText className="h-3 w-3 text-indigo-500" />
                  {ev}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Audit History / Decision record */}
        {item.history && item.history.length > 0 && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1.5">
              <History className="h-3.5 w-3.5" />
              <span>Approval Trail</span>
            </div>
            {item.history.map((hist, idx) => (
              <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{hist.action}</span> by {hist.reviewer} ({hist.timestamp})
                {hist.notes && <p className="italic text-slate-500 mt-0.5">"{hist.notes}"</p>}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/proposals/${item.proposalId}`)}
            className="text-xs text-slate-500"
          >
            View Full Proposal Spec
          </Button>

          {item.status === 'Pending' ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenDecisionModal(item, 'Request Changes')}
                className="text-xs text-slate-700 dark:text-slate-300"
              >
                Request Changes
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onOpenDecisionModal(item, 'Reject')}
                className="text-xs"
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenDecisionModal(item, 'Approve')}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Authorize & Generate PPTX
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Decision recorded and synchronized with Python backend.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ApprovalCard;
