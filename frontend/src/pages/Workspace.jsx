import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Database,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ExecutionTimeline } from '@/components/agents/ExecutionTimeline';
import { SupervisorRoutingCard } from '@/components/agents/SupervisorRoutingCard';
import { ToolExecutionTelemetry } from '@/components/agents/ToolExecutionTelemetry';
import { EvidenceSourcesViewer } from '@/components/agents/EvidenceSourcesViewer';
import { StructuredResultCard } from '@/components/agents/StructuredResultCard';
import { WorkspacePromptBox } from '@/components/agents/WorkspacePromptBox';
import { agentService } from '@/services/agentService';

export function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeRun, setActiveRun] = useState(null);
  const [executionStage, setExecutionStage] = useState('idle');
  const [executionStatus, setExecutionStatus] = useState('idle'); // idle | running | completed | error
  const [backendOnline, setBackendOnline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialPrompt = location.state?.initialPrompt || 'Qualify LEAD-001.';

  // Check if live FastAPI backend is running
  const checkBackendStatus = async () => {
    try {
      await agentService.getHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Execute the live backend workflow.
  const handleExecute = async ({ query, organizationId, userId, autoApprove }) => {
    setErrorMessage(null);
    setExecutionStatus('running');

    try {
      setExecutionStage('request');
      setExecutionStage('validation');
      setExecutionStage('supervisor');
      const response = await agentService.runWorkflow({
        query,
        organization_id: organizationId,
        user_id: userId,
        auto_approve: autoApprove,
      });
      setExecutionStage('specialized');
      setExecutionStage('tools');
      setExecutionStage('result');
      const finalData = response?.result || response;
      setActiveRun(finalData);
      setExecutionStatus('completed');
    } catch (err) {
      setExecutionStatus('error');
      setErrorMessage(err.message || 'Agent execution failed');
      setExecutionStage('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              AI Agent Execution Workspace
            </h2>
            <Badge variant="default" className="text-[10px]">
              Multi-Agent Orchestrator
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Dispatch queries to the LangGraph Supervisor Agent. Real-time routing decisions, controlled tool execution, traceable evidence citations, and deterministic outputs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {backendOnline ? (
            <Badge variant="success" dot className="text-xs">
              FastAPI Connected (:8000)
            </Badge>
          ) : (
            <Badge variant="warning" dot className="text-xs">
              Backend Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Interactive Prompt Composer */}
      <WorkspacePromptBox
        onSubmit={handleExecute}
        isLoading={executionStatus === 'running'}
        initialPrompt={initialPrompt}
      />

      {/* Execution Timeline (6 Stages) */}
      <ExecutionTimeline
        currentStage={executionStage}
        status={executionStatus}
      />

      {/* Error Banner if any */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Execution Output Grid */}
      {activeRun ? (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* 1. Supervisor Routing Decision */}
          <SupervisorRoutingCard
            decision={activeRun.supervisor_decision}
            intent={activeRun.intent}
            leadId={activeRun.lead_id}
            customerId={activeRun.customer_id}
            dealId={activeRun.deal_id}
            requestId={activeRun.request_id}
          />

          {/* 2. Structured Final Result Card */}
          <StructuredResultCard result={activeRun} />

          {/* 3. Controlled Tool Invocations & Grounded Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ToolExecutionTelemetry toolResults={activeRun.tool_results} />
            <EvidenceSourcesViewer evidence={activeRun.retrieved_evidence} />
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-slate-300 dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-3">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Ready to Dispatch Agent Workflow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Select one of the suggestion pills above (e.g. <em>"Qualify LEAD-001."</em> or <em>"Generate a proposal for LEAD-001."</em>) or enter your own sales request to watch the supervisor route through the pipeline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Workspace;
