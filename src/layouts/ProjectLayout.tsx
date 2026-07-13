import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, List, Zap, Layout, GitBranch,
  FileText, Image, Code2, BarChart2, Settings, ChevronRight,
  Star, MoreHorizontal, Archive, Copy, Trash2
} from 'lucide-react';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { useApp } from '@/contexts/AppContext';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import type { Project } from '@/types';
import { ProjectDialog } from '@/components/projects/ProjectDialog';

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
    <div className="flex flex-col h-full min-h-screen">
      {/* Project Header */}
      <div className="bg-white border-b border-surface-border flex-shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 px-6 pt-4 text-xs text-content-muted">
          <span>Projects</span>
          <ChevronRight size={12} />
          <span className="text-content-primary font-medium">{project.name}</span>
        </div>

        {/* Project title row */}
        <div className="flex items-center justify-between px-6 pt-2 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: project.color + '33' }}>
              {project.icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-content-primary">{project.name}</h1>
              {project.description && <p className="text-xs text-content-muted">{project.description}</p>}
            </div>
            <span className={cn('badge text-xs ml-2',
              project.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
              project.status === 'archived' ? 'bg-gray-100 text-gray-500' :
              'bg-amber-50 text-amber-600'
            )}>
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-1 relative">
            <button onClick={handleFavorite} className="btn-ghost p-2" title={project.isFavorite ? 'Unfavorite' : 'Favorite'}>
              <Star size={15} fill={project.isFavorite ? '#F59E0B' : 'none'} className={project.isFavorite ? 'text-amber-500' : ''} />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2">
                <MoreHorizontal size={15} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-surface-border shadow-lg z-20 py-1 animate-scale-in">
                    <button onClick={() => { setEditOpen(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary">
                      <Settings size={13} /> Edit Project
                    </button>
                    <button onClick={handleDuplicate} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary">
                      <Copy size={13} /> Duplicate
                    </button>
                    <button onClick={() => { ProjectStorage.update(id, { status: project.status === 'archived' ? 'active' : 'archived' }); setProject(ProjectStorage.getById(id)); refreshProjects(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary">
                      <Archive size={13} /> {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                    </button>
                    <div className="h-px bg-surface-border my-1" />
                    <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 size={13} /> Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-0 px-6 mt-3 overflow-x-auto">
          {tabs.map(tab => (
            <NavLink
              key={tab.id}
              to={ROUTES[`PROJECT_${tab.id.toUpperCase()}` as keyof typeof ROUTES] instanceof Function
                ? (ROUTES[`PROJECT_${tab.id.toUpperCase()}` as keyof typeof ROUTES] as (id: string) => string)(id)
                : `${id}/${tab.id}`
              }
              className={({ isActive }) => cn('tab-link flex items-center gap-1.5', isActive && 'tab-link-active')}
            >
              <tab.icon size={13} />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-surface-primary">
        <Outlet context={{ project, setProject }} />
      </div>

      <ProjectDialog
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSave={() => { setProject(ProjectStorage.getById(id)); refreshProjects(); setEditOpen(false); }}
      />
    </div>
  );
}
