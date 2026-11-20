import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  User,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Seed CRM Data matching backend LEAD-001 and LEAD-002
const LEAD_DATABASE = {
  'LEAD-001': {
    id: 'LEAD-001',
    company: 'Meridian Financial Group',
    industry: 'Financial Services',
    company_size: '500-1000 employees',
    annual_revenue: '$85,000,000',
    current_solution: 'Excel spreadsheets + Salesforce basic reporting',
    status: 'Qualified',
    priority: 'High',
    score: 82,
    budget_range: '$150,000 - $300,000 annually',
    timeline: 'Q1 next year — board mandate for modernization',
    assigned_rep: 'Alex Thompson',
    contacts: [
      {
        name: 'Sarah Chen',
        title: 'VP of Sales Operations',
        email: 's.chen@meridianfg.com',
        phone: '+1 (555) 234-5678',
        role: 'Internal Champion & Decision Maker',
      },
      {
        name: 'James Liu',
        title: 'Chief Technology Officer',
        email: 'j.liu@meridianfg.com',
        phone: '+1 (555) 234-5679',
        role: 'Technical Evaluator & Security Signoff',
      },
    ],
    pain_points: [
      'Manual sales reporting taking 3 days per month per rep',
      'No real-time pipeline visibility for leadership',
      'Inconsistent forecast accuracy (±40%)',
      'CRM data quality issues — reps not updating records',
      'Cannot correlate sales activity to revenue outcomes',
    ],
    requirements: [
      'Bi-directional Salesforce API synchronization without manual rep data entry',
      'Automated executive dashboards for Monday pipeline reviews',
      'SOC2 Type II security compliance and zero data retention for banking regulations',
      'Guaranteed time recovery of at least 20 hours per rep per month',
    ],
    interactions: [
      {
        id: 'INT-001',
        type: 'Discovery Meeting',
        occurred_at: '2024-01-15',
        rep: 'Alex Thompson',
        subject: 'Discovery Call — Meridian Financial Group',
        notes:
          'Met with Sarah Chen and her operations leads. Confirmed 50 reps spending 3 days/month on Excel reports. Leadership blind to pipeline changes. Budget approved in principle ($150K-$300K range) for Q1 board mandate.',
      },
      {
        id: 'INT-002',
        type: 'Product Demo',
        occurred_at: '2024-01-16',
        rep: 'Alex Thompson',
        subject: 'Follow-up: Product Demo Scheduled',
        notes:
          'Confirmed live demo for Jan 22. Sarah forwarded meeting brief to CTO James Liu. Decision expected by mid-February.',
      },
      {
        id: 'INT-003',
        type: 'Technical Review',
        occurred_at: '2024-01-22',
        rep: 'Alex Thompson',
        subject: 'Technical Evaluation Call with CTO',
        notes:
          'James Liu reviewed technical security architecture. Verified GDPR and SOC2 compliance. Requested security documentation.',
      },
    ],
    qualification_audit: {
      budget_score: 95,
      budget_notes: 'Budget of $150k-$300k explicitly approved for Q1.',
      authority_score: 90,
      authority_notes: 'Sarah Chen (VP) championing with CTO James Liu participating in review.',
      need_score: 95,
      need_notes: 'Severe operational drag: 150 hours/month wasted on manual reporting.',
      timeline_score: 85,
      timeline_notes: 'Target Q1 deployment driven by board mandate.',
      overall_recommendation: 'QUALIFIED — High Probability Enterprise Fit',
    },
    related_proposal: {
      id: 'PROP-2024-001',
      title: 'Enterprise Sales Intelligence Platform Proposal',
      value: '$240,000 / yr',
      roi: '240% ROI (6.5mo payback)',
      approvalStatus: 'Pending Approval',
    },
  },
  'LEAD-002': {
    id: 'LEAD-002',
    company: 'TechVenture Startup',
    industry: 'SaaS',
    company_size: '10-50 employees',
    annual_revenue: '$2,500,000',
    current_solution: 'Google Sheets + Gmail',
    status: 'New',
    priority: 'Medium',
    score: 41,
    budget_range: 'Undisclosed / Unknown',
    timeline: 'Evaluating options',
    assigned_rep: 'Jordan Kim',
    contacts: [
      {
        name: 'Marcus Rivera',
        title: 'CEO',
        email: 'marcus@techventure.io',
        phone: '+1 (555) 876-5432',
        role: 'Sole Decision Maker',
      },
    ],
    pain_points: [
      'No formal sales process',
      'Using spreadsheets for deal tracking',
      'Lack of automated pipeline forecasting',
    ],
    requirements: [
      'Low friction setup',
      'Simple CRM deal tracker',
    ],
    interactions: [
      {
        id: 'INT-101',
        type: 'Cold Outreach',
        occurred_at: '2024-01-08',
        rep: 'Jordan Kim',
        subject: 'Introduction to Autonomous Sales Platform',
        notes: 'Initial cold outreach email. CEO replied expressing interest in lead automation.',
      },
    ],
    qualification_audit: {
      budget_score: 30,
      budget_notes: 'Early stage startup; formal budget unknown.',
      authority_score: 80,
      authority_notes: 'Direct CEO contact.',
      need_score: 60,
      need_notes: 'Clear need for structure, but deal volume is low.',
      timeline_score: 40,
      timeline_notes: 'No urgent corporate deadline.',
      overall_recommendation: 'NURTURE — Not ready for enterprise tier.',
    },
    related_proposal: null,
  },
};

