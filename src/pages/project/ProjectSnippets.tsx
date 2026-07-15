import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Code2, Star, Trash2, Edit3, X, Copy, Check, Tag } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SnippetStorage } from '@/storage/SnippetStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { SNIPPET_LANGUAGES } from '@/constants';
import { cn, formatRelative } from '@/utils';
import type { Project, Snippet, SnippetLanguage } from '@/types';
import { useToast } from '@/contexts/ToastContext';

const LANG_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  typescript: 'bg-blue-100 text-blue-700 border border-blue-200',
  python: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  java: 'bg-orange-100 text-orange-700 border border-orange-200',
  csharp: 'bg-purple-100 text-purple-700 border border-purple-200',
  cpp: 'bg-blue-100 text-blue-800 border border-blue-200',
  go: 'bg-sky-100 text-sky-700 border border-sky-200',
  rust: 'bg-orange-100 text-orange-800 border border-orange-200',
  ruby: 'bg-red-100 text-red-700 border border-red-200',
  php: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  html: 'bg-orange-100 text-orange-600 border border-orange-200',
  css: 'bg-blue-100 text-blue-500 border border-blue-200',
  sql: 'bg-gray-100 text-gray-700 border border-gray-200',
  bash: 'bg-gray-100 text-gray-800 border border-gray-200',
  json: 'bg-amber-100 text-amber-700 border border-amber-200',
  yaml: 'bg-pink-100 text-pink-700 border border-pink-200',
  markdown: 'bg-gray-100 text-gray-600 border border-gray-200',
  plaintext: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const EMPTY_FORM = { title: '', description: '', language: 'typescript' as SnippetLanguage, code: '', tags: '', category: '' };

