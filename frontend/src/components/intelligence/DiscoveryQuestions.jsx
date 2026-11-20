import React from 'react';
import {
  BookmarkCheck,
  User,
  Shield,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DiscoveryQuestions({ questionsByPersona = {} }) {
  const personas = [
    {
      key: 'champion',
      title: 'VP of Sales Operations (Champion)',
      icon: User,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      key: 'economic',
      title: 'Chief Financial Officer (Economic Buyer)',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      key: 'technical',
      title: 'Chief Technology Officer (Technical Evaluator)',
      icon: Shield,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400',
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-indigo-500" />
          Persona-Targeted Discovery Questions
        </CardTitle>
        <CardDescription className="text-xs">
          Calibrated questions designed to uncover budget authority and validate business urgency
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const questions = questionsByPersona[persona.key] || [];

            return (
              <div
                key={persona.key}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${persona.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {persona.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    {questions.length} Questions
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/70 space-y-1"
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5 font-mono">
                          Q{idx + 1}:
                        </span>
                        {q.question}
                      </div>
                      {q.objective && (
                        <div className="text-[11px] text-slate-400 pl-5">
                          <strong>Objective:</strong> {q.objective}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default DiscoveryQuestions;
