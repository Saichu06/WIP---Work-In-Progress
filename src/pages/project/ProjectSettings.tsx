import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Save, Trash2, Archive, Copy, Info, Palette } from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { SnippetStorage } from '@/storage/SnippetStorage';
import { AssetStorage } from '@/storage/AssetStorage';
import { PlanningStorage } from '@/storage/PlanningStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { useApp } from '@/contexts/AppContext';
import { PROJECT_COLORS, PROJECT_ICONS, ROUTES } from '@/constants';
import { cn } from '@/utils';
import type { Project, ProjectStatus } from '@/types';

export function ProjectSettings() {
  const { project, setProject } = useOutletContext<{ project: Project; setProject: (p: Project) => void }>();
  const { refreshProjects } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [color, setColor] = useState(project.color);
  const [icon, setIcon] = useState(project.icon);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setColor(project.color);
    setIcon(project.icon);
    setStatus(project.status);
  }, [project.id]);

  const handleSave = () => {
    ProjectStorage.update(project.id, { name, description, color, icon, status });
    ActivityStorage.log('project_updated', 'Project updated', `"${name}" settings were saved`, project.id);
    const updated = ProjectStorage.getById(project.id);
    if (updated) setProject(updated);
    refreshProjects();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleArchive = () => {
    const newStatus = project.status === 'archived' ? 'active' : 'archived';
    ProjectStorage.update(project.id, { status: newStatus });
    ActivityStorage.log('project_archived', `Project ${newStatus === 'archived' ? 'archived' : 'restored'}`, `"${project.name}" was ${newStatus === 'archived' ? 'archived' : 'restored'}`, project.id);
    const updated = ProjectStorage.getById(project.id);
    if (updated) setProject(updated);
    refreshProjects();
    setStatus(newStatus);
  };

  const handleDuplicate = () => {
    const dup = ProjectStorage.create({
      name: `${project.name} (Copy)`,
      description: project.description,
      color: project.color,
      icon: project.icon,
      status: 'active',
      progress: 0,
      isFavorite: false,
    });
    ActivityStorage.log('project_created', 'Project duplicated', `"${dup.name}" created from "${project.name}"`, dup.id);
    refreshProjects();
    navigate(ROUTES.PROJECT_OVERVIEW(dup.id));
  };

  const handleDelete = () => {
    if (!confirm(`Permanently delete "${project.name}" and ALL its data (tasks, sprints, docs, snippets, assets)? This cannot be undone.`)) return;
    // Clean up all related data
    TaskStorage.deleteByProject(project.id);
    SprintStorage.deleteByProject(project.id);
    DocumentStorage.deleteByProject(project.id);
    SnippetStorage.deleteByProject(project.id);
    AssetStorage.deleteByProject(project.id);
    PlanningStorage.deleteByProject(project.id);
    ProjectStorage.delete(project.id);
    ActivityStorage.log('project_deleted', 'Project deleted', `"${project.name}" and all its data was deleted`);
    refreshProjects();
    navigate(ROUTES.PROJECTS);
  };

  // Stats
  const taskCount = TaskStorage.getByProject(project.id).length;
  const sprintCount = SprintStorage.getByProject(project.id).length;
  const docCount = DocumentStorage.getByProject(project.id).length;
  const snippetCount = SnippetStorage.getByProject(project.id).length;
  const assetCount = AssetStorage.getByProject(project.id).length;

  return (
    <div className="p-8 max-w-2xl mx-auto animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Settings</h1>
          <p className="page-subtitle">Configure "{project.name}"</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Project Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Identity */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <Palette size={14} /> Visual Identity
          </h2>

          {/* Preview */}
          <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-xl mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: color + '33' }}>
              {icon}
            </div>
            <div>
              <p className="font-semibold text-content-primary text-sm">{name || 'Project Name'}</p>
              <p className="text-xs text-content-muted">{description || 'No description'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Project Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn('w-8 h-8 rounded-full transition-transform hover:scale-110', color === c && 'ring-2 ring-offset-2 ring-content-primary scale-110')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Project Icon</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_ICONS.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-surface-secondary', icon === ic && 'bg-surface-secondary ring-2 ring-content-primary/20')}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={handleSave} className="btn-primary">
              <Save size={14} /> {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <Info size={14} /> Project Data
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tasks', value: taskCount },
              { label: 'Sprints', value: sprintCount },
              { label: 'Documents', value: docCount },
              { label: 'Snippets', value: snippetCount },
              { label: 'Assets', value: assetCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-content-primary">{value}</div>
                <div className="text-xs text-content-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-1">Project Actions</h2>
          <p className="text-xs text-content-muted mb-4">Manage this project's lifecycle.</p>
          <div className="space-y-2">
            <button onClick={handleDuplicate} className="btn-secondary w-full justify-start gap-3">
              <Copy size={15} />
              <div className="text-left">
                <div className="font-medium text-sm">Duplicate Project</div>
                <div className="text-xs text-content-muted font-normal">Create a copy with the same settings but no tasks or sprints.</div>
              </div>
            </button>
            <button onClick={handleArchive} className="btn-secondary w-full justify-start gap-3">
              <Archive size={15} />
              <div className="text-left">
                <div className="font-medium text-sm">{project.status === 'archived' ? 'Restore Project' : 'Archive Project'}</div>
                <div className="text-xs text-content-muted font-normal">{project.status === 'archived' ? 'Move back to active projects.' : 'Move this project to the archive.'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-100">
          <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-xs text-content-muted mb-4">Irreversible actions. Proceed with extreme caution.</p>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={14} /> Delete Entire Project
          </button>
          <p className="text-xs text-content-muted mt-2 flex items-center gap-1">
            <Info size={11} className="flex-shrink-0" />
            This will permanently delete all tasks, sprints, documents, snippets, and assets.
          </p>
        </div>
      </div>
    </div>
  );
}
