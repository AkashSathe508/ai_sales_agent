import React from 'react';
import { DollarSign, ShieldCheck, Tag, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ProposalPricingTable({ items = [], totalInvestment, currency = 'USD' }) {
  const defaultItems = [
    {
      sku: 'PROD-REP-01',
      name: 'Nexus Enterprise Platform & Rep License Pack',
      description: 'Full multi-agent orchestration, real-time CRM connector, and forecasting engine.',
      quantity: 50,
      unitPrice: '$400 / seat / mo',
      discount: '0%',
      totalPrice: '$240,000',
      frequency: 'Annual',
      version: 'catalog_v2024.1',
    },
    {
      sku: 'PROD-IMP-01',
      name: 'Enterprise Onboarding & Schema Customization',
      description: 'Dedicated solution architect, Salesforce custom object mapping, and RAG index priming.',
      quantity: 1,
      unitPrice: '$25,000 one-time',
      discount: '0%',
      totalPrice: '$25,000',
      frequency: 'One-Time',
      version: 'catalog_v2024.1',
    },
  ];

  const pricingItems = items.length > 0 ? items : defaultItems;
  const total = totalInvestment || '$265,000 (First Year Total)';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-500" />
              Verified Catalog Pricing Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Directly grounded in official pricing catalog (zero hallucination guarantee)
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
            SKU Catalog: v2024.1
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <th className="p-3 font-semibold">SKU / Item</th>
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold">Quantity</th>
                <th className="p-3 font-semibold">Unit Price</th>
                <th className="p-3 font-semibold">Billing</th>
                <th className="p-3 font-semibold text-right">Total ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {pricingItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                      {item.sku || `SKU-0${idx + 1}`}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs">
                    {item.description}
                  </td>
                  <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {item.unitPrice}
                  </td>
                  <td className="p-3 text-slate-500">
                    <Badge variant="outline" className="text-[10px]">
                      {item.frequency || 'Annual'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {item.totalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Investment Ribbon */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Pricing locked for 60 days from proposal date.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Total First-Year Investment:
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProposalPricingTable;
