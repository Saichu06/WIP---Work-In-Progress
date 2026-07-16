import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Grid3X3, List, Star, Archive, Search, Filter, FolderOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ROUTES } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { Project } from '@/types';

export function Projects() {
  const { projects, refreshProjects } = useApp();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'favorites'>('active');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();

  const filtered = projects.filter(p => {
    if (filter === 'active') return p.status !== 'archived';
    if (filter === 'archived') return p.status === 'archived';
    if (filter === 'favorites') return p.isFavorite;
    return true;
  }).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleFavorite = (e: React.MouseEvent, p: Project) => {
    e.preventDefault();
    ProjectStorage.toggleFavorite(p.id);
    refreshProjects();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-7xl mx-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.filter(p => p.status !== 'archived').length} active · {projects.filter(p => p.isFavorite).length} favorited</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input className="input pl-9 h-9 text-sm" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 bg-surface-secondary border border-surface-border rounded-xl p-1">
            {(['active', 'favorites', 'archived', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize', filter === f ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted hover:text-content-primary')}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-surface-secondary border border-surface-border rounded-xl p-1">
            <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
              <List size={14} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="text-content-muted" size={24} />}
            title={search ? `No projects match "${search}"` : "Nothing in Progress"}
            description={search ? "Try a different search term." : "Every great product starts as an idea. Create your first project and start building."}
            action={!search ? <button onClick={() => setCreateOpen(true)} className="btn-yellow">Start Building</button> : undefined}
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} onFavorite={handleFavorite} onEdit={setEditProject} onRefresh={refreshProjects} />
            ))}
            <button onClick={() => setCreateOpen(true)} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-border text-content-muted hover:border-gray-300 hover:text-content-secondary transition-all min-h-[160px] cursor-pointer">
              <Plus size={20} />
              <span className="text-sm font-medium">New Project</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <Link key={p.id} to={ROUTES.PROJECT_OVERVIEW(p.id)} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-border hover:shadow-sm transition-all group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: p.color + '33' }}>{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-content-primary">{p.name}</span>
                    <span className={cn('badge text-xs', p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>{p.status}</span>
                  </div>
                  {p.description && <p className="text-xs text-content-muted truncate mt-0.5">{p.description}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-content-muted">Progress</span>
                    <span className="text-sm font-semibold text-content-primary block mt-0.5">{p.progress}%</span>
                  </div>
                  <button onClick={(e) => handleFavorite(e, p)} className="btn-ghost p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={14} fill={p.isFavorite ? '#F59E0B' : 'none'} className={p.isFavorite ? 'text-amber-500' : ''} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        <ProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={() => { refreshProjects(); setCreateOpen(false); }} />
        {editProject && <ProjectDialog open={!!editProject} project={editProject} onClose={() => setEditProject(undefined)} onSave={() => { refreshProjects(); setEditProject(undefined); }} />}
      </div>
    </div>
  );
}

function ProjectCard({ project: p, onFavorite, onEdit, onRefresh }: {
  project: Project;
  onFavorite: (e: React.MouseEvent, p: Project) => void;
  onEdit: (p: Project) => void;
  onRefresh: () => void;
}) {
  return (
    <Link to={ROUTES.PROJECT_OVERVIEW(p.id)} className="card-hover group relative flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: p.color + '33' }}>
          {p.icon}
        </div>
        <button onClick={(e) => onFavorite(e, p)} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star size={13} fill={p.isFavorite ? '#F59E0B' : 'none'} className={p.isFavorite ? 'text-amber-500' : ''} />
        </button>
      </div>
      <h3 className="font-semibold text-content-primary text-sm mb-1 line-clamp-1">{p.name}</h3>
      {p.description && <p className="text-xs text-content-muted line-clamp-2 mb-4 flex-1">{p.description}</p>}
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-content-muted mb-1.5">
          <span>Progress</span>
          <span>{p.progress}%</span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={cn('badge text-xs', p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>{p.status}</span>
          <span className="text-xs text-content-muted">{formatDate(p.updatedAt, 'MMM d')}</span>
        </div>
      </div>
    </Link>
  );
}
