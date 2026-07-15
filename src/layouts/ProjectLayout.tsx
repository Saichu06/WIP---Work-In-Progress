import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, List, Zap, Layout, GitBranch,
  FileText, Image, Code2, BarChart2, Settings, ChevronRight,
  Star, MoreHorizontal, Archive, Copy, Trash2, Edit3, Share2
} from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { useApp } from '@/contexts/AppContext';
import { ROUTES } from '@/constants';
import { cn, formatRelative } from '@/utils';
import type { Project } from '@/types';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { SaveBlueprintDialog } from '@/components/projects/SaveBlueprintDialog';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'planning', label: 'Planning', icon: Map },
  { id: 'backlog', label: 'Backlog', icon: List },
  { id: 'sprints', label: 'Sprints', icon: Zap },
  { id: 'board', label: 'Board', icon: Layout },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
  { id: 'docs', label: 'Docs', icon: FileText },
  { id: 'assets', label: 'Assets', icon: Image },
  { id: 'snippets', label: 'Snippets', icon: Code2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const { refreshProjects } = useApp();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);

  useEffect(() => {
    if (id) setProject(ProjectStorage.getById(id));
  }, [id]);

  if (!id || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-content-secondary text-sm">Project not found.</p>
      </div>
    );
  }

  const handleFavorite = () => {
    ProjectStorage.toggleFavorite(id);
    setProject(ProjectStorage.getById(id));
    refreshProjects();
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
    ActivityStorage.log('project_created', `Project duplicated`, `"${dup.name}" created from "${project.name}"`, dup.id);
    refreshProjects();
    navigate(ROUTES.PROJECT_OVERVIEW(dup.id));
  };

  const handleDelete = () => {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      ProjectStorage.delete(id);
      ActivityStorage.log('project_deleted', `Project deleted`, `"${project.name}" was deleted`);
      refreshProjects();
      navigate(ROUTES.PROJECTS);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Project Header */}
      <div className="bg-white border-b border-surface-border flex-shrink-0">
        {/* Breadcrumb & Last Updated */}
        <div className="flex items-center justify-between px-6 pt-3 text-[11px] text-content-muted">
          <div className="flex items-center gap-1">
            <span className="hover:text-content-primary cursor-pointer" onClick={() => navigate(ROUTES.PROJECTS)}>Projects</span>
            <ChevronRight size={10} />
            <span className="text-content-primary font-medium">{project.name}</span>
          </div>
          <span className="font-mono">
            Updated {formatRelative(project.updatedAt)}
          </span>
        </div>

        {/* Project title row */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}33` }}
            >
              {project.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-content-primary truncate">{project.name}</h1>
                <span className={cn(
                  'badge text-[10px] font-semibold py-0.5 px-2 rounded-full uppercase tracking-wider',
                  project.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  project.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  project.status === 'on-hold' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-gray-100 text-gray-600 border border-gray-200'
                )}>
                  {project.status}
                </span>
                <button
                  onClick={handleFavorite}
                  className="text-content-muted hover:text-amber-500 transition-colors p-1"
                  title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={14} fill={project.isFavorite ? '#F59E0B' : 'none'} className={project.isFavorite ? 'text-amber-500' : ''} />
                </button>
              </div>
              {project.description && (
                <p className="text-xs text-content-secondary truncate mt-0.5 max-w-xl">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions & Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setBlueprintOpen(true)}
              className="btn-secondary h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5"
              title="Save project structure as a reusable blueprint"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Save as Blueprint</span>
            </button>

            <button
              onClick={() => setEditOpen(true)}
              className="btn-secondary h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Edit3 size={12} />
              <span className="hidden sm:inline">Edit Details</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn-secondary h-8 w-8 p-0 flex items-center justify-center"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-surface-border shadow-lg z-20 py-1 animate-scale-in">
                    <button
                      onClick={handleDuplicate}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-primary hover:bg-surface-secondary"
                    >
                      <Copy size={13} /> Duplicate Project
                    </button>
                    <button
                      onClick={() => {
                        ProjectStorage.update(id, { status: project.status === 'archived' ? 'active' : 'archived' });
                        setProject(ProjectStorage.getById(id));
                        refreshProjects();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-primary hover:bg-surface-secondary"
                    >
                      <Archive size={13} /> {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                    </button>
                    <div className="h-px bg-surface-border my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 px-6 border-t border-surface-border overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <NavLink
              key={tab.id}
              to={ROUTES[`PROJECT_${tab.id.toUpperCase()}` as keyof typeof ROUTES] instanceof Function
                ? (ROUTES[`PROJECT_${tab.id.toUpperCase()}` as keyof typeof ROUTES] as (id: string) => string)(id)
                : `${id}/${tab.id}`
              }
              className={({ isActive }) => cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 border-transparent text-content-secondary hover:text-content-primary transition-all whitespace-nowrap',
                isActive && 'border-content-primary text-content-primary font-bold'
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col bg-surface-primary overflow-hidden">
        <Outlet context={{ project, setProject }} />
      </div>

      <ProjectDialog
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSave={() => { setProject(ProjectStorage.getById(id)); refreshProjects(); setEditOpen(false); }}
      />

      {blueprintOpen && (
        <SaveBlueprintDialog
          projectId={project.id}
          projectName={project.name}
          onClose={() => setBlueprintOpen(false)}
        />
      )}
    </div>
  );
}