export function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load matching lead or fallback to LEAD-001
  const leadId = id || 'LEAD-001';
  const lead = LEAD_DATABASE[leadId] || LEAD_DATABASE['LEAD-001'];

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/leads')}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Leads
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {lead.company}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {lead.id}
              </Badge>
              <Badge
                variant={lead.status === 'Qualified' ? 'success' : 'default'}
                className="text-xs"
              >
                {lead.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lead.industry} • {lead.company_size} • Annual Revenue: {lead.annual_revenue} • Rep: {lead.assigned_rep}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate('/workspace', {
                state: { initialPrompt: `Qualify ${lead.id} for our enterprise solution` },
              })
            }
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Re-run Qualification
          </Button>

          <Button
            size="sm"
            onClick={() =>
              navigate('/workspace', {
                state: { initialPrompt: `Prepare a proposal for ${lead.id}` },
              })
            }
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Generate Proposal
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview & Pain Points' },
          { id: 'qualification', label: 'BANT Qualification Audit' },
          { id: 'interactions', label: `CRM History (${lead.interactions.length})` },
          { id: 'proposal', label: 'Related Proposals' },
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

      {/* Tab 1: Overview & Pain Points */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pain Points Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Validated Operational Pain Points
                </CardTitle>
                <CardDescription className="text-xs">
                  Grounded in CRM discovery notes and confirmed with customer champion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {lead.pain_points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 flex items-start gap-2.5 text-slate-800 dark:text-slate-200"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  Enterprise Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {lead.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Company & Contact Profiles */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Current Solution:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                    {lead.current_solution}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Budget Range:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {lead.budget_range}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Target Timeline:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {lead.timeline}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Rep:</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {lead.assigned_rep}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stakeholder Contacts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Key Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {contact.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {contact.role}
                      </Badge>
                    </div>
                    <div className="text-slate-500 text-[11px]">{contact.title}</div>
                    <div className="flex flex-col gap-0.5 text-slate-400 text-[11px] pt-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {contact.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {contact.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: BANT Qualification Audit */}
      {activeTab === 'qualification' && (
        <div className="space-y-6">
          <Card glow className="border-indigo-200 dark:border-indigo-900">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    BANT Qualification Scorecard
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Audited by QualificationAgent using CRM facts and discovery notes
                  </CardDescription>
                </div>
                <Badge variant="success" className="text-xs self-start sm:self-auto">
                  Total Score: {lead.score} / 100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 font-semibold">
                Recommendation: {lead.qualification_audit.overall_recommendation}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Budget
                    </span>
                    <Badge variant="outline">{lead.qualification_audit.budget_score}%</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lead.qualification_audit.budget_notes}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Authority
                    </span>
                    <Badge variant="outline">{lead.qualification_audit.authority_score}%</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lead.qualification_audit.authority_notes}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Need</span>
                    <Badge variant="outline">{lead.qualification_audit.need_score}%</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lead.qualification_audit.need_notes}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Timeline
                    </span>
                    <Badge variant="outline">{lead.qualification_audit.timeline_score}%</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lead.qualification_audit.timeline_notes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: CRM Interaction Timeline */}
      {activeTab === 'interactions' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              CRM Interaction Timeline
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of customer touchpoints from Mock CRM Adapter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-xs">
              {lead.interactions.map((act) => (
                <div
                  key={act.id}
                  className="rounded-lg border border-slate-200/90 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono">
                        {act.id}
                      </Badge>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.subject}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {act.occurred_at} • Rep: {act.rep}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800/80">
                    {act.notes}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Related Proposals */}
      {activeTab === 'proposal' && (
        <div className="space-y-4">
          {lead.related_proposal ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                    {lead.related_proposal.title}
                  </CardTitle>
                  <Badge variant="warning">
                    {lead.related_proposal.approvalStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Proposal ID:</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {lead.related_proposal.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Proposed Value:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {lead.related_proposal.value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Return:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {lead.related_proposal.roi}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/proposals/${lead.related_proposal.id}`)}
                    className="w-full text-xs gap-1"
                  >
                    View Full Proposal Dossier <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-slate-500">
              No proposal generated yet for this lead. Click "Generate Proposal" above to trigger ProposalAgent.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default LeadDetails;
