import { useState } from 'react';
import { X } from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { PlanningStorage } from '@/storage/PlanningStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { SnippetStorage } from '@/storage/SnippetStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { PROJECT_COLORS, PROJECT_ICONS } from '@/constants';
import { OFFICIAL_BLUEPRINTS } from '@/constants/blueprints';
import { cn } from '@/utils';
import type { Project, Blueprint, SnippetLanguage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';
import { BlueprintSelector } from './BlueprintSelector';
import { BlueprintStorage } from '@/storage/BlueprintStorage';

interface ProjectDialogProps {
  open: boolean;
  project?: Project;
  onClose: () => void;
  onSave: () => void;
}

type Step = 'blueprint' | 'details';

export function ProjectDialog({ open, project, onClose, onSave }: ProjectDialogProps) {
  const isEdit = !!project;
  const [step, setStep] = useState<Step>(isEdit ? 'details' : 'blueprint');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint>(OFFICIAL_BLUEPRINTS.find(b => b.id === 'blank')!);
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(project?.icon || '◈');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    if (isEdit) {
      ProjectStorage.update(project.id, { name, description, color, icon });
      ActivityStorage.log('project_updated', 'Project updated', `"${name}" was updated`);
    } else {
      const newProject = ProjectStorage.create({
        name,
        description,
        color: selectedBlueprint.color !== '#9CA3AF' ? selectedBlueprint.color : color,
        icon: selectedBlueprint.icon !== '✨' ? selectedBlueprint.icon : icon,
        status: 'active',
        progress: 0,
        isFavorite: false,
      });

      ActivityStorage.log('project_created', 'Project created', `"${name}" was created`, newProject.id);

      const bp = selectedBlueprint;

      // Init planning
      if (bp.planningItems && bp.planningItems.length > 0) {
        PlanningStorage.initForProject(newProject.id, bp.planningItems);
      } else {
        PlanningStorage.initForProject(newProject.id);
      }

      // Create sprints
      const sprints = (bp.sprintNames || []).map((sprintName, i) => {
        const start = addDays(new Date(), i * 14);
        return SprintStorage.create({
          projectId: newProject.id,
          name: sprintName,
          goal: '',
          notes: '',
          status: 'planning',
          capacity: 40,
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(addDays(start, 13), 'yyyy-MM-dd'),
        });
      });

      // Create tasks
      const firstSprint = sprints[0];
      (bp.sampleTasks || []).forEach(task => {
        TaskStorage.create({
          ...task,
          projectId: newProject.id,
          sprintId: firstSprint?.id,
        });
      });

      // Create docs
      (bp.defaultDocs || []).forEach(doc => {
        DocumentStorage.create({
          projectId: newProject.id,
          type: 'document',
          title: doc.title,
          content: doc.content,
          isPinned: false,
          isFavorite: false,
        });
      });

      // Create snippets
      (bp.defaultSnippets || []).forEach(snippet => {
        SnippetStorage.create({
          projectId: newProject.id,
          title: snippet.title,
          description: snippet.description || '',
          language: snippet.language as SnippetLanguage,
          code: snippet.code,
          tags: snippet.tags || [],
          isFavorite: false,
          category: bp.category,
        });
      });

      if (sprints.length > 0) {
        ActivityStorage.log('sprint_created', 'Sprints created from blueprint', `${sprints.length} sprints created`, newProject.id);
      }
      BlueprintStorage.recordUsed(bp.id);
    }

    setSaving(false);
    onSave();
    handleClose();
  };

  const handleClose = () => {
    setStep('blueprint');
    setSelectedBlueprint(OFFICIAL_BLUEPRINTS.find(b => b.id === 'blank')!);
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setIcon('◈');
    onClose();
  };

  const dialogWidth = step === 'blueprint' && !isEdit ? 'max-w-5xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl border border-surface-border w-full mx-4 animate-scale-in flex flex-col',
        dialogWidth,
        step === 'blueprint' && !isEdit ? 'h-[85vh]' : 'max-h-[90vh]'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-content-primary">
              {isEdit ? 'Edit Project' : (step === 'blueprint' ? '✨ Blueprint Store' : 'Project Details')}
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              {isEdit ? 'Update project information' : (step === 'blueprint' ? 'Choose a pre-built workspace to start fast' : `Using: ${selectedBlueprint.icon} ${selectedBlueprint.name}`)}
            </p>
          </div>
          <button onClick={handleClose} className="btn-ghost p-2 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Blueprint Store step */}
          {step === 'blueprint' && !isEdit && (
            <BlueprintSelector
              selected={selectedBlueprint}
              onSelect={setSelectedBlueprint}
            />
          )}

          {/* Details step */}
          {(step === 'details' || isEdit) && (
            <div className="overflow-y-auto h-full p-6 space-y-5">
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
          {step === 'blueprint' && !isEdit ? (
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
                <button onClick={() => setStep('blueprint')} className="btn-ghost">
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
