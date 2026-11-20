import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Bot,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Database,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AgentExecutionStatusWidget() {
  const navigate = useNavigate();

  const agents = [
    {
      name: 'Supervisor Agent',
      role: 'Orchestrator & Intent Router',
      engine: 'LangGraph StateGraph',
      model: 'gemini-1.5-pro',
      status: 'Ready',
      avgLatency: '320ms',
      lastRun: '12m ago',
      intentAccuracy: '98.5%',
    },
    {
      name: 'Qualification Agent',
      role: 'CRM BANT Evaluation & Scoring',
      engine: 'CRM Tool + LLM Evaluator',
      model: 'Deterministic + Gemini',
      status: 'Ready',
      avgLatency: '410ms',
      lastRun: '12m ago',
      intentAccuracy: '100% CRM Grounded',
    },
    {
      name: 'Sales Intelligence Agent',
      role: 'Hybrid RAG & Document Synthesis',
      engine: 'BM25 + Semantic Store',
      model: 'text-embedding-004',
      status: 'Ready',
      avgLatency: '580ms',
      lastRun: '18m ago',
      intentAccuracy: 'Zero Hallucination',
    },
    {
      name: 'Proposal Agent',
      role: 'Deterministic ROI & Presentation Deck',
      engine: 'Pricing Catalog + python-pptx',
      model: 'Deterministic Tool',
      status: 'Ready',
      avgLatency: '240ms',
      lastRun: '24m ago',
      intentAccuracy: 'Enforced Human Gate',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500" />
              Agent System Execution & Health Telemetry
            </CardTitle>
            <Badge variant="success" dot className="text-[10px]">
              Multi-Agent Mesh Active
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            LangGraph StateGraph coordination with deterministic tool guardrails and LiteLLM gateway
          </CardDescription>
        </div>

        <Button
          size="xs"
          variant="outline"
          onClick={() => navigate('/workspace')}
          className="gap-1.5 text-xs self-start sm:self-auto"
        >
          <Sparkles className="h-3 w-3 text-indigo-500" />
          Open Agent Console
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-subtle hover:border-indigo-400 hover:shadow-premium dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </span>
                  </div>
                  <Badge variant="success" dot className="text-[9px] px-1.5 py-0 h-4">
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-1">
                  {agent.role}
                </p>

                <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Engine:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {agent.engine}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px]">
                      {agent.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Latency:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {agent.avgLatency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Ran {agent.lastRun}
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {agent.intentAccuracy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentExecutionStatusWidget;
