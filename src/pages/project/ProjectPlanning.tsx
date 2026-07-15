import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Save, Edit3, Trash2, ChevronDown, ChevronRight, Eye } from 'lucide-react';
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
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

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
    // Automatically expand the section if it is collapsed when editing starts
    setCollapsedIds(prev => ({ ...prev, [section.id]: false }));
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

  const toggleCollapse = (id: string) => {
    setCollapsedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-4xl mx-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Planning Workspace</h1>
            <p className="page-subtitle">Vision, goals, requirements, and architecture notes for {project.name}.</p>
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
            {sections.map(section => {
              const isCollapsed = collapsedIds[section.id] ?? false;
              const isEditing = editingId === section.id;

              return (
                <div key={section.id} className="card group hover:border-gray-300 transition-colors">
                  {/* Section Title Header */}
                  <div className="flex items-center justify-between mb-1 select-none">
                    <button
                      onClick={() => toggleCollapse(section.id)}
                      className="flex items-center gap-2 text-content-primary hover:text-content-primary/80 transition-colors py-1"
                    >
                      {isCollapsed ? <ChevronRight size={16} className="text-content-muted" /> : <ChevronDown size={16} className="text-content-muted" />}
                      <h2 className="text-sm font-semibold text-content-primary">{section.title}</h2>
                    </button>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono text-content-muted mr-2">
                        Saved {formatRelative(section.updatedAt)}
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => toggleCollapse(section.id)}
                          className="btn-ghost p-1.5"
                          title={isCollapsed ? 'Expand section' : 'Collapse section'}
                        >
                          <Eye size={13} />
                        </button>
                      )}
                      {!isEditing && (
                        <button onClick={() => startEdit(section)} className="btn-ghost p-1.5" title="Edit section">
                          <Edit3 size={13} />
                        </button>
                      )}
                      {isEditing && (
                        <button onClick={() => saveEdit(section.id)} className="btn-ghost p-1.5 text-emerald-600" title="Done editing">
                          <Save size={13} />
                        </button>
                      )}
                      <button onClick={() => deleteSection(section.id)} className="btn-ghost p-1.5 text-red-500" title="Delete section">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Section Content area */}
                  {!isCollapsed && (
                    <div className="mt-3 pt-3 border-t border-surface-secondary">
                      {isEditing ? (
                        <textarea
                          className="textarea w-full min-h-[160px] font-mono text-xs focus:ring-1"
                          value={editContent}
                          onChange={e => handleAutoSave(section.id, e.target.value)}
                          placeholder={`Write your ${section.title.toLowerCase()} here... (Markdown supported)`}
                          autoFocus
                        />
                      ) : (
                        <div
                          className={cn('prose-wip cursor-text min-h-[40px]', !section.content && 'flex items-center')}
                          onClick={() => startEdit(section)}
                        >
                          {section.content ? (
                            <pre className="whitespace-pre-wrap font-sans text-sm text-content-secondary">{section.content}</pre>
                          ) : (
                            <p className="text-sm text-content-muted italic">Click to edit and build the plan...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
