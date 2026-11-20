import React from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Key,
  Shield,
  Palette,
  Bot,
  Database,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeContext';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-indigo-500" />
            Platform Settings & Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure integration endpoints, agent behavior boundaries, organization identity, and display preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Integration Endpoint */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-500" />
              FastAPI Integration Layer
            </CardTitle>
            <CardDescription className="text-xs">
              Backend API route for dispatching agent queries and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">API Base URL</label>
              <Input defaultValue="http://localhost:8000" readOnly className="font-mono text-xs" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">API Connection Status:</span>
              <Badge variant="default" dot>Ready for Phase 9</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-500" />
              Appearance & Theme
            </CardTitle>
            <CardDescription className="text-xs">
              Select your interface color preference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold dark:bg-indigo-950/40'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <Monitor className="h-4 w-4" />
                System
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Governance & Guardrails */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-500" />
              Safety & Governance Guardrails
            </CardTitle>
            <CardDescription className="text-xs">
              Enforced by Python backend guardrail layer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Human Approval Gate (PPTX)</span>
              <Badge variant="success">Enforced</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Deterministic ROI Verification</span>
              <Badge variant="success">Strict</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Zero Hallucination Pricing</span>
              <Badge variant="success">Catalog Grounded</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Organization Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-500" />
              Multi-Tenant Context
            </CardTitle>
            <CardDescription className="text-xs">
              Identity parameters passed to agent invocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">Organization ID</label>
              <Input defaultValue="org_demo" readOnly className="font-mono text-xs" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">User ID</label>
              <Input defaultValue="user_demo" readOnly className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
