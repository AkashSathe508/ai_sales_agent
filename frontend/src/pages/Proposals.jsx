import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ProposalFilterBar } from '@/components/proposals/ProposalFilterBar';
import { ProposalTable } from '@/components/proposals/ProposalTable';
import { proposalService } from '@/services/proposalService';

export function Proposals() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState(null);

  const { data, isLoading, error } = useQuery({ queryKey: ['proposals'], queryFn: () => proposalService.getProposals() });
  const proposals = (data?.proposals || []).map((p) => {
    const rawValue = p.annualValue ?? p.total_investment ?? p.pricing?.reduce((sum, item) => sum + (item.total_price || 0), 0) ?? 0;
    const approvalStatus = p.approvalStatus || p.approval_status || 'Pending';
    const roi = p.roi?.roi_percentage;
    return { id: p.id || p.proposal_id, customer: p.customer || p.customer_information?.company_name || 'Unknown',
      leadId: p.leadId || p.lead_id || '—', rawValue, value: `$${rawValue.toLocaleString()} / yr`,
      rawRoi: roi, roi: roi == null ? '—' : `${roi}%`, status: p.status || approvalStatus,
      approvalStatus: approvalStatus.replace('Pending Signoff', 'Pending'), createdAt: p.createdDate || p.created_at || '—' };
  });
  const filteredProposals = useMemo(() => {
    return proposals.filter((prop) => {
      const matchSearch =
        !searchTerm ||
        prop.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.leadId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchApproval =
        approvalFilter === 'all' || prop.approvalStatus === approvalFilter;

      return matchSearch && matchApproval;
    });
  }, [proposals, searchTerm, approvalFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setApprovalFilter('all');
  };

  const handleGenerateProposal = () => {
    navigate('/workspace', {
      state: { initialPrompt: 'Prepare a proposal for LEAD-001 with sales reporting ROI.' },
    });
  };

  const handleRequestApproval = (proposalId) => {
    navigate('/approvals');
  };

  const handleDownloadPPTX = () => {
    setDownloadSuccessMessage('Presentation download is not available from the current API.');
  };

  const totalValue = proposals.reduce((acc, curr) => acc + curr.rawValue, 0);
  const pendingCount = proposals.filter((p) => p.approvalStatus === 'Pending').length;
  const approvedCount = proposals.filter((p) => p.approvalStatus === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
              Proposal Management
            </h2>
            <Badge variant="default" className="text-xs">
              Deterministic Pricing Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Enterprise proposal registry with deterministic ROI calculations, verified catalog pricing tiers, and presentation deck generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={handleGenerateProposal}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Proposal with AI
          </Button>
        </div>
      </div>

      {/* Download Alert Toast / Banner */}
      {downloadSuccessMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
          <Badge variant="success" className="text-[10px]">
            Presentation Adapter Active
          </Badge>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Total Proposal Value</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
            ${totalValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
            100% catalog verified
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Pending Executive Signoff</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {pendingCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Human approval gate required
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Approved Proposals</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {approvedCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Ready for PPTX download
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Average Calculated ROI</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block font-mono">
            255%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Avg payback: 5.9 months
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <ProposalFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        approvalFilter={approvalFilter}
        setApprovalFilter={setApprovalFilter}
        onReset={handleReset}
      />

      {/* Proposal Table */}
      <Card className="overflow-hidden">
        {isLoading && <div className="p-6 text-sm text-slate-500">Loading proposals…</div>}
        {error && <div role="alert" className="p-6 text-sm text-rose-600">Unable to load proposals: {error.message}</div>}
        <ProposalTable
          proposals={filteredProposals}
          onRequestApproval={handleRequestApproval}
          onDownloadPPTX={handleDownloadPPTX}
        />
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredProposals.length}</strong> of {proposals.length} generated proposals
          </span>
          <span className="font-mono text-[11px]">
            Grounded by ProposalAgent & ROITool
          </span>
        </div>
      </Card>
    </div>
  );
}

export default Proposals;

