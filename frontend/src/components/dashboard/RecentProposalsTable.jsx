import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RecentProposalsTable() {
  const navigate = useNavigate();

  const proposals = [
    {
      id: 'PROP-2024-001',
      customer: 'Meridian Financial Group',
      leadId: 'LEAD-001',
      value: '$240,000 / yr',
      roi: '240% (6.5mo payback)',
      status: 'Ready for Review',
      approvalStatus: 'Pending Approval',
      deckStatus: 'Gate Enforced',
      createdAt: 'Today, 09:30 AM',
    },
    {
      id: 'PROP-2024-002',
      customer: 'Apex Global Logistics',
      leadId: 'LEAD-003',
      value: '$180,000 / yr',
      roi: '310% (4.2mo payback)',
      status: 'Approved',
      approvalStatus: 'Approved',
      deckStatus: 'PPTX Generated',
      createdAt: 'Yesterday, 04:15 PM',
    },
    {
      id: 'PROP-2024-003',
      customer: 'Global Financial Corp',
      leadId: 'CUSTOMER-001',
      value: '$320,000 / yr',
      roi: '280% (5.1mo payback)',
      status: 'In Production',
      approvalStatus: 'Approved',
      deckStatus: 'PPTX Generated',
      createdAt: 'Jan 16, 2024',
    },
    {
      id: 'PROP-2024-004',
      customer: 'Sterling Capital Holdings',
      leadId: 'LEAD-004',
      value: '$195,000 / yr',
      roi: '190% (7.8mo payback)',
      status: 'In Review',
      approvalStatus: 'Pending Approval',
      deckStatus: 'Gate Enforced',
      createdAt: 'Jan 15, 2024',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              Recent Enterprise Proposals
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Grounded Catalog
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Deterministic ROI calculations and PPTX presentation decks generated
          </CardDescription>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => navigate('/proposals')}
          className="text-xs gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <th className="p-3 font-semibold">Proposal ID</th>
                <th className="p-3 font-semibold">Customer / Target</th>
                <th className="p-3 font-semibold">Annual Value</th>
                <th className="p-3 font-semibold">Verified ROI</th>
                <th className="p-3 font-semibold">Approval Gate</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {proposals.map((prop) => (
                <tr
                  key={prop.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/proposals/${prop.id}`)}
                >
                  <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {prop.id}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {prop.customer}
                    </div>
                    <div className="text-[10px] text-slate-400">Lead: {prop.leadId}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                    {prop.value}
                  </td>
                  <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                    {prop.roi}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        prop.approvalStatus === 'Approved' ? 'success' : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {prop.approvalStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/proposals/${prop.id}`);
                      }}
                      className="text-[11px] gap-1"
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentProposalsTable;
