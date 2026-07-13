import { useEffect, useState, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, FileText, Folder, Pin, Star, Trash2, Edit3, X, ChevronRight, Search, Save, RotateCcw } from 'lucide-react';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatRelative } from '@/utils';
import type { Project, Document } from '@/types';

export function ProjectDocs() {
  const { project } = useOutletContext<{ project: Project }>();
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    refresh();
  }, [project.id]);

  const refresh = () => setDocs(DocumentStorage.getByProject(project.id));

  const openDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setEditContent(doc.content);
    setEditTitle(doc.title);

    // Check for draft
    const draft = DocumentStorage.getDraft(doc.id);
    if (draft && draft.content !== doc.content) {
      setShowDraftBanner(true);
    } else {
      setShowDraftBanner(false);
    }
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    if (!selectedDoc) return;

    // Auto-save draft
    DocumentStorage.saveDraft(selectedDoc.id, content);

    // Debounced real save
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      DocumentStorage.update(selectedDoc.id, { content, title: editTitle });
      DocumentStorage.clearDraft(selectedDoc.id);
      setShowDraftBanner(false);
      refresh();
    }, 1500);
  };

  const handleTitleChange = (title: string) => {
    setEditTitle(title);
    if (!selectedDoc) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      DocumentStorage.update(selectedDoc.id, { title, content: editContent });
      refresh();
    }, 1000);
  };

  const restoreDraft = () => {
    if (!selectedDoc) return;
    const draft = DocumentStorage.getDraft(selectedDoc.id);
    if (draft) { setEditContent(draft.content); setShowDraftBanner(false); }
  };

  const discardDraft = () => {
    if (!selectedDoc) return;
    DocumentStorage.clearDraft(selectedDoc.id);
    setEditContent(selectedDoc.content);
    setShowDraftBanner(false);
  };

  const createDoc = (type: 'document' | 'folder') => {
    const doc = DocumentStorage.create({
      projectId: project.id,
      type,
      title: type === 'folder' ? 'New Folder' : 'Untitled Document',
      content: type === 'document' ? '# Untitled Document\n\nStart writing...' : '',
      isPinned: false,
      isFavorite: false,
    });
    ActivityStorage.log('doc_created', 'Document created', `New document created in "${project.name}"`, project.id, doc.id);
    refresh();
    if (type === 'document') openDoc(doc);
  };

  const deleteDoc = (doc: Document) => {
    if (confirm(`Delete "${doc.title}"?`)) {
      DocumentStorage.delete(doc.id);
      ActivityStorage.log('doc_deleted', 'Document deleted', `"${doc.title}" deleted`, project.id, doc.id);
      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
      refresh();
    }
  };

  const togglePin = (doc: Document) => {
    DocumentStorage.update(doc.id, { isPinned: !doc.isPinned });
    refresh();
  };

  const filtered = docs.filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(d => d.isPinned);
  const unpinned = filtered.filter(d => !d.isPinned);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-surface-border bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-content-primary">Documentation</h2>
            <div className="flex gap-1">
              <button onClick={() => createDoc('folder')} className="btn-ghost p-1.5" title="New Folder"><Folder size={13} /></button>
              <button onClick={() => createDoc('document')} className="btn-ghost p-1.5" title="New Document"><Plus size={13} /></button>
            </div>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-muted" />
            <input className="input h-8 pl-8 text-xs" placeholder="Search docs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {docs.length === 0 ? (
            <div className="text-center py-8 px-2">
              <FileText size={24} className="mx-auto text-content-muted mb-2" />
              <p className="text-xs text-content-muted">No documents yet. Create your first doc.</p>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-content-muted px-2 mb-1 font-medium">Pinned</p>
                  {pinned.map(d => <DocItem key={d.id} doc={d} selected={selectedDoc?.id === d.id} onSelect={openDoc} onDelete={deleteDoc} onPin={togglePin} />)}
                </div>
              )}
              {unpinned.map(d => <DocItem key={d.id} doc={d} selected={selectedDoc?.id === d.id} onSelect={openDoc} onDelete={deleteDoc} onPin={togglePin} />)}
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            {/* Draft banner */}
            {showDraftBanner && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-3 text-sm">
                <span className="text-amber-700 font-medium">Unsaved draft found</span>
                <button onClick={restoreDraft} className="text-amber-700 underline text-xs">Restore draft</button>
                <button onClick={discardDraft} className="text-amber-500 text-xs">Discard</button>
              </div>
            )}

            {/* Doc header */}
            <div className="px-8 pt-8 pb-4 border-b border-surface-border flex-shrink-0">
              <input
                className="w-full text-2xl font-bold text-content-primary border-0 outline-none bg-transparent placeholder:text-content-muted"
                value={editTitle}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Document title"
              />
              <p className="text-xs text-content-muted mt-1">Auto-saved · {formatRelative(selectedDoc.updatedAt)}</p>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <textarea
                className="w-full h-full min-h-[500px] text-sm text-content-primary leading-relaxed border-0 outline-none bg-transparent resize-none placeholder:text-content-muted font-mono"
                value={editContent}
                onChange={e => handleContentChange(e.target.value)}
                placeholder="Start writing... (Markdown supported)"
                spellCheck
              />
            </div>
          </>
        ) : (
          <EmptyState
            className="h-full"
            icon="📄"
            title="No document selected"
            description="Every great product starts with documentation. Select a document or create a new one."
            action={<button onClick={() => createDoc('document')} className="btn-yellow">Create Document</button>}
          />
        )}
      </div>
    </div>
  );
}

function DocItem({ doc, selected, onSelect, onDelete, onPin }: {
  doc: Document;
  selected: boolean;
  onSelect: (d: Document) => void;
  onDelete: (d: Document) => void;
  onPin: (d: Document) => void;
}) {
  return (
    <div
      className={cn('flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors', selected ? 'bg-surface-secondary text-content-primary' : 'hover:bg-surface-secondary text-content-secondary hover:text-content-primary')}
      onClick={() => onSelect(doc)}
    >
      {doc.type === 'folder' ? <Folder size={13} className="flex-shrink-0" /> : <FileText size={13} className="flex-shrink-0" />}
      <span className="text-xs font-medium flex-1 truncate">{doc.title}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onPin(doc); }} className="p-0.5 hover:text-amber-500 transition-colors">
          <Pin size={10} fill={doc.isPinned ? 'currentColor' : 'none'} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(doc); }} className="p-0.5 hover:text-red-500 transition-colors">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
