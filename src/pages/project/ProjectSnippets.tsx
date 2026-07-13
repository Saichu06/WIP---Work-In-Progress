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

const LANG_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-700',
  typescript: 'bg-blue-100 text-blue-700',
  python: 'bg-emerald-100 text-emerald-700',
  java: 'bg-orange-100 text-orange-700',
  csharp: 'bg-purple-100 text-purple-700',
  cpp: 'bg-blue-100 text-blue-800',
  go: 'bg-sky-100 text-sky-700',
  rust: 'bg-orange-100 text-orange-800',
  ruby: 'bg-red-100 text-red-700',
  php: 'bg-indigo-100 text-indigo-700',
  html: 'bg-orange-100 text-orange-600',
  css: 'bg-blue-100 text-blue-500',
  sql: 'bg-gray-100 text-gray-700',
  bash: 'bg-gray-100 text-gray-800',
  json: 'bg-amber-100 text-amber-700',
  yaml: 'bg-pink-100 text-pink-700',
  markdown: 'bg-gray-100 text-gray-600',
  plaintext: 'bg-gray-100 text-gray-500',
};

const EMPTY_FORM = { title: '', description: '', language: 'typescript' as SnippetLanguage, code: '', tags: '', category: '' };

export function ProjectSnippets() {
  const { project } = useOutletContext<{ project: Project }>();
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
      ActivityStorage.log('snippet_updated', 'Snippet updated', `"${form.title}" was updated`, project.id, editSnippet.id);
    } else {
      const s = SnippetStorage.create({ projectId: project.id, ...form, tags, isFavorite: false });
      ActivityStorage.log('snippet_created', 'Snippet created', `"${form.title}" added`, project.id, s.id);
      setSelected(s);
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
    }
  };

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (s: Snippet) => {
    SnippetStorage.update(s.id, { isFavorite: !s.isFavorite });
    if (selected?.id === s.id) setSelected({ ...s, isFavorite: !s.isFavorite });
    refresh();
  };

  return (
    <div className="flex h-full">
      {/* Snippet List */}
      <div className="w-72 border-r border-surface-border bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-content-primary">Snippets</h2>
            <button onClick={() => setShowForm(true)} className="btn-ghost p-1.5" title="New Snippet">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-muted" />
            <input className="input h-8 pl-8 text-xs" placeholder="Search snippets..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {usedLangs.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setLangFilter('all')} className={cn('px-2 py-0.5 rounded-md text-xs font-medium transition-all', langFilter === 'all' ? 'bg-content-primary text-white' : 'bg-surface-secondary text-content-muted')}>
                All
              </button>
              {usedLangs.map(l => (
                <button key={l} onClick={() => setLangFilter(l)} className={cn('px-2 py-0.5 rounded-md text-xs font-medium transition-all', langFilter === l ? 'bg-content-primary text-white' : 'bg-surface-secondary text-content-muted')}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {snippets.length === 0 ? (
            <div className="text-center py-8 px-2">
              <Code2 size={24} className="mx-auto text-content-muted mb-2" />
              <p className="text-xs text-content-muted">No snippets yet. Save your first reusable code snippet.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-content-muted text-center py-4">No snippets match your search.</p>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn('p-3 rounded-xl cursor-pointer transition-colors group mb-1', selected?.id === s.id ? 'bg-surface-secondary' : 'hover:bg-surface-secondary')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-content-primary truncate">{s.title}</p>
                    {s.description && <p className="text-xs text-content-muted truncate mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); toggleFavorite(s); }} className="p-0.5 rounded hover:text-amber-500 transition-colors">
                      <Star size={10} fill={s.isFavorite ? 'currentColor' : 'none'} className={s.isFavorite ? 'text-amber-500' : 'text-content-muted'} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="p-0.5 rounded hover:text-content-primary text-content-muted transition-colors">
                      <Edit3 size={10} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(s); }} className="p-0.5 rounded hover:text-red-500 text-content-muted transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium', LANG_COLORS[s.language] || 'bg-gray-100 text-gray-600')}>
                    {s.language}
                  </span>
                  {s.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-muted">{t}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Code Viewer / Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showForm ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-content-primary">{editSnippet ? 'Edit Snippet' : 'New Snippet'}</h2>
                <button onClick={resetForm} className="btn-ghost p-1.5"><X size={14} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="e.g. Auth middleware, debounce hook..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="Brief description of what this does" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Language *</label>
                    <select className="input" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value as SnippetLanguage }))}>
                      {SNIPPET_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input className="input" placeholder="e.g. utils, hooks, api..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Tags <span className="text-content-muted font-normal">(comma separated)</span></label>
                  <input className="input" placeholder="auth, middleware, express..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Code *</label>
                  <textarea
                    className="textarea font-mono text-xs"
                    rows={16}
                    placeholder={`// Paste your ${form.language} code here...`}
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    spellCheck={false}
                  />
                </div>
                <div className="flex gap-3 justify-end">
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
            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-surface-border flex-shrink-0 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-content-primary">{selected.title}</h2>
                  {selected.description && <p className="text-sm text-content-secondary mt-1">{selected.description}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn('text-xs px-2 py-0.5 rounded-md font-semibold', LANG_COLORS[selected.language] || 'bg-gray-100 text-gray-600')}>
                      {selected.language}
                    </span>
                    {selected.category && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-surface-secondary text-content-muted">{selected.category}</span>
                    )}
                    {selected.tags.map(t => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-muted flex items-center gap-0.5">
                        <Tag size={9} />{t}
                      </span>
                    ))}
                    <span className="text-xs text-content-muted ml-1">{formatRelative(selected.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={handleCopy} className={cn('btn-ghost text-xs', copied && 'text-emerald-600')}>
                    {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                  <button onClick={() => toggleFavorite(selected)} className="btn-ghost p-2">
                    <Star size={14} fill={selected.isFavorite ? '#F59E0B' : 'none'} className={selected.isFavorite ? 'text-amber-500' : ''} />
                  </button>
                  <button onClick={() => openEdit(selected)} className="btn-ghost p-2"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(selected)} className="btn-ghost p-2 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-y-auto">
              <SyntaxHighlighter
                language={selected.language === 'plaintext' ? 'text' : selected.language}
                style={githubGist}
                showLineNumbers
                customStyle={{ margin: 0, padding: '2rem', fontSize: '0.8125rem', background: '#FAFAFA', minHeight: '100%', lineHeight: '1.6' }}
                lineNumberStyle={{ color: '#9CA3AF', paddingRight: '1.5rem', userSelect: 'none' }}
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
            description="Select a snippet from the list to view its code, or create a new one to save reusable code blocks."
            action={<button onClick={() => setShowForm(true)} className="btn-yellow">Create Snippet</button>}
          />
        )}
      </div>
    </div>
  );
}
