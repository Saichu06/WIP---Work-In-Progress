import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Save, Edit3, Trash2, GripVertical } from 'lucide-react';
import { PlanningStorage } from '@/storage/PlanningStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatRelative } from '@/utils';
import type { Project, PlanningSection } from '@/types';

export function ProjectPlanning() {
  const { project } = useOutletContext<{ project: Project }>();
  const [sections, setSections] = useState<PlanningSection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [draftTimers, setDraftTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const s = PlanningStorage.getByProject(project.id);
    if (s.length === 0) {
      const init = PlanningStorage.initForProject(project.id);
      setSections(init);
    } else {
      setSections(s);
    }
  }, [project.id]);

  const startEdit = (section: PlanningSection) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const saveEdit = (id: string) => {
    PlanningStorage.update(id, { content: editContent });
    ActivityStorage.log('planning_updated', 'Planning updated', `Planning section updated in "${project.name}"`, project.id, id);
    setSections(PlanningStorage.getByProject(project.id));
    setEditingId(null);
  };

  const handleAutoSave = (id: string, content: string) => {
    setEditContent(content);
    if (draftTimers[id]) clearTimeout(draftTimers[id]);
    const timer = setTimeout(() => {
      PlanningStorage.update(id, { content });
      setSections(PlanningStorage.getByProject(project.id));
    }, 1000);
    setDraftTimers(prev => ({ ...prev, [id]: timer }));
  };

  const addSection = () => {
    const s = PlanningStorage.create({
      projectId: project.id,
      title: 'New Section',
      content: '',
      order: sections.length,
    });
    setSections(PlanningStorage.getByProject(project.id));
    startEdit(s);
  };

  const deleteSection = (id: string) => {
    if (confirm('Delete this section?')) {
      PlanningStorage.delete(id);
      setSections(PlanningStorage.getByProject(project.id));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Planning</h1>
          <p className="page-subtitle">Vision, goals, architecture, and research for {project.name}.</p>
        </div>
        <button onClick={addSection} className="btn-primary">
          <Plus size={16} /> Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No planning notes yet"
          description="Every great product starts with a plan. Add your vision, goals, and architecture notes."
          action={<button onClick={addSection} className="btn-yellow">Start Planning</button>}
        />
      ) : (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="card group">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-content-primary">{section.title}</h2>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-content-muted mr-2">Auto-saved {formatRelative(section.updatedAt)}</span>
                  {editingId !== section.id && (
                    <button onClick={() => startEdit(section)} className="btn-ghost p-1.5">
                      <Edit3 size={13} />
                    </button>
                  )}
                  {editingId === section.id && (
                    <button onClick={() => saveEdit(section.id)} className="btn-ghost p-1.5 text-emerald-600">
                      <Save size={13} />
                    </button>
                  )}
                  <button onClick={() => deleteSection(section.id)} className="btn-ghost p-1.5 text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {editingId === section.id ? (
                <textarea
                  className="textarea w-full min-h-[200px] font-mono text-xs"
                  value={editContent}
                  onChange={e => handleAutoSave(section.id, e.target.value)}
                  placeholder={`Write your ${section.title.toLowerCase()} here... (Markdown supported)`}
                  autoFocus
                />
              ) : (
                <div
                  className={cn('prose-wip cursor-text min-h-[60px]', !section.content && 'flex items-center')}
                  onClick={() => startEdit(section)}
                >
                  {section.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-content-secondary">{section.content}</pre>
                  ) : (
                    <p className="text-sm text-content-muted italic">Click to add content…</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