export function ProjectSnippets() {
  const { project } = useOutletContext<{ project: Project }>();
  const { success } = useToast();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selected, setSelected] = useState<Snippet | null>(null);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editSnippet, setEditSnippet] = useState<Snippet | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    refresh();
  }, [project.id]);

  const refresh = () => setSnippets(SnippetStorage.getByProject(project.id));

  const filtered = snippets.filter(s => {
    if (langFilter !== 'all' && s.language !== langFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) &&
      !s.description.toLowerCase().includes(search.toLowerCase()) &&
      !s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const pinned = filtered.filter(s => s.isFavorite);
  const unpinned = filtered.filter(s => !s.isFavorite);
  const usedLangs = [...new Set(snippets.map(s => s.language))];

  const openEdit = (s: Snippet) => {
    setEditSnippet(s);
    setForm({ title: s.title, description: s.description, language: s.language, code: s.code, tags: s.tags.join(', '), category: s.category });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditSnippet(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editSnippet) {
      SnippetStorage.update(editSnippet.id, { ...form, tags });
      success('Snippet updated');
    } else {
      const s = SnippetStorage.create({ projectId: project.id, ...form, tags, isFavorite: false });
      ActivityStorage.log('snippet_created', 'Snippet created', `"${form.title}" added`, project.id, s.id);
      setSelected(s);
      success('Snippet created');
    }
    refresh();
    resetForm();
  };

  const handleDelete = (s: Snippet) => {
    if (confirm(`Delete "${s.title}"?`)) {
      SnippetStorage.delete(s.id);
      ActivityStorage.log('snippet_deleted', 'Snippet deleted', `"${s.title}" was deleted`, project.id);
      if (selected?.id === s.id) setSelected(null);
      refresh();
      success('Snippet deleted');
    }
  };

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.code);
    setCopied(true);
    success('Copied to clipboard', 'Snippet code copied successfully.');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (s: Snippet) => {
    SnippetStorage.update(s.id, { isFavorite: !s.isFavorite });
    if (selected?.id === s.id) setSelected({ ...s, isFavorite: !s.isFavorite });
    refresh();
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden animate-in">
      {/* Sidebar: Snippet List */}
      <div className="w-72 border-r border-surface-border bg-white flex flex-col flex-shrink-0 select-none">
        <div className="p-4 border-b border-surface-border space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-content-primary uppercase tracking-wider">Snippets Library</h2>
            <button onClick={() => setShowForm(true)} className="btn-ghost p-1.5 h-8 w-8 rounded-lg" title="New Snippet">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input className="input h-8 pl-8 text-xs placeholder:text-content-muted" placeholder="Search title or tags..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {usedLangs.length > 0 && (
            <div className="flex gap-1 flex-wrap max-h-16 overflow-y-auto">
              <button
                onClick={() => setLangFilter('all')}
                className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all', langFilter === 'all' ? 'bg-content-primary text-white border-content-primary' : 'bg-surface-secondary text-content-secondary border-surface-border')}
              >
                All
              </button>
              {usedLangs.map(l => (
                <button
                  key={l}
                  onClick={() => setLangFilter(l)}
                  className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all capitalize', langFilter === l ? 'bg-content-primary text-white border-content-primary' : 'bg-surface-secondary text-content-secondary border-surface-border')}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Snippets List Scroll wrapper */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {snippets.length === 0 ? (
            <div className="text-center py-10 px-2">
              <Code2 size={24} className="mx-auto text-content-muted mb-2 opacity-50" />
              <p className="text-xs text-content-muted">Save utilities and standard templates.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-content-muted text-center py-4">No matching snippets.</p>
          ) : (
            <>
              {pinned.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                    <Star size={10} className="fill-amber-400 text-amber-400" /> Pinned
                  </p>
                  <div className="space-y-1">
                    {pinned.map(s => (
                      <SnippetItem key={s.id} snippet={s} selected={selected?.id === s.id} onSelect={setSelected} onFavorite={toggleFavorite} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider px-2 mb-1.5">All Snippets</p>
                <div className="space-y-1">
                  {unpinned.map(s => (
                    <SnippetItem key={s.id} snippet={s} selected={selected?.id === s.id} onSelect={setSelected} onFavorite={toggleFavorite} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor & Highlighting */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {showForm ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-surface-border">
                <h2 className="text-sm font-bold text-content-primary">{editSnippet ? 'Edit Code Snippet' : 'Save Code Snippet'}</h2>
                <button onClick={resetForm} className="btn-ghost p-1 h-7 w-7 rounded-lg flex items-center justify-center"><X size={14} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="e.g. useDebounce hook" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="What does this code do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Language *</label>
                    <select className="input text-xs" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value as SnippetLanguage }))}>
                      {SNIPPET_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input className="input" placeholder="e.g. React hooks" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Tags <span className="text-content-muted font-normal">(comma-separated)</span></label>
                  <input className="input" placeholder="react, hooks, optimization" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Code *</label>
                  <textarea
                    className="textarea font-mono text-xs"
                    rows={12}
                    placeholder={`// Paste your ${form.language} code block here...`}
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    spellCheck={false}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button onClick={handleSave} disabled={!form.title.trim() || !form.code.trim()} className="btn-primary">
                    {editSnippet ? 'Save Changes' : 'Save Snippet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selected ? (
          <>
            {/* Header toolbar */}
            <div className="px-8 py-5 border-b border-surface-border flex-shrink-0 bg-white select-none">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-content-primary">{selected.title}</h2>
                  {selected.description && <p className="text-xs text-content-secondary mt-1">{selected.description}</p>}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md', LANG_COLORS[selected.language] || 'bg-gray-100 text-gray-600')}>
                      {selected.language}
                    </span>
                    {selected.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-secondary text-content-muted">{selected.category}</span>
                    )}
                    {selected.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-muted flex items-center gap-0.5">
                        <Tag size={9} />{t}
                      </span>
                    ))}
                    <span className="text-[10px] text-content-muted ml-1">Updated {formatRelative(selected.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={handleCopy} className={cn('btn-secondary h-8 px-2.5 text-xs font-semibold flex items-center gap-1', copied && 'text-emerald-600 border-emerald-200 bg-emerald-50/50')}>
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy code</>}
                  </button>
                  <button onClick={() => toggleFavorite(selected)} className="btn-ghost p-1.5 h-8 w-8 rounded-lg flex items-center justify-center">
                    <Star size={14} fill={selected.isFavorite ? '#F59E0B' : 'none'} className={selected.isFavorite ? 'text-amber-500' : 'text-content-muted'} />
                  </button>
                  <button onClick={() => openEdit(selected)} className="btn-ghost p-1.5 h-8 w-8 rounded-lg flex items-center justify-center" title="Edit"><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(selected)} className="btn-ghost p-1.5 h-8 w-8 text-red-500 rounded-lg flex items-center justify-center" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>

            {/* Code Highlight Container */}
            <div className="flex-1 overflow-y-auto">
              <SyntaxHighlighter
                language={selected.language === 'plaintext' ? 'text' : selected.language}
                style={githubGist}
                showLineNumbers
                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.75rem', background: '#FAFAFA', minHeight: '100%', lineHeight: '1.6' }}
                lineNumberStyle={{ color: '#9CA3AF', paddingRight: '1rem', userSelect: 'none' }}
              >
                {selected.code}
              </SyntaxHighlighter>
            </div>
          </>
        ) : (
          <EmptyState
            className="h-full"
            icon="💻"
            title="No snippet selected"
            description="Select a snippet from the sidebar or click create to add a new code code utility."
            action={<button onClick={() => setShowForm(true)} className="btn-yellow">Create Snippet</button>}
          />
        )}
      </div>
    </div>
  );
}

function SnippetItem({ snippet, selected, onSelect, onFavorite, onEdit, onDelete }: {
  snippet: Snippet;
  selected: boolean;
  onSelect: (s: Snippet) => void;
  onFavorite: (s: Snippet) => void;
  onEdit: (s: Snippet) => void;
  onDelete: (s: Snippet) => void;
}) {
  return (
    <div
      onClick={() => onSelect(snippet)}
      className={cn(
        'p-3 rounded-xl cursor-pointer transition-colors group text-xs border border-transparent',
        selected ? 'bg-surface-secondary border-surface-border' : 'hover:bg-surface-secondary/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-content-primary truncate">{snippet.title}</p>
          {snippet.description && <p className="text-[10px] text-content-muted truncate mt-0.5">{snippet.description}</p>}
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onFavorite(snippet); }} className="p-0.5 rounded hover:text-amber-500">
            <Star size={10} fill={snippet.isFavorite ? '#F59E0B' : 'none'} className={snippet.isFavorite ? 'text-amber-500' : 'text-content-muted'} />
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit(snippet); }} className="p-0.5 rounded hover:text-content-primary text-content-muted">
            <Edit3 size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(snippet); }} className="p-0.5 rounded hover:text-red-500 text-content-muted">
            <Trash2 size={10} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md font-semibold capitalize', LANG_COLORS[snippet.language] || 'bg-gray-100 text-gray-600')}>
          {snippet.language}
        </span>
        {snippet.tags.slice(0, 2).map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-muted capitalize">{t}</span>
        ))}
      </div>
    </div>
  );
}
