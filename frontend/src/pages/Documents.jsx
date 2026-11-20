import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderGit2,
  Search,
  Filter,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  X,
  Layers,
  FileCode,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { documentService } from '@/services/documentService';

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectedDoc, setInspectedDoc] = useState(null);
  const { data, isLoading, error } = useQuery({ queryKey: ['documents'], queryFn: () => documentService.getDocuments() });
  const documents = (data?.documents || []).map((doc) => ({ ...doc, type: doc.type || 'Document', category: 'Indexed document', chunks: null, status: doc.indexed ? 'Indexed' : 'Not indexed', store: doc.store || 'Unknown' }));
  const categories = ['All', 'Indexed document'];

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-indigo-500" />
            Knowledge & Document Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise source material indexed into the Hybrid RAG engine (BM25 + Semantic Vector Search).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1">
            {documents.length} Indexed Documents
          </Badge>
          <Button size="sm" variant="outline" className="gap-2 text-xs" disabled title="Document upload is not supported by the API yet">
            <Upload className="h-3.5 w-3.5" />
            Upload unavailable
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search knowledge documents or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 mr-2 text-[11px] font-medium">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <th className="p-3.5 font-semibold">Document</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Format</th>
                <th className="p-3.5 font-semibold">Chunks</th>
                <th className="p-3.5 font-semibold">Indexed Engine</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && <tr><td className="p-4" colSpan="5">Loading documents…</td></tr>}
              {error && <tr><td role="alert" className="p-4 text-rose-600" colSpan="5">Unable to load documents: {error.message}</td></tr>}
              {filteredDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{doc.name}</span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="outline">{doc.category}</Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {doc.type}
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {doc.chunks ?? '—'} chunks
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    {doc.store}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="success" dot>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setInspectedDoc(doc)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      Inspect Chunks
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Modal */}
      {inspectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 p-6 space-y-4">
            <button
              onClick={() => setInspectedDoc(null)}
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <FileCode className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {inspectedDoc.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {inspectedDoc.category} • {inspectedDoc.chunks} Indexed Chunks
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Sample Chunk (ID: #chunk-01)
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Cosine Similarity Ready
                </Badge>
              </div>
              <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                <p className="text-sm text-slate-600 dark:text-slate-300">Document content preview is not provided by the API.</p>
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>Indexed in <code className="font-mono text-[11px]">InMemoryDocumentStore</code></span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setInspectedDoc(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
