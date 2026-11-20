import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  FileText,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  DollarSign,
  Heart,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Seed Customer Dossier matching MockCRMAdapter CUSTOMER-001 & CUSTOMER-002
const CUSTOMER_DATABASE = {
  'CUSTOMER-001': {
    id: 'CUSTOMER-001',
    name: 'Apex Manufacturing Corp',
    industry: 'Manufacturing & Heavy Industry',
    tier: 'Enterprise Tier 2',
    contract_value: '$220,000 / yr',
    account_manager: 'Alex Thompson',
    renewal_date: '2024-12-01',
    health_score: 87,
    nps: 9,
    status: 'Active',
    products: ['SalesReportPro', 'PipelineAnalytics', 'ForecastAI'],
    contacts: [
      {
        name: 'David Park',
        title: 'VP of Global Operations',
        email: 'd.park@apexmfg.com',
        phone: '+1 (555) 432-1098',
        role: 'Account Champion & Executive Sponsor',
      },
      {
        name: 'Linda Gao',
        title: 'Director of Business Systems',
        email: 'l.gao@apexmfg.com',
        phone: '+1 (555) 432-1099',
        role: 'Technical Operations Lead',
      },
    ],
    deals: [
      {
        id: 'DEAL-002',
        name: 'Apex Manufacturing — Multi-Seat AI Expansion (European Division)',
        stage: 'Contract Negotiation',
        value: '$85,000 / yr',
        probability: '80%',
        close_date: '2024-04-15',
        champion: 'David Park',
      },
      {
        id: 'DEAL-001-ORIG',
        name: 'Initial Enterprise Sales Intelligence Platform',
        stage: 'Closed Won',
        value: '$220,000 / yr',
        probability: '100%',
        close_date: '2023-11-20',
        champion: 'David Park',
      },
    ],
    associated_leads: [
      {
        id: 'LEAD-003',
        company: 'Apex Manufacturing Corp (Europe Expansion)',
        status: 'Qualified',
        rep: 'Alex Thompson',
      },
    ],
    interactions: [
      {
        id: 'INT-C01',
        type: 'Quarterly Business Review',
        occurred_at: '2024-01-10',
        rep: 'Alex Thompson',
        notes:
          'Conducted Q4 QBR with David Park. User adoption reached 94% across 40 reps. Leadership noted 28 hours/month saved per manager on reporting. Expressed interest in expanding to European division in Q2.',
      },
      {
        id: 'INT-C02',
        type: 'Account Support Sync',
        occurred_at: '2023-12-14',
        rep: 'Alex Thompson',
        notes:
          'Verified successful CRM pipeline sync with existing ERP system. No latency anomalies detected.',
      },
    ],
    expansion_intelligence: [
      'European division (25 reps) currently uses legacy spreadsheet tracking; high expansion likelihood.',
      'Strong internal advocate in David Park with direct budget authorization under $100K.',
      'ERP migration planned for Q3; opportunity to pitch automated data hygiene connector.',
    ],
  },
  'CUSTOMER-002': {
    id: 'CUSTOMER-002',
    name: 'Global Financial Corp',
    industry: 'Banking & Financial Services',
    tier: 'Enterprise Tier 1',
    contract_value: '$320,000 / yr',
    account_manager: 'Sarah Chen',
    renewal_date: '2024-10-15',
    health_score: 94,
    nps: 10,
    status: 'Active',
    products: ['EnterpriseSuite', 'ForecastAI', 'ComplianceGuard'],
    contacts: [
      {
        name: 'Michael Rodriguez',
        title: 'Chief Technology Officer',
        email: 'm.rodriguez@globalfin.com',
        phone: '+1 (555) 321-7654',
        role: 'Key Decision Maker',
      },
    ],
    deals: [
      {
        id: 'DEAL-003',
        name: 'Wealth Management Division Risk AI Module',
        stage: 'Technical Discovery',
        value: '$120,000 / yr',
        probability: '60%',
        close_date: '2024-05-30',
        champion: 'Michael Rodriguez',
      },
    ],
    associated_leads: [],
    interactions: [
      {
        id: 'INT-C03',
        type: 'Executive Briefing',
        occurred_at: '2024-01-18',
        rep: 'Sarah Chen',
        notes:
          'Met with CTO Michael Rodriguez regarding automated SOX compliance audit logging. Highly positive reception.',
      },
    ],
    expansion_intelligence: [
      'Wealth management division looking for unified AI compliance risk reporting.',
      'Strict deterministic data lineage required for banking audit compliance.',
    ],
  },
};

export function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const customerId = id || 'CUSTOMER-001';
  const customer = CUSTOMER_DATABASE[customerId] || CUSTOMER_DATABASE['CUSTOMER-001'];

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customers')}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Accounts
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {customer.name}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {customer.id}
              </Badge>
              <Badge variant="success" className="text-xs">
                {customer.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {customer.industry} • {customer.tier} • Account Owner: {customer.account_manager}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              navigate('/workspace', {
                state: {
                  initialPrompt: `Identify expansion opportunities for ${customer.name} (${customer.id}).`,
                },
              })
            }
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Expansion with AI
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'overview', label: 'Account Dossier' },
          { id: 'deals', label: `Active Deals (${customer.deals.length})` },
          { id: 'interactions', label: `Interactions (${customer.interactions.length})` },
          { id: 'expansion', label: 'Expansion Intelligence' },
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contract & Licensing Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Contract & Subscribed Product Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Annual Contract Value
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                      {customer.contract_value}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Account Health Score
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {customer.health_score}% (NPS {customer.nps})
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Renewal Date
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                      {customer.renewal_date}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Active Module Subscriptions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.products.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {prod}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expansion Strategy Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-500" />
                  Account Expansion Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {customer.expansion_intelligence.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{exp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stakeholders & Associated Leads */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Key Account Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.contacts.map((contact, idx) => (
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

            {/* Associated Leads */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Associated Inbound Leads</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.associated_leads && customer.associated_leads.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {customer.associated_leads.map((lead, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <div>
                          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {lead.id}
                          </span>
                          <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                            {lead.company}
                          </div>
                        </div>
                        <Badge variant="success">{lead.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No open expansion leads.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Active Deals */}
      {activeTab === 'deals' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              Opportunities & Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {customer.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-lg border border-slate-200/90 p-4 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {deal.id}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {deal.name}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Stage: <strong>{deal.stage}</strong> • Win Probability: {deal.probability} • Est Close: {deal.close_date}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {deal.value}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Champion: {deal.champion}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Interactions */}
      {activeTab === 'interactions' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Account Touchpoints & Meeting Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {customer.interactions.map((int) => (
                <div
                  key={int.id}
                  className="rounded-lg border border-slate-200/90 p-3.5 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {int.type}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {int.occurred_at} • {int.rep}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                    {int.notes}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Expansion Intelligence */}
      {activeTab === 'expansion' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                Autonomous Account Growth Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200">
                AI Recommendation: Pitch multi-seat European rollout using proven 28 hr/month/manager savings metric from US operations.
              </div>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {customer.expansion_intelligence.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CustomerDetails;
