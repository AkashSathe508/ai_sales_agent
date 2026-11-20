import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProposalTable({ proposals = [], onRequestApproval, onDownloadPPTX }) {
  const navigate = useNavigate();

  if (!proposals || proposals.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No proposals match the selected filter criteria.
      </div>
    );
  }

  const getApprovalVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
      case 'pending approval':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <th className="p-3.5 font-semibold">Proposal ID</th>
            <th className="p-3.5 font-semibold">Customer / Target</th>
            <th className="p-3.5 font-semibold">Origin Lead</th>
            <th className="p-3.5 font-semibold">Creation Date</th>
            <th className="p-3.5 font-semibold">Annual Value</th>
            <th className="p-3.5 font-semibold">Deterministic ROI</th>
            <th className="p-3.5 font-semibold">Workflow Status</th>
            <th className="p-3.5 font-semibold">Approval Status</th>
            <th className="p-3.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {proposals.map((prop) => (
            <tr
              key={prop.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group"
              onClick={() => navigate(`/proposals/${prop.id}`)}
            >
              <td className="p-3.5 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {prop.id}
              </td>
              <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                {prop.customer}
              </td>
              <td className="p-3.5 font-mono text-slate-500">
                <Badge variant="outline" className="text-[10px]">
                  {prop.leadId || 'N/A'}
                </Badge>
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                {prop.createdAt}
              </td>
              <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
                {prop.value}
              </td>
              <td className="p-3.5 font-medium text-emerald-600 dark:text-emerald-400">
                {prop.roi}
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                {prop.status}
              </td>
              <td className="p-3.5">
                <Badge variant={getApprovalVariant(prop.approvalStatus)}>
                  {prop.approvalStatus}
                </Badge>
              </td>
              <td className="p-3.5 text-right">
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {prop.approvalStatus === 'Approved' ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDownloadPPTX(prop.id)}
                      className="gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 text-[11px]"
                      title="Download PowerPoint Presentation Deck"
                    >
                      <Download className="h-3 w-3" />
                      PPTX
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onRequestApproval(prop.id)}
                      className="gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 text-[11px]"
                      title="Route to Approval Center"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Gate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/proposals/${prop.id}`)}
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

export default ProposalTable;
