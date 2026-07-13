import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Code2, Image, FolderOpen, Zap, Map, ArrowRight } from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { SnippetStorage } from '@/storage/SnippetStorage';
import { AssetStorage } from '@/storage/AssetStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { PlanningStorage } from '@/storage/PlanningStorage';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import type { SearchResult } from '@/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeType, setActiveType] = useState<string>('all');

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();

    const projects = ProjectStorage.get();
    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || '';

    const all: SearchResult[] = [
      ...ProjectStorage.search(q).map(p => ({
        id: p.id, type: 'project' as const, title: p.name, subtitle: p.description, url: ROUTES.PROJECT_OVERVIEW(p.id),
      })),
      ...TaskStorage.search(q).map(t => ({
        id: t.id, type: 'task' as const, title: t.title, subtitle: t.status, projectId: t.projectId,
        projectName: getProjectName(t.projectId), url: ROUTES.PROJECT_BACKLOG(t.projectId),
      })),
      ...DocumentStorage.search(q).map(d => ({
        id: d.id, type: 'document' as const, title: d.title, subtitle: d.content.slice(0, 60), projectId: d.projectId,
        projectName: getProjectName(d.projectId), url: ROUTES.PROJECT_DOCS(d.projectId),
      })),
      ...SnippetStorage.search(q).map(s => ({
        id: s.id, type: 'snippet' as const, title: s.title, subtitle: s.language, projectId: s.projectId,
        projectName: getProjectName(s.projectId), url: ROUTES.PROJECT_SNIPPETS(s.projectId),
      })),
      ...AssetStorage.search(q).map(a => ({
        id: a.id, type: 'asset' as const, title: a.name, subtitle: a.type, projectId: a.projectId,
        projectName: getProjectName(a.projectId), url: ROUTES.PROJECT_ASSETS(a.projectId),
      })),
      ...SprintStorage.search(q).map(s => ({
        id: s.id, type: 'sprint' as const, title: s.name, subtitle: s.goal, projectId: s.projectId,
        projectName: getProjectName(s.projectId), url: ROUTES.PROJECT_SPRINTS(s.projectId),
      })),
      ...PlanningStorage.search(q).map(s => ({
        id: s.id, type: 'planning' as const, title: s.title, subtitle: s.content.slice(0, 60), projectId: s.projectId,
        projectName: getProjectName(s.projectId), url: ROUTES.PROJECT_PLANNING(s.projectId),
      })),
    ];
    setResults(all);
  }, [query]);

  const ICONS: Record<string, React.ReactNode> = {
    project: <FolderOpen size={14} />,
    task: <ArrowRight size={14} />,
    document: <FileText size={14} />,
    snippet: <Code2 size={14} />,
    asset: <Image size={14} />,
    sprint: <Zap size={14} />,
    planning: <Map size={14} />,
  };

  const types = ['all', 'project', 'task', 'document', 'snippet', 'asset', 'sprint', 'planning'];
  const filtered = activeType === 'all' ? results : results.filter(r => r.type === activeType);

  const grouped: Record<string, SearchResult[]> = {};
  filtered.forEach(r => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Universal Search</h1>
          <p className="page-subtitle">Search across all projects, tasks, docs, snippets, and more.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
        <input
          className="input pl-11 h-13 text-base"
          style={{ height: '52px' }}
          placeholder="Search everything..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary text-xs">Clear</button>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(t => {
            const count = t === 'all' ? results.length : results.filter(r => r.type === t).length;
            if (count === 0 && t !== 'all') return null;
            return (
              <button key={t} onClick={() => setActiveType(t)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize', activeType === t ? 'bg-content-primary text-white' : 'bg-surface-secondary text-content-muted hover:text-content-primary border border-surface-border')}>
                {t} {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-surface-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
          <h3 className="text-sm font-semibold text-content-primary mb-1">Search Everything</h3>
          <p className="text-sm text-content-secondary">Type at least 2 characters to search across your entire workspace.</p>
          <p className="text-xs text-content-muted mt-2">Pro tip: Use <kbd className="bg-surface-secondary border border-surface-border rounded px-1.5 py-0.5">Ctrl+K</kbd> to open the command palette from anywhere.</p>
        </div>
      )}

      {query && query.length < 2 && (
        <p className="text-center text-sm text-content-muted py-12">Keep typing…</p>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-2xl mb-3">🤔</div>
          <h3 className="text-sm font-semibold text-content-primary mb-1">No results for "{query}"</h3>
          <p className="text-sm text-content-secondary">Try different keywords or check your spelling.</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-6">
          <h2 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2 capitalize">{type}s</h2>
          <div className="space-y-1">
            {items.map(result => (
              <Link key={result.id} to={result.url} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-surface-border hover:shadow-sm transition-all group">
                <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-content-muted flex-shrink-0">
                  {ICONS[result.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-content-primary truncate">{result.title}</div>
                  {result.subtitle && <div className="text-xs text-content-muted truncate mt-0.5">{result.subtitle}</div>}
                  {result.projectName && <div className="text-xs text-content-muted mt-0.5">in {result.projectName}</div>}
                </div>
                <ArrowRight size={13} className="text-content-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
