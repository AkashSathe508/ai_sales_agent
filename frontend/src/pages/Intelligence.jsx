import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Building2,
  FileSpreadsheet,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { EntitySelector } from '@/components/intelligence/EntitySelector';
import { BusinessNeedsMatching } from '@/components/intelligence/BusinessNeedsMatching';
import { ObjectionPlaybook } from '@/components/intelligence/ObjectionPlaybook';
import { DiscoveryQuestions } from '@/components/intelligence/DiscoveryQuestions';
import { RecommendedSalesActions } from '@/components/intelligence/RecommendedSalesActions';
import { EvidenceCitationDrawer } from '@/components/intelligence/EvidenceCitationDrawer';

// Comprehensive Intelligence Dossiers matching actual backend RAG & CRM data
const INTELLIGENCE_DOSSIERS = {
  'LEAD-001': {
    id: 'LEAD-001',
    name: 'Meridian Financial Group',
    shortName: 'Meridian FG',
    industry: 'Financial Services',
    lastAnalyzed: 'Today at 10:14 AM',
    confidence: '96%',
    businessNeeds: [
      'Eliminate manual sales reporting taking 3 days/month per sales representative across 50 reps.',
      'Provide executive leadership with real-time pipeline visibility for weekly forecasts.',
      'Achieve ±10% forecast accuracy for quarterly board meetings (currently ±40%).',
      'Automate CRM activity hygiene without rep friction or administrative burden.',
    ],
    painPoints: [
      'Manual sales reporting taking 3 days per month per rep',
      'No real-time pipeline visibility for leadership',
      'Inconsistent forecast accuracy (±40%)',
      'CRM data quality issues — reps not updating records',
      'Cannot correlate sales activity to revenue outcomes',
    ],
    productMatch: [
      {
        feature: 'Automated CRM Sync & AI Meeting Summarization',
        benefit: 'Reclaims 24 hours per month per sales representative (150 hours total team capacity).',
        docSource: 'product_overview.md',
        chunkExcerpt: 'Nexus autonomous agents monitor calendar invites, meeting transcripts, and emails to update CRM pipeline fields automatically.',
      },
      {
        feature: 'Deterministic Forecast Analytics & Anomaly Detection',
        benefit: 'Reduces forecast variance from ±40% down to under ±8% using deterministic trend modeling.',
        docSource: 'sales_reporting_guide.md',
        chunkExcerpt: 'Standardizing reporting schemas saves an average of 24 hours per sales rep per month and eliminates manual spreadsheet consolidation.',
      },
      {
        feature: 'Zero-Retention LLM Gateway & Banking Security Isolation',
        benefit: 'Ensures compliance with strict financial services data governance and SOC2 Type II audit standards.',
        docSource: 'security_documentation.md',
        chunkExcerpt: 'Zero customer data is retained by LLM gateways or used for foundation model training. All customer context is ephemeral.',
      },
    ],
    opportunities: [
      'Consolidate 3 fragmented reporting tools into a single autonomous intelligence system.',
      'Potential expansion to wealth management advisory division (additional 75 seats) after successful Q1 pilot.',
      'Fast-track approval by delivering pre-packaged SOC2 Type II compliance dossier directly to CTO James Liu.',
    ],
    risks: [
      'Sales representative pushback if initial onboarding requires significant manual setup.',
      'Tight Q1 board deadline requires expedited technical evaluation before mid-February.',
    ],
    objections: [
      {
        objection: 'We already pay for Salesforce reporting and Tableau licenses.',
        category: 'Incumbent Tooling',
        response:
          'Salesforce and Tableau are passive databases that require manual rep entry and complex SQL dashboards. Nexus is an autonomous system that compiles intelligence automatically, recovering 3 days per rep per month and providing deterministic forecast precision.',
        evidenceSource: 'case_study.md (Section 3: Incumbent Replacement)',
      },
      {
        objection: 'Our security and compliance review takes 6 months at regional banks.',
        category: 'InfoSec & Compliance',
        response:
          'Nexus deploys in isolated VPC environments with SOC2 Type II certification, GDPR compliance, and a zero-data-retention LLM gateway. We have pre-approved reference architectures that reduce review time to under 14 days.',
        evidenceSource: 'security_documentation.md (Section 2: Security Architecture)',
      },
      {
        objection: 'Our sales reps will resist learning another complex software tool.',
        category: 'Adoption & UX',
        response:
          'Nexus operates headless in the background via existing email, calendar, and Zoom/Teams calls. Reps do not need to change their daily habits—the AI populates CRM records autonomously.',
        evidenceSource: 'implementation_guide.md (Section 4: Change Management)',
      },
    ],
    discoveryQuestions: {
      champion: [
        {
          question: 'How much time do your sales managers spend every Friday chasing reps for pipeline updates?',
          objective: 'Quantify management administrative drag and establish emotional urgency.',
        },
        {
          question: 'If you could reclaim 150 hours across your team this month, what high-value accounts would they focus on?',
          objective: 'Connect time savings directly to top-line quota expansion.',
        },
      ],
      economic: [
        {
          question: 'What was the financial impact on your last quarterly earnings when forecast variance swung by ±40%?',
          objective: 'Ground the enterprise software purchase in strategic risk mitigation.',
        },
        {
          question: 'How does this project align with the board’s modernization mandate for Q1?',
          objective: 'Confirm budget allocation is protected from corporate cost reductions.',
        },
      ],
      technical: [
        {
          question: 'What are the strict requirements for your third-party SaaS SOC2 and data retention review?',
          objective: 'Pre-empt security objections with our zero-retention documentation.',
        },
        {
          question: 'How is your Salesforce API integration governed today for external applications?',
          objective: 'Scope connector permissions and ensure rapid IT signoff.',
        },
      ],
    },
    recommendedActions: [
      {
        action: 'Schedule 30-minute tailored Salesforce demo with Sarah Chen & James Liu',
        priority: 'Immediate',
        impact: 'Secures technical buy-in and confirms evaluation deadline of Feb 15.',
        owner: 'Alex Thompson (Account Executive)',
        timeline: 'Within 48 hours',
        ctaLabel: 'Prepare Meeting Brief',
      },
      {
        action: 'Issue SOC2 Type II and Banking Security Whitepaper to CTO James Liu',
        priority: 'High',
        impact: 'Removes primary technical roadblock before contract negotiation.',
        owner: 'Alex Thompson (Account Executive)',
        timeline: 'By Friday',
        ctaLabel: 'View Security Pack',
      },
      {
        action: 'Generate Grounded Proposal with 240% ROI and 6.5mo Payback Guarantee',
        priority: 'High',
        impact: 'Provides economic buyer with board-ready business justification.',
        owner: 'ProposalAgent / Sarah Chen',
        timeline: 'Before Feb 1',
        ctaLabel: 'Generate Proposal',
      },
    ],
    evidenceSources: [
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
          'Financial services sales rep hourly loaded cost standard is $125/hr. A 50-rep team saving 24 hours/month yields $150,000 in monthly recovered productivity ($1.8M annually).',
      },
      {
        title: 'Security and Compliance Overview',
        file: 'security_documentation.md',
        chunkId: 'chunk-sec-01',
        relevanceScore: '93%',
        excerpt:
          'SOC2 Type II certified. Zero customer data is retained by LLM gateways or used for foundation model training. All prompt contexts are ephemeral and encrypted at rest using AES-256.',
      },
      {
        title: 'Financial Services Enterprise Case Study',
        file: 'case_study.md',
        chunkId: 'chunk-cs-03',
        relevanceScore: '91%',
        excerpt:
          'Large regional bank increased forecast accuracy from ±35% to ±6% within 60 days of deploying Nexus AI automated reporting, reclaiming over 180 hours per month across sales operations.',
      },
    ],
  },
  'CUSTOMER-001': {
    id: 'CUSTOMER-001',
    name: 'Apex Manufacturing Corp',
    shortName: 'Apex Mfg',
    industry: 'Manufacturing',
    lastAnalyzed: 'Yesterday at 04:30 PM',
    confidence: '94%',
    businessNeeds: [
      'Expand automated reporting into European manufacturing division (25 reps).',
      'Integrate ERP shop-floor production telemetry with Salesforce deal delivery estimates.',
      'Maintain sub-1 hour quote generation turnaround times for complex custom equipment.',
    ],
    painPoints: [
      'European division still using disconnected Excel sheets',
      'ERP lead times not reflecting in sales commitments',
    ],
    productMatch: [
      {
        feature: 'Multi-Division Global Rollout Architecture',
        benefit: 'Replicates proven 28 hr/month/manager savings achieved in North American division.',
        docSource: 'implementation_guide.md',
        chunkExcerpt: 'Nexus multi-tenant workspaces support localized currencies and regional CRM hierarchies with centralized executive roll-up.',
      },
    ],
    opportunities: [
      'Expansion deal DEAL-002 ($85K/yr) currently at 80% close probability for April.',
      'Unified global forecast reporting for quarterly executive board presentations.',
    ],
    risks: [
      'European GDPR data sovereignty requirements require localized EU cloud tenancy.',
    ],
    objections: [
      {
        objection: 'Our European IT team has different compliance rules than US headquarters.',
        category: 'Data Residency',
        response:
          'Nexus supports EU-isolated cloud instances ensuring all European telemetry and employee CRM interactions remain strictly within EU geographic borders.',
        evidenceSource: 'security_documentation.md (Section 5: Data Sovereignty)',
      },
    ],
    discoveryQuestions: {
      champion: [
        {
          question: 'How do European division heads currently consolidate regional pipeline numbers for David Park?',
          objective: 'Identify communication delays and quantify manual collation time.',
        },
      ],
      economic: [
        {
          question: 'Can we align the European license deployment with your Q2 corporate budgeting cycle?',
          objective: 'Lock in purchasing timeline.',
        },
      ],
      technical: [
        {
          question: 'Do you require dedicated AWS Frankfurt deployment for the European instance?',
          objective: 'Confirm cloud architecture requirements.',
        },
      ],
    },
    recommendedActions: [
      {
        action: 'Issue European Expansion Proposal based on North American QBR success metrics',
        priority: 'High',
        impact: 'Accelerates DEAL-002 close date into Q1.',
        owner: 'Alex Thompson',
        timeline: 'Next 5 days',
        ctaLabel: 'Draft Expansion Proposal',
      },
    ],
    evidenceSources: [
      {
        title: 'Global Enterprise Implementation Guide',
        file: 'implementation_guide.md',
        chunkId: 'chunk-imp-02',
        relevanceScore: '95%',
        excerpt:
          'Multi-region deployments can inherit existing corporate CRM security configurations, reducing regional rollout timelines by 65%.',
      },
    ],
  },
};

