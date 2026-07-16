import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Search,
  ChevronLeft, ChevronRight, Plus, Star, ChevronDown, Compass
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { ROUTES } from '@/constants';
import { cn, truncate } from '@/utils';
import type { Project } from '@/types';
import { SidebarUserCard } from './SidebarUserCard';

interface SidebarProps {
  onCreateProject: () => void;
}

export function Sidebar({ onCreateProject }: SidebarProps) {
  const { projects, refreshProjects, sidebarCollapsed, setSidebarCollapsed, setCommandOpen } = useApp();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const favoriteProjects = projects.filter(p => p.isFavorite);

  const handleFavorite = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    ProjectStorage.toggleFavorite(project.id);
    refreshProjects();
  };

  const handleArchive = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    ProjectStorage.update(project.id, { status: project.status === 'archived' ? 'active' : 'archived' });
    ActivityStorage.log('project_archived', `Project archived`, `"${project.name}" was archived`);
    refreshProjects();
  };

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white border-r border-surface-border flex-shrink-0 transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-surface-border flex-shrink-0', sidebarCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-2.5')}>
        <img src="/assets/logo.png" alt="WIP" className="w-8 h-8 object-contain flex-shrink-0" />
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-content-primary tracking-tight">WIP</span>
            <p className="text-xs text-content-muted leading-none mt-0.5">Work In Progress</p>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <SidebarItem to={ROUTES.DASHBOARD} icon={<LayoutDashboard size={16} />} label="Dashboard" collapsed={sidebarCollapsed} />
        <SidebarItem to={ROUTES.PROJECTS} icon={<FolderOpen size={16} />} label="Projects" collapsed={sidebarCollapsed} />
        <SidebarItem to={ROUTES.BLUEPRINTS} icon={<Compass size={16} />} label="Blueprint Store" collapsed={sidebarCollapsed} />
        <button
          onClick={() => setCommandOpen(true)}
          className={cn('sidebar-link w-full', sidebarCollapsed && 'justify-center px-0')}
          title="Search (Ctrl+K)"
        >
          <Search size={16} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Search</span>}
          {!sidebarCollapsed && <kbd className="ml-auto text-xs text-content-muted bg-surface-secondary border border-surface-border rounded px-1.5 py-0.5">⌘K</kbd>}
        </button>

        {/* Favorites */}
        {!sidebarCollapsed && favoriteProjects.length > 0 && (
          <div className="pt-3">
            <p className="px-3 text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">Favorites</p>
            {favoriteProjects.map(p => (
              <ProjectItem key={p.id} project={p} collapsed={false} onFavorite={handleFavorite} onArchive={handleArchive} />
            ))}
          </div>
        )}

        {/* Projects */}
        {!sidebarCollapsed && (
          <div className="pt-3">
            <button
              className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-content-muted uppercase tracking-wider hover:text-content-primary transition-colors"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              <span>Projects</span>
              <ChevronDown size={12} className={cn('transition-transform', projectsExpanded ? '' : '-rotate-90')} />
            </button>
            {projectsExpanded && (
              <div className="mt-1 space-y-0.5">
                {activeProjects.map(p => (
                  <ProjectItem key={p.id} project={p} collapsed={false} onFavorite={handleFavorite} onArchive={handleArchive} />
                ))}
                <button
                  onClick={onCreateProject}
                  className="sidebar-link w-full text-content-muted hover:text-content-primary"
                >
                  <Plus size={14} />
                  <span className="text-xs">New Project</span>
                </button>
              </div>
            )}
          </div>
        )}

        {sidebarCollapsed && activeProjects.slice(0, 6).map(p => (
          <NavLink
            key={p.id}
            to={ROUTES.PROJECT_OVERVIEW(p.id)}
            title={p.name}
            className={({ isActive }) => cn(
              'flex items-center justify-center w-full h-9 rounded-lg transition-all duration-150 text-lg',
              isActive ? 'bg-surface-secondary' : 'hover:bg-surface-secondary'
            )}
          >
            {p.icon}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 pb-1">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn('sidebar-link w-full', sidebarCollapsed && 'justify-center px-0')}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>

      {/* ── User Card (bottom) ── */}
      <div className="border-t border-surface-border">
        <SidebarUserCard collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon, label, collapsed }: { to: string; icon: React.ReactNode; label: string; collapsed: boolean }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => cn(
        'sidebar-link',
        isActive && 'sidebar-link-active',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? label : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

function ProjectItem({ project, collapsed, onFavorite, onArchive }: {
  project: Project;
  collapsed: boolean;
  onFavorite: (e: React.MouseEvent, p: Project) => void;
  onArchive: (e: React.MouseEvent, p: Project) => void;
}) {
  return (
    <NavLink
      to={ROUTES.PROJECT_OVERVIEW(project.id)}
      className={({ isActive }) => cn(
        'flex items-center gap-2.5 px-3 h-8 rounded-lg text-xs font-medium transition-all group relative',
        isActive ? 'bg-surface-secondary text-content-primary' : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
      )}
    >
      <span className="text-sm flex-shrink-0">{project.icon}</span>
      <span className="flex-1 truncate">{truncate(project.name, 18)}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onFavorite(e, project)}
          className="p-0.5 rounded hover:bg-surface-border transition-colors"
          title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={10} fill={project.isFavorite ? '#F59E0B' : 'none'} className={project.isFavorite ? 'text-amber-500' : 'text-content-muted'} />
        </button>
      </div>
    </NavLink>
  );
}
