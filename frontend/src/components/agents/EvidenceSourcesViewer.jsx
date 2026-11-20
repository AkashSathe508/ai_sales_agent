import React from 'react';
import { FileText, ExternalLink, Bookmark, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EvidenceSourcesViewer({ evidence = [] }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                Traceable Evidence Citations
                <Badge variant="outline" className="text-[10px] font-mono">
                  {evidence.length} Chunks
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Retrieved via Hybrid RAG (BM25 keyword + semantic vector embedding)
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" className="text-[10px] self-start sm:self-auto">
            Grounded Citations
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {evidence.map((item, idx) => {
            const score = item.relevance_score
              ? `${Math.round(item.relevance_score * 100)}% Match`
              : item.score || 'High';

            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-200/90 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.title || item.doc_name || 'Document Chunk'}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {score}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-3 bg-white dark:bg-slate-950/80 p-2 rounded border border-slate-100 dark:border-slate-800/80">
                    "{item.text || item.content || item.excerpt || 'Excerpt grounding output facts.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-400 font-mono">
                  <span className="truncate">File: {item.file || item.source_file || 'knowledge_base.md'}</span>
                  {item.chunk_id && <span>ID: {item.chunk_id}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default EvidenceSourcesViewer;
