import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Command,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { NAVIGATION_SECTIONS } from '@/constants/navigation';

export function TopNavbar({ setMobileOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Find current route title
  let currentTitle = 'Dashboard';
  for (const sec of NAVIGATION_SECTIONS) {
    const found = sec.items.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    );
    if (found) {
      currentTitle = found.name;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:px-6">
      {/* Left section: mobile toggle + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline font-medium text-slate-600 dark:text-slate-400">
            Platform
          </span>
          <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-400" />
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center / Search bar simulation */}
      <div className="hidden md:flex items-center max-w-sm flex-1 mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search leads, customers, proposals... (Cmd+K)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-14 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <span>⌘</span>K
          </div>
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-2.5">
        {/* Agent System Online Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Supervisor Agent
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
            Active
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/approvals')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          title="2 Pending Approvals"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute 1 top-1.5 right-1.5 flex h-2 w-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Action Button: AI Workspace */}
        <Button
          size="sm"
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm text-xs font-semibold"
          onClick={() => navigate('/workspace')}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Launch Agent</span>
        </Button>
      </div>
    </header>
  );
}
