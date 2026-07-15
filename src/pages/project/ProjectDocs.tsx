import { useEffect, useState, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, FileText, Folder, Pin, Star, Trash2, Edit3, X,
  ChevronRight, ChevronDown, Search, Save, RotateCcw, FolderPlus,
  Bold, Italic, Code, List, Quote, Heading1, Heading2
} from 'lucide-react';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatRelative } from '@/utils';
import type { Project, Document } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export function ProjectDocs() {
  const { project } = useOutletContext<{ project: Project }>();
  const { success, warning } = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (draft) {
      setEditContent(draft.content);
      setShowDraftBanner(false);
      success('Draft restored', 'Unsaved changes loaded.');
    }
  };

  const discardDraft = () => {
    if (!selectedDoc) return;
    DocumentStorage.clearDraft(selectedDoc.id);
    setEditContent(selectedDoc.content);
    setShowDraftBanner(false);
    warning('Draft discarded', 'Unsaved changes deleted.');
  };

  const createDoc = (type: 'document' | 'folder', parentId?: string) => {
    const defaultTitle = type === 'folder' ? 'New Folder' : 'Untitled Document';
    const defaultContent = type === 'document' ? '# Untitled Document\n\nStart writing...' : '';

    const doc = DocumentStorage.create({
      projectId: project.id,
      type,
      title: defaultTitle,
      content: defaultContent,
      parentId,
      isPinned: false,
      isFavorite: false,
    });

    ActivityStorage.log('doc_created', 'Document created', `New ${type} "${doc.title}" created`, project.id, doc.id);
    refresh();

    // If it is a child, automatically expand the parent folder
    if (parentId) {
      setCollapsedFolders(prev => ({ ...prev, [parentId]: false }));
    }

    if (type === 'document') {
      openDoc(doc);
    }
  };

  const deleteDoc = (doc: Document) => {
    if (confirm(`Delete "${doc.title}"?${doc.type === 'folder' ? ' This will delete all documents inside too.' : ''}`)) {
      DocumentStorage.delete(doc.id);
      ActivityStorage.log('doc_deleted', 'Document deleted', `"${doc.title}" was deleted`, project.id, doc.id);
      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
      refresh();
      success(`${doc.type === 'folder' ? 'Folder' : 'Document'} deleted`);
    }
  };

  const togglePin = (doc: Document) => {
    DocumentStorage.update(doc.id, { isPinned: !doc.isPinned });
    refresh();
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const insertMarkdown = (syntax: string, placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = syntax.includes('%s')
      ? syntax.replace('%s', selectedText || placeholder)
      : syntax + (selectedText || placeholder);

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleContentChange(newContent);

    // Reset cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Filters and grouping
  const filtered = docs.filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(d => d.isPinned && d.type === 'document');

  // Hierarchy building: find root documents (no parentId or parentId not in list)
  const folders = filtered.filter(d => d.type === 'folder');
  const rootDocs = filtered.filter(d => d.type === 'document' && (!d.parentId || !docs.some(folder => folder.id === d.parentId)));

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden animate-in">
      {/* Sidebar */}
      <div className="w-64 border-r border-surface-border bg-white flex flex-col flex-shrink-0 select-none">
        <div className="p-4 border-b border-surface-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-content-primary uppercase tracking-wider">Docs Workspace</h2>
            <div className="flex gap-1">
              <button onClick={() => createDoc('folder')} className="btn-ghost p-1.5 h-8 w-8 rounded-lg" title="New Folder">
                <FolderPlus size={14} />
              </button>
              <button onClick={() => createDoc('document')} className="btn-ghost p-1.5 h-8 w-8 rounded-lg" title="New Document">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              className="input h-8 pl-8 text-xs placeholder:text-content-muted"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar tree lists */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {pinned.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <Pin size={10} className="rotate-45" /> Pinned
              </p>
              <div className="space-y-0.5">
                {pinned.map(d => (
                  <DocItem key={d.id} doc={d} selected={selectedDoc?.id === d.id} onSelect={openDoc} onDelete={deleteDoc} onPin={togglePin} />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider px-2 mb-1.5">Files</p>
            <div className="space-y-0.5">
              {docs.length === 0 ? (
                <div className="text-center py-6 px-2">
                  <FileText size={20} className="mx-auto text-content-muted mb-2 opacity-50" />
                  <p className="text-xs text-content-muted">No documents created.</p>
                </div>
              ) : (
                <>
                  {/* Folders */}
                  {folders.map(folder => {
                    const isCollapsed = collapsedFolders[folder.id] ?? false;
                    const childDocs = filtered.filter(d => d.parentId === folder.id);

                    return (
                      <div key={folder.id} className="space-y-0.5">
                        <div
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors text-xs font-semibold',
                            selectedDoc?.id === folder.id ? 'bg-surface-secondary text-content-primary' : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                          )}
                          onClick={() => toggleFolder(folder.id)}
                        >
                          <span onClick={e => { e.stopPropagation(); toggleFolder(folder.id); }}>
                            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                          </span>
                          <Folder size={13} className="text-amber-500 flex-shrink-0" />
                          <span className="flex-1 truncate">{folder.title}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={e => { e.stopPropagation(); createDoc('document', folder.id); }}
                              className="p-0.5 hover:text-content-primary"
                              title="Create document in folder"
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); deleteDoc(folder); }}
                              className="p-0.5 hover:text-red-500"
                              title="Delete folder"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Indented children */}
                        {!isCollapsed && (
                          <div className="ml-4 border-l border-surface-border pl-2 space-y-0.5">
                            {childDocs.map(d => (
                              <DocItem key={d.id} doc={d} selected={selectedDoc?.id === d.id} onSelect={openDoc} onDelete={deleteDoc} onPin={togglePin} />
                            ))}
                            {childDocs.length === 0 && (
                              <p className="text-[10px] text-content-muted py-1 pl-5 italic">Empty folder</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Root Unfolderized Docs */}
                  {rootDocs.map(d => (
                    <DocItem key={d.id} doc={d} selected={selectedDoc?.id === d.id} onSelect={openDoc} onDelete={deleteDoc} onPin={togglePin} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedDoc ? (
          <>
            {/* Sticky Edit Toolbar */}
            <div className="px-6 py-2 border-b border-surface-border bg-surface-secondary/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1">
                <button onClick={() => insertMarkdown('**%s**', 'bold text')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Bold (Ctrl+B)"><Bold size={13} /></button>
                <button onClick={() => insertMarkdown('*%s*', 'italic text')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Italic (Ctrl+I)"><Italic size={13} /></button>
                <button onClick={() => insertMarkdown('# %s', 'Heading')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Heading 1"><Heading1 size={13} /></button>
                <button onClick={() => insertMarkdown('## %s', 'Subheading')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Heading 2"><Heading2 size={13} /></button>
                <div className="w-px h-4 bg-surface-border mx-1" />
                <button onClick={() => insertMarkdown('`%s`', 'code')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Inline Code"><Code size={13} /></button>
                <button onClick={() => insertMarkdown('> %s', 'Blockquote')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Quote"><Quote size={13} /></button>
                <button onClick={() => insertMarkdown('- %s', 'List item')} className="btn-ghost p-1.5 h-8 w-8 text-content-secondary" title="Bullet List"><List size={13} /></button>
              </div>

              {showDraftBanner && (
                <div className="flex items-center gap-2 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 text-xs">
                  <span className="text-amber-800 font-medium">Unsaved draft</span>
                  <button onClick={restoreDraft} className="underline text-amber-700 font-semibold flex items-center gap-0.5">
                    <RotateCcw size={10} /> Restore
                  </button>
                  <button onClick={discardDraft} className="text-amber-500 hover:text-amber-700">Discard</button>
                </div>
              )}
            </div>

            {/* Doc Title header */}
            <div className="px-8 pt-6 pb-3 border-b border-surface-border flex-shrink-0">
              <input
                className="w-full text-xl font-bold text-content-primary border-0 outline-none bg-transparent placeholder:text-content-muted focus:ring-0 focus:border-0"
                value={editTitle}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Document title"
              />
              <p className="text-[10px] text-content-muted mt-1">Auto-saved · {formatRelative(selectedDoc.updatedAt)}</p>
            </div>

            {/* Editor textarea */}
            <div className="flex-1 overflow-y-auto px-8 py-5">
              <textarea
                ref={textareaRef}
                className="w-full h-full min-h-[400px] text-sm text-content-primary leading-relaxed border-0 outline-none bg-transparent resize-none placeholder:text-content-muted font-sans focus:ring-0"
                value={editContent}
                onChange={e => handleContentChange(e.target.value)}
                placeholder="Start writing your plan, specifications, or user guides... (Markdown and standard syntax supported)"
                spellCheck
              />
            </div>
          </>
        ) : (
          <EmptyState
            className="h-full"
            icon="📄"
            title="No document selected"
            description="Documentation keeps everything organized. Select a page or folder, or start fresh."
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
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors text-xs',
        selected ? 'bg-surface-secondary text-content-primary font-medium' : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
      )}
      onClick={() => onSelect(doc)}
    >
      <FileText size={13} className="flex-shrink-0 text-content-muted" />
      <span className="flex-1 truncate">{doc.title}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onPin(doc); }}
          className={cn('p-0.5 hover:text-amber-500 transition-colors', doc.isPinned ? 'text-amber-500' : 'text-content-muted')}
        >
          <Pin size={10} className="rotate-45" fill={doc.isPinned ? 'currentColor' : 'none'} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(doc); }} className="p-0.5 hover:text-red-500 transition-colors text-content-muted">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
