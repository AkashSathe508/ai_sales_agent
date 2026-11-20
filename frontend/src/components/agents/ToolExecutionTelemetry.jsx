import React from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ToolExecutionTelemetry({ toolResults = [] }) {
  if (!toolResults || toolResults.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Database className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-sm">Tool Execution Audit</CardTitle>
              <CardDescription className="text-xs">
                Controlled tool calls mediated by access guardrails
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {toolResults.length} Invocations
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <th className="p-3 font-semibold">Tool Name</th>
                <th className="p-3 font-semibold">Operation</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Latency</th>
                <th className="p-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {toolResults.map((tr, idx) => {
                const isSuccess = tr.success ?? tr.status === 'success' ?? true;
                const latency = tr.latency_ms ? `${tr.latency_ms.toFixed(1)}ms` : tr.duration || '—';

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="p-3 font-semibold font-mono text-indigo-600 dark:text-indigo-400">
                      {tr.tool_name || tr.name || 'tool'}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {tr.operation || tr.action || 'execute'}
                    </td>
                    <td className="p-3">
                      {isSuccess ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {latency}
                    </td>
                    <td className="p-3 text-right text-[11px] text-slate-400 font-mono truncate max-w-xs">
                      {tr.summary || tr.details || (tr.data ? 'Payload returned' : 'OK')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ToolExecutionTelemetry;
