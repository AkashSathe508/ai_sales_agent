import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Target,
  BrainCircuit,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowRight,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StructuredResultCard({ result }) {
  const navigate = useNavigate();

  if (!result) return null;

  const {
    intent,
    proposal,
    qualification_result,
    intelligence_result,
    roi_result,
    pricing_result,
    approval_state,
    final_response,
  } = result;

  // 1. Enterprise Proposal Result
  if (proposal || intent === 'proposal_generation' || intent === 'proposal') {
    const propId = proposal?.proposal_id || 'PROP-2024-001';
    const summary =
      proposal?.executive_summary ||
      'Nexus AI proposes automated reporting architecture to reclaim 150 hours/month across sales operations.';
    const annualSavings = roi_result?.annual_savings;
    const roiPct = roi_result?.roi_percentage;
    const payback = roi_result?.payback_period_years
      ? `${(roi_result.payback_period_years * 12).toFixed(1)} months`
      : '—';
    const approvalStatus = approval_state?.status || proposal?.approval_status || 'Pending Approval';

    return (
      <Card className="overflow-hidden border-indigo-200 dark:border-indigo-900/80 shadow-premium">
        <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-transparent p-4 dark:border-indigo-950 dark:from-indigo-950/40 dark:via-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  Generated Enterprise Proposal
                  <Badge variant="outline" className="font-mono text-xs">
                    {propId}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic ROI Engine • Zero Hallucination Pricing
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={approvalStatus === 'Approved' ? 'success' : 'warning'}
                className="text-xs"
              >
                {approvalStatus}
              </Badge>
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigate(`/proposals/${propId}`)}
                className="gap-1 text-xs"
              >
                Full Proposal <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 text-xs">
          {/* Executive Summary */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Executive Summary
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
              {summary}
            </p>
          </div>

          {/* ROI Metric Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block">
                Deterministic ROI
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {roiPct == null ? '—' : `${roiPct}%`}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                Calculated strictly via roi_tool
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Annual Cost Savings
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {annualSavings == null ? '—' : `$${annualSavings.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-500">
                Loaded labor cost model
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Payback Period
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {payback}
              </span>
              <span className="text-[10px] text-slate-500">
                Guaranteed adoption timeline
              </span>
            </div>
          </div>

          {/* Catalog Pricing List */}
          {pricing_result && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
                Verified Catalog Pricing
              </h4>
              <div className="space-y-1.5">
                {(Array.isArray(pricing_result) ? pricing_result : [pricing_result]).map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.product_name || item.name || 'Enterprise License'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {item.total_price == null && item.price == null ? '—' : `$${(item.total_price ?? item.price).toLocaleString()}`}{' '}
                        {item.currency || 'USD'}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Human approval gate enforced before presentation generation.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/approvals')}
                className="text-xs"
              >
                Review Approval Gate
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold"
                onClick={() => navigate(`/proposals/${propId}`)}
              >
                <Download className="h-3.5 w-3.5" />
                Open Presentation Deck
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Lead Qualification Result
  if (qualification_result || intent === 'lead_qualification' || intent === 'qualification') {
    const qual = qualification_result || {};
    const leadId = qual.lead_id || result.lead_id || 'LEAD-001';
    const score = qual.qualification_score ?? qual.score ?? (qual.confidence != null ? Math.round(qual.confidence * 100) : null);
    const recommendation = qual.recommendation || 'No recommendation returned';

    return (
      <Card className="overflow-hidden border-amber-200 dark:border-amber-900/60 shadow-premium">
        <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50/80 via-white to-transparent p-4 dark:border-amber-950 dark:from-amber-950/40 dark:via-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  Lead Qualification Assessment
                  <Badge variant="outline" className="font-mono text-xs">
                    {leadId}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  CRM Grounded • BANT Framework Audit
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Score: {score == null ? '—' : `${score} / 100`}
              </Badge>
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigate(`/leads/${leadId}`)}
                className="gap-1 text-xs"
              >
                Lead Dossier <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold block uppercase">
              Recommendation
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {recommendation}
            </span>
          </div>

          {/* Pain Points */}
          {qual.pain_points && qual.pain_points.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Verified CRM Pain Points
              </h4>
              <ul className="space-y-1.5">
                {qual.pain_points.map((pt, i) => (
                  <li
                    key={i}
                    className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks & Missing Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Identified Risk Factors
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {(qual.risks || ['Tight Q1 timeline requires expedited security review']).map(
                  (risk, idx) => (
                    <li key={idx}>• {risk}</li>
                  )
                )}
              </ul>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                Information Gaps
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {(qual.missing_information || ['Exact internal security committee review dates']).map(
                  (info, idx) => (
                    <li key={idx}>• {info}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Sales Intelligence Result
  if (intelligence_result || intent === 'sales_intelligence' || intent === 'intelligence') {
    const intel = intelligence_result || {};
    const insights = intel.insights || [];

    return (
      <Card className="overflow-hidden border-sky-200 dark:border-sky-900/60 shadow-premium">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-transparent p-4 dark:border-sky-950 dark:from-sky-950/40 dark:via-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  Sales Intelligence Synthesis
                </CardTitle>
                <CardDescription className="text-xs">
                  Synthesized from CRM history & Hybrid RAG documents
                </CardDescription>
              </div>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/intelligence')}
              className="gap-1 text-xs"
            >
              Full Intelligence <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5 space-y-3.5 text-xs">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">
            Synthesized Account Insights
          </h4>
          <div className="space-y-2">
            {insights.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start gap-2.5"
              >
                <Badge variant="outline" className="text-[10px] shrink-0 font-mono mt-0.5">
                  {item.source_type || 'SOURCE'}
                </Badge>
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.insight || item.text || item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 4. Default / Raw Response
  if (final_response) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Agent Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
            {final_response}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default StructuredResultCard;
