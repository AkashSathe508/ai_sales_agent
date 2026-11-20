import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { Dashboard } from '@/pages/Dashboard';
import { Workspace } from '@/pages/Workspace';
import { Leads } from '@/pages/Leads';
import { LeadDetails } from '@/pages/LeadDetails';
import { Customers } from '@/pages/Customers';
import { CustomerDetails } from '@/pages/CustomerDetails';
import { Intelligence } from '@/pages/Intelligence';
import { Proposals } from '@/pages/Proposals';
import { ProposalDetails } from '@/pages/ProposalDetails';
import { Approvals } from '@/pages/Approvals';
import { Documents } from '@/pages/Documents';
import { Activities } from '@/pages/Activities';
import { Settings } from '@/pages/Settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetails />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposals/:id" element={<ProposalDetails />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/settings" element={<Settings />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
