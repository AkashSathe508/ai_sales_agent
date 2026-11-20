import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  TrendingUp,
  DollarSign,
  Download,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ProposalROISection } from '@/components/proposals/ProposalROISection';
import { ProposalPricingTable } from '@/components/proposals/ProposalPricingTable';
import { ProposalImplementationTimeline } from '@/components/proposals/ProposalImplementationTimeline';
import { ProposalDraftEditModal } from '@/components/proposals/ProposalDraftEditModal';

// Detailed proposals matching Python backend ProposalAgent
const PROPOSALS_DB = {
  'PROP-2024-001': {
    id: 'PROP-2024-001',
    customer: 'Meridian Financial Group',
    leadId: 'LEAD-001',
    status: 'Ready for Review',
    approvalStatus: 'Pending',
    createdAt: '2024-01-18',
    version: 1,
    executiveSummary:
      'Nexus AI proposes to deploy an autonomous sales intelligence and reporting automation architecture for Meridian Financial Group’s 50 sales representatives. By replacing manual Excel spreadsheet consolidation with CRM-grounded automated reporting and executive forecasting, Meridian will reclaim 150 hours per month across sales operations, reduce forecast variance from ±40% to under ±8%, and achieve a deterministic 240% ROI within a 6.5-month payback horizon.',
    customerProblem:
      'Meridian sales representatives currently expend an average of 3 working days per month compiling manual sales reports across spreadsheets. Disconnected data sources cause forecast variances exceeding ±40%, hindering board-level strategic planning and leaving executive leadership without real-time visibility into weekly pipeline progression.',
    proposedSolution:
      'Deploy the Nexus Enterprise Sales Intelligence Platform with direct bi-directional Salesforce API integration, automated CRM activity hygiene, and deterministic forecasting dashboards. The solution operates headlessly without requiring rep workflow changes, ensuring zero adoption friction while providing leadership with board-ready real-time pipeline clarity.',
    solutionComponents: [
      {
        name: 'Nexus Core Multi-Agent Orchestration Engine',
        description: 'LangGraph StateGraph supervisor with LiteLLM gateway and SOC2 Type II isolated deployment.',
        sku: 'PROD-CORE-01',
      },
      {
        name: '50 Enterprise Sales Rep User Licenses',
        description: 'Automated CRM sync, meeting brief synthesis, and rep reporting automation.',
        sku: 'PROD-REP-01',
      },
      {
        name: 'Deterministic ROI & Presentation Deck Generator',
        description: 'Automated ROI modeling and PowerPoint deck compilation via python-pptx adapter.',
        sku: 'PROD-PPTX-01',
      },
    ],
    expectedBenefits: [
      'Reclaim 24 hours per month per sales representative (150 hours total team capacity recovered).',
      'Increase quarterly forecast precision from ±40% to within ±8% for executive board reviews.',
      '100% automated CRM pipeline hygiene eliminating Friday rep admin overhead.',
      'Net economic benefit of $576,000 in recovered operational labor in the first year alone.',
    ],
    roi: {
      percentage: '240%',
      annualSavings: '$576,000 / yr',
      paybackPeriod: '6.5 months',
      threeYearBenefit: '$1,488,000',
      assumptions: [
        '50 sales representatives with an average loaded labor cost of $125.00/hour.',
        '24 hours/month saved per representative by automating manual reporting and CRM sync.',
        'Conservative 65% adoption velocity across the first 60 days of enterprise deployment.',
        '15% reduction in rep administrative churn based on case study benchmarks.',
      ],
    },
    pricing: [
      {
        sku: 'PROD-REP-01',
        name: 'Nexus Enterprise Platform & 50 Rep Licenses',
        description: 'Multi-agent orchestration, real-time CRM connector, and executive forecasting.',
        quantity: 50,
        unitPrice: '$400 / seat / mo',
        discount: '0%',
        totalPrice: '$240,000',
        frequency: 'Annual',
        version: 'catalog_v2024.1',
      },
      {
        sku: 'PROD-IMP-01',
        name: 'Enterprise Onboarding & Salesforce Schema Mapping',
        description: 'Dedicated solution architect, custom object mapping, and RAG index priming.',
        quantity: 1,
        unitPrice: '$25,000 one-time',
        discount: '0%',
        totalPrice: '$25,000',
        frequency: 'One-Time',
        version: 'catalog_v2024.1',
      },
    ],
    totalInvestment: '$265,000 (First-Year Total)',
    assumptions: [
      'Customer will grant read/write OAuth2 API access to existing Salesforce Enterprise instance.',
      'Client internal security review will conclude within the agreed 14-day expedited review period.',
      'Loaded labor cost of $125/hour confirmed by VP of Sales Operations Sarah Chen.',
    ],
    risks: [
      'Tight Q1 board deadline requires expedited technical evaluation before mid-February.',
      'Rep resistance to changes in pipeline reporting (mitigated by headless background operation).',
    ],
    evidence: [
      {
        title: 'Sales Reporting & Analytics Guide',
        file: 'sales_reporting_guide.md',
        chunkId: 'chunk-srg-04',
        relevanceScore: '96%',
        excerpt:
          'Standardizing reporting schemas saves an average of 24 hours per sales rep per month, eliminating manual spreadsheet consolidation and increasing pipeline forecast reliability by 78%.',
      },
      {
        title: 'Enterprise ROI Calculation Framework',
        file: 'roi_assumptions.md',
        chunkId: 'chunk-roi-02',
        relevanceScore: '94%',
        excerpt:
          'Financial services sales rep hourly loaded cost standard is $125/hr. A 50-rep team saving 24 hours/month yields $150,000 in monthly recovered productivity ($1.8M gross team capacity).',
      },
    ],
  },
};