export function Intelligence() {
  const navigate = useNavigate();
  const [selectedEntityId, setSelectedEntityId] = useState('LEAD-001');

  const entitiesList = [
    { id: 'LEAD-001', name: 'Meridian Financial Group', shortName: 'Meridian FG', industry: 'Financial Services' },
    { id: 'CUSTOMER-001', name: 'Apex Manufacturing Corp', shortName: 'Apex Mfg', industry: 'Manufacturing' },
  ];

  const currentDossier = INTELLIGENCE_DOSSIERS[selectedEntityId] || INTELLIGENCE_DOSSIERS['LEAD-001'];

  const handleTriggerAnalysis = (entity) => {
    navigate('/workspace', {
      state: { initialPrompt: `Analyze ${entity.name} (${entity.id}) competitive advantages and strategic positioning.` },
    });
  };

  const handleExecuteAction = (action) => {
    if (action.ctaLabel === 'Generate Proposal' || action.ctaLabel === 'Draft Expansion Proposal') {
      navigate('/workspace', {
        state: { initialPrompt: `Prepare a proposal for ${currentDossier.id}` },
      });
    } else {
      navigate('/workspace', {
        state: { initialPrompt: `Prepare a sales meeting brief for ${currentDossier.name} (${currentDossier.id})` },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              Sales Intelligence Workspace
            </h2>
            <Badge variant="default" className="text-xs">
              Hybrid RAG Grounded
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Account-level strategic dossiers synthesized from CRM history and document evidence. Verified solution matching, objection battlecards, and persona discovery questions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => handleTriggerAnalysis(currentDossier)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Run New Intelligence Analysis
          </Button>
        </div>
      </div>

      {/* Target Account Selector */}
      <EntitySelector
        selectedEntityId={selectedEntityId}
        onSelectEntity={setSelectedEntityId}
        entities={entitiesList}
        onTriggerAnalysis={handleTriggerAnalysis}
      />

      {/* 1. Business Needs, Pain Points & Solution Capability Matching */}
      <BusinessNeedsMatching
        businessNeeds={currentDossier.businessNeeds}
        painPoints={currentDossier.painPoints}
        productMatch={currentDossier.productMatch}
        opportunities={currentDossier.opportunities}
        risks={currentDossier.risks}
      />

      {/* 2. Anticipated Objections & Battle-Tested Rep Playbooks */}
      <ObjectionPlaybook objections={currentDossier.objections} />

      {/* 3. Persona-Targeted Discovery Questions */}
      <DiscoveryQuestions questionsByPersona={currentDossier.discoveryQuestions} />

      {/* 4. AI-Prioritized Recommended Sales Actions */}
      <RecommendedSalesActions
        actions={currentDossier.recommendedActions}
        onExecuteAction={handleExecuteAction}
      />

      {/* 5. Supporting Evidence Citations (Hybrid RAG Documentation) */}
      <EvidenceCitationDrawer evidenceSources={currentDossier.evidenceSources} />
    </div>
  );
}

export default Intelligence;
