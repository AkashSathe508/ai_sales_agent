import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '@/services/proposalService';
import {
  CheckCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApprovalsFilterTabs } from '@/components/approvals/ApprovalsFilterTabs';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { ApprovalDecisionModal } from '@/components/approvals/ApprovalDecisionModal';

export function Approvals() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('Approve');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({ queryKey: ['proposals'], queryFn: () => proposalService.getProposals() });
  const approvals = (data?.proposals || []).map((p) => ({
    id: `APPR-${p.id || p.proposal_id}`, proposalId: p.id || p.proposal_id,
    customer: p.customer || p.customer_information?.company_name || 'Unknown', leadId: p.leadId || p.lead_id || '—',
    annualValue: `$${(p.annualValue || p.total_investment || 0).toLocaleString()} / yr`,
    roi: p.roi?.roi_percentage == null ? 'Not provided' : `${p.roi.roi_percentage}% ROI`,
    requestedAt: p.createdDate || p.created_at || '—', requestedBy: 'Proposal workflow',
    status: (p.approvalStatus || p.approval_status || 'Pending').replace('Pending Signoff', 'Pending'),
    requiresGate: p.requiresGate || 'Human review required', assumptions: p.assumptions || [],
    evidence: (p.evidence || []).map((item) => item.source || item), history: p.approvalHistory || [],
  }));

  const handleOpenDecisionModal = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDecision = async (decision) => {
    if (decision.action === 'Request Changes') {
      window.alert('The approval API does not support requesting changes yet.');
      return;
    }
    const payload = { reason: decision.notes, reviewer: decision.reviewer };
    if (decision.action === 'Approve') await proposalService.approveProposal(decision.proposalId, payload);
    else await proposalService.rejectProposal(decision.proposalId, decision.notes, decision.reviewer);
    await queryClient.invalidateQueries({ queryKey: ['proposals'] });
  };

  // Counts for tabs
  const counts = {
    pending: approvals.filter((a) => a.status === 'Pending').length,
    approved: approvals.filter((a) => a.status === 'Approved').length,
    changes: approvals.filter((a) => a.status === 'Changes Requested').length,
    rejected: approvals.filter((a) => a.status === 'Rejected').length,
    all: approvals.length,
  };

  // Filtered list
  const filteredApprovals = approvals.filter((item) => {
    if (activeFilter === 'pending') return item.status === 'Pending';
    if (activeFilter === 'approved') return item.status === 'Approved';
    if (activeFilter === 'changes') return item.status === 'Changes Requested';
    if (activeFilter === 'rejected') return item.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-indigo-500" />
            Human-in-the-Loop Approval Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforces policy boundaries before high-stakes operations (pricing proposals, presentation deck compilation).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Policy Gate: Active
          </Badge>
          <Badge variant="warning" className="py-1 text-xs">
            {counts.pending} Pending Decisions
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <ApprovalsFilterTabs
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        counts={counts}
      />

      {isLoading && <div className="p-5 text-sm text-slate-500">Loading approvals…</div>}
      {error && <div role="alert" className="p-5 text-sm text-rose-600">Unable to load approvals: {error.message}</div>}
      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No approval requests matching the "{activeFilter}" filter.
            </p>
          </div>
        ) : (
          filteredApprovals.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onOpenDecisionModal={handleOpenDecisionModal}
            />
          ))
        )}
      </div>

      {/* Decision Modal */}
      <ApprovalDecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        approvalItem={selectedItem}
        actionType={actionType}
        onConfirm={handleConfirmDecision}
      />
    </div>
  );
}

export default Approvals;