export function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const proposalId = id || 'PROP-2024-001';
  const proposal = PROPOSALS_DB[proposalId] || PROPOSALS_DB['PROP-2024-001'];

  const [activeTab, setActiveTab] = useState('summary');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(null);

  const handleDownloadPPTX = () => {
    setDownloadNotice('Compiling enterprise PowerPoint (.pptx) deck via python-pptx adapter...');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleDownloadDOCX = () => {
    setDownloadNotice('Exporting structured proposal agreement (.docx) with catalog pricing appendices...');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/proposals')}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Proposals
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {proposal.customer}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {proposal.id}
              </Badge>
              <Badge
                variant={proposal.approvalStatus === 'Approved' ? 'success' : 'warning'}
                className="text-xs"
              >
                {proposal.approvalStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Grounded Enterprise Proposal • Target Lead: {proposal.leadId} • Created: {proposal.createdAt} • Version {proposal.version}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/approvals')}
            className="gap-1.5 text-xs text-amber-600 dark:text-amber-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Approval Gate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDOCX}
            className="gap-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            Export DOCX
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPPTX}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download PPTX
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {downloadNotice && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 flex items-center justify-between animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Presentation Adapter Triggered
          </Badge>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'summary', label: 'Executive Summary & Architecture' },
          { id: 'roi', label: 'Deterministic ROI Engine' },
          { id: 'pricing', label: 'Catalog Pricing' },
          { id: 'implementation', label: 'Implementation Plan (8 Weeks)' },
          { id: 'evidence', label: `Supporting Evidence (${proposal.evidence.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Summary & Problem/Solution */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {proposal.executiveSummary}
              </p>
            </CardContent>
          </Card>

          {/* Problem & Solution Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Client Problem & Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {proposal.customerProblem}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Proposed Autonomous Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {proposal.proposedSolution}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Solution Components Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Solution Architecture Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {proposal.solutionComponents.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {comp.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {comp.sku}
                    </Badge>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                      {comp.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Benefits Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Audited Business Outcomes & ROI Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {proposal.expectedBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/20 flex items-start gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Deterministic ROI */}
      {activeTab === 'roi' && <ProposalROISection roi={proposal.roi} />}

      {/* Tab 3: Catalog Pricing */}
      {activeTab === 'pricing' && (
        <ProposalPricingTable
          items={proposal.pricing}
          totalInvestment={proposal.totalInvestment}
        />
      )}

      {/* Tab 4: Implementation Schedule */}
      {activeTab === 'implementation' && <ProposalImplementationTimeline />}

      {/* Tab 5: Grounded Evidence */}
      {activeTab === 'evidence' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              Traceable Document Citations
            </CardTitle>
            <CardDescription className="text-xs">
              Every fact, labor assumption, and efficiency multiplier is grounded in verified documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {proposal.evidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {ev.title}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {ev.chunkId}
                  </Badge>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 italic text-slate-700 dark:text-slate-300">
                  "{ev.excerpt}"
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  File: data/sample_documents/{ev.file} • Match Score: {ev.relevanceScore}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Draft Edit Modal */}
      <ProposalDraftEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        proposal={proposal}
        onSave={(updated) => {
          proposal.executiveSummary = updated.executiveSummary;
        }}
      />
    </div>
  );
}

export default ProposalDetails;
