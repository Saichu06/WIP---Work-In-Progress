import { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { PlanningStorage } from '@/storage/PlanningStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { PROJECT_COLORS, PROJECT_ICONS, PROJECT_TEMPLATES } from '@/constants';
import { cn } from '@/utils';
import type { Project } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';

interface ProjectDialogProps {
  open: boolean;
  project?: Project;
  onClose: () => void;
  onSave: () => void;
}

type Step = 'details' | 'template';

export function ProjectDialog({ open, project, onClose, onSave }: ProjectDialogProps) {
  const isEdit = !!project;
  const [step, setStep] = useState<Step>(isEdit ? 'details' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(project?.icon || '📦');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    if (isEdit) {
      ProjectStorage.update(project.id, { name, description, color, icon });
      ActivityStorage.log('project_updated', `Project updated`, `"${name}" was updated`);
    } else {
      const newProject = ProjectStorage.create({
        name, description, color, icon, status: 'active', progress: 0, isFavorite: false,
      });

      ActivityStorage.log('project_created', `Project created`, `"${name}" was created`, newProject.id);

      const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        // Create planning sections
        PlanningStorage.initForProject(newProject.id, template.planningItems);

        // Create sprints
        const sprints = template.sprintNames.map((sprintName, i) => {
          const start = addDays(new Date(), i * 14);
          return SprintStorage.create({
            projectId: newProject.id,
            name: sprintName,
            goal: '',
            notes: '',
            status: i === 0 ? 'planning' : 'planning',
            capacity: 40,
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(addDays(start, 13), 'yyyy-MM-dd'),
          });
        });

        // Create tasks
        const firstSprint = sprints[0];
        template.sampleTasks.forEach(task => {
          TaskStorage.create({
            ...task,
            projectId: newProject.id,
            sprintId: firstSprint?.id,
          });
        });

        // Create docs
        template.defaultDocs.forEach(doc => {
          DocumentStorage.create({
            projectId: newProject.id,
            type: 'document',
            title: doc.title,
            content: doc.content,
            isPinned: false,
            isFavorite: false,
          });
        });

        ActivityStorage.log('sprint_created', `Sprints created from template`, `${template.sprintNames.length} sprints created`, newProject.id);
      } else {
        // blank — just init default planning sections
        PlanningStorage.initForProject(newProject.id);
      }
    }

    setSaving(false);
    onSave();
    handleClose();
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate('blank');
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setIcon('📦');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-border w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-content-primary">
              {isEdit ? 'Edit Project' : (step === 'template' ? 'Choose a Template' : 'Project Details')}
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              {isEdit ? 'Update project information' : (step === 'template' ? 'Start fast with a pre-built workspace' : 'Name and configure your project')}
            </p>
          </div>
          <button onClick={handleClose} className="btn-ghost p-2 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Template Selection Step */}
          {step === 'template' && !isEdit && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {/* Blank */}
                <button
                  onClick={() => setSelectedTemplate('blank')}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all duration-150',
                    selectedTemplate === 'blank'
                      ? 'border-content-primary bg-surface-secondary'
                      : 'border-surface-border hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-semibold text-sm text-content-primary">Blank Project</div>
                  <div className="text-xs text-content-muted mt-1">Start with an empty workspace</div>
                  {selectedTemplate === 'blank' && <Check size={14} className="text-content-primary mt-2" />}
                </button>

                {PROJECT_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={cn(
                      'text-left p-4 rounded-xl border-2 transition-all duration-150',
                      selectedTemplate === tmpl.id
                        ? 'border-content-primary bg-surface-secondary'
                        : 'border-surface-border hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-2">{tmpl.icon}</div>
                    <div className="font-semibold text-sm text-content-primary">{tmpl.name}</div>
                    <div className="text-xs text-content-muted mt-1 leading-relaxed">{tmpl.description}</div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="badge bg-surface-secondary text-content-muted text-xs">{tmpl.category}</span>
                      <span className="text-xs text-content-muted">{tmpl.sprintNames.length} sprints</span>
                    </div>
                    {selectedTemplate === tmpl.id && <Check size={14} className="text-content-primary mt-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Step */}
          {(step === 'details' || isEdit) && (
            <div className="p-6 space-y-5">
              {/* Icon + Name */}
              <div>
                <label className="label">Project Name</label>
                <div className="flex gap-2">
                  <button
                    className="w-11 h-11 rounded-xl border border-surface-border bg-surface-secondary text-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
                    onClick={() => {
                      const icons = PROJECT_ICONS;
                      const idx = icons.indexOf(icon);
                      setIcon(icons[(idx + 1) % icons.length]);
                    }}
                    title="Click to change icon"
                  >
                    {icon}
                  </button>
                  <input
                    className="input flex-1"
                    placeholder="e.g. My Awesome App"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Description <span className="text-content-muted font-normal">(optional)</span></label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="What are you building? Keep it short."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Color */}
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-7 h-7 rounded-full transition-transform duration-150 hover:scale-110',
                        color === c && 'ring-2 ring-offset-2 ring-content-primary scale-110'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="label">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all duration-150 hover:bg-surface-secondary',
                        icon === ic && 'bg-surface-secondary ring-2 ring-content-primary/20'
                      )}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border flex-shrink-0">
          {step === 'template' && !isEdit ? (
            <>
              <div />
              <div className="flex gap-2">
                <button onClick={handleClose} className="btn-secondary">Cancel</button>
                <button onClick={() => setStep('details')} className="btn-primary">
                  Continue →
                </button>
              </div>
            </>
          ) : (
            <>
              {!isEdit && (
                <button onClick={() => setStep('template')} className="btn-ghost">
                  ← Back
                </button>
              )}
              {isEdit && <button onClick={handleClose} className="btn-secondary">Cancel</button>}
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Start Building')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
