import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Heart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { CustomerFilterBar } from '@/components/customers/CustomerFilterBar';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { customerService } from '@/services/customerService';

export function Customers() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const { data, isLoading, error } = useQuery({ queryKey: ['customers'], queryFn: () => customerService.getCustomers() });
  const customers = (data?.customers || []).map((customer) => ({
    id: customer.customer_id, name: customer.company_name, industry: customer.industry || 'Unknown',
    tier: customer.tier || 'Standard', annualContractValue: `$${(customer.arr || customer.contract_value || 0).toLocaleString()} / yr`,
    rawArr: customer.arr || customer.contract_value || 0, contactName: customer.primary_contact || customer.contact_name || 'Unknown',
    contactEmail: customer.contact_email || '', accountManager: customer.account_manager || 'Unassigned',
    products: customer.products || [], healthScore: customer.health_score ?? 0, nps: customer.nps ?? '—',
    status: 'Active', renewalDate: customer.contract_end || '—',
  }));
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchSearch =
        !searchTerm ||
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.accountManager.toLowerCase().includes(searchTerm.toLowerCase());

      const matchIndustry = industryFilter === 'all' || cust.industry === industryFilter;
      const matchTier = tierFilter === 'all' || cust.tier === tierFilter;

      return matchSearch && matchIndustry && matchTier;
    });
  }, [customers, searchTerm, industryFilter, tierFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setIndustryFilter('all');
    setTierFilter('all');
  };

  const handleAnalyzeAccount = (customerId, customerName) => {
    navigate('/workspace', {
      state: { initialPrompt: `Analyze ${customerName} (${customerId}) for expansion opportunities.` },
    });
  };

  const totalArr = customers.reduce((acc, curr) => acc + curr.rawArr, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              Customer Accounts
            </h2>
            <Badge variant="default" className="text-xs">
              Live Contracts
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Enterprise customer portfolio, recurring contract value, product adoption, and account intelligence dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => handleAnalyzeAccount('CUSTOMER-001', 'Apex Manufacturing Corp')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Expansion with AI
          </Button>
        </div>
      </div>

      {/* ARR & Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Total Portfolio ARR</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
            ${totalArr.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
            100% on-time renewals
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Avg Health Score</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {customers.length ? Math.round(customers.reduce((s, c) => s + c.healthScore, 0) / customers.length) : 0}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            High product retention
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Net Retention Rate</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            118%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Expansion pipe $205K
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle dark:border-slate-800/90 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 block">Active Accounts</span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {customers.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            0% account churn
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <CustomerFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        tierFilter={tierFilter}
        setTierFilter={setTierFilter}
        onReset={handleReset}
      />

      {/* Customer Table */}
      <Card className="overflow-hidden">
        {isLoading && <div className="p-6 text-sm text-slate-500">Loading customers…</div>}
        {error && <div role="alert" className="p-6 text-sm text-rose-600">Unable to load customers: {error.message}</div>}
        <CustomerTable
          customers={filteredCustomers}
          onAnalyzeAccount={handleAnalyzeAccount}
        />
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredCustomers.length}</strong> of {customers.length} enterprise accounts
          </span>
          <span className="font-mono text-[11px]">
            CRM API
          </span>
        </div>
      </Card>
    </div>
  );
}

export default Customers;
