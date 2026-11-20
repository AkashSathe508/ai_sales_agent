import {
  LayoutDashboard,
  Sparkles,
  Target,
  Building2,
  BrainCircuit,
  FileSpreadsheet,
  CheckCheck,
  FolderGit2,
  Activity,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const NAVIGATION_SECTIONS = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        badge: null,
      },
      {
        name: 'AI Workspace',
        path: '/workspace',
        icon: Sparkles,
        badge: 'Agent Hub',
        highlight: true,
      },
    ],
  },
  {
    title: 'CRM & Pipeline',
    items: [
      {
        name: 'Leads Management',
        path: '/leads',
        icon: Target,
        badge: null,
      },
      {
        name: 'Customers',
        path: '/customers',
        icon: Building2,
        badge: null,
      },
    ],
  },
  {
    title: 'Intelligence & Deals',
    items: [
      {
        name: 'Sales Intelligence',
        path: '/intelligence',
        icon: BrainCircuit,
        badge: null,
      },
      {
        name: 'Proposals',
        path: '/proposals',
        icon: FileSpreadsheet,
        badge: null,
      },
      {
        name: 'Approval Center',
        path: '/approvals',
        icon: CheckCheck,
        badge: '2 Pending',
        badgeVariant: 'warning',
      },
      {
        name: 'Document Library',
        path: '/documents',
        icon: FolderGit2,
        badge: null,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        name: 'Activity History',
        path: '/activities',
        icon: Activity,
        badge: null,
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        badge: null,
      },
    ],
  },
];
