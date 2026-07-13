import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search, FolderOpen, Plus, Zap, FileText, Code2, Settings,
  LayoutDashboard, ArrowRight, Star
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TaskStorage } from '@/storage/TaskStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { SnippetStorage } from '@/storage/SnippetStorage';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';

interface CommandPaletteProps {
  onCreateProject: () => void;
  onCreateTask?: () => void;
}

export function CommandPalette({ onCreateProject, onCreateTask }: CommandPaletteProps) {
  const { commandOpen, setCommandOpen, projects } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const close = useCallback(() => {
    setCommandOpen(false);
    setQuery('');
  }, [setCommandOpen]);

  const go = useCallback((url: string) => {
    navigate(url);
    close();
  }, [navigate, close]);

  useEffect(() => {
    if (!commandOpen) setQuery('');
  }, [commandOpen]);

  const recentProjects = projects.slice(0, 5);
  const favoriteProjects = projects.filter(p => p.isFavorite).slice(0, 3);

  const allTasks = query.length > 1 ? TaskStorage.search(query).slice(0, 5) : [];
  const allDocs = query.length > 1 ? DocumentStorage.search(query).slice(0, 5) : [];
  const allSnippets = query.length > 1 ? SnippetStorage.search(query).slice(0, 5) : [];
  const filteredProjects = query.length > 0 ? projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) : [];

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-xl mx-4 animate-scale-in">
        <Command className="bg-white rounded-2xl shadow-2xl border border-surface-border overflow-hidden">
          <div className="flex items-center gap-3 px-4 border-b border-surface-border">
            <Search size={16} className="text-content-muted flex-shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search everything or type a command..."
              className="flex-1 py-4 text-sm text-content-primary placeholder:text-content-muted outline-none bg-transparent"
            />
            <kbd className="text-xs text-content-muted bg-surface-secondary border border-surface-border rounded px-1.5 py-0.5">ESC</kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-12 text-center text-sm text-content-secondary">
              No results found for "{query}"
            </Command.Empty>

            {/* Quick Actions */}
            {!query && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Quick Actions</span>}>
                <CmdItem icon={<Plus size={14} />} label="Create New Project" shortcut="N" onSelect={() => { onCreateProject(); close(); }} />
                <CmdItem icon={<Zap size={14} />} label="Create New Task" onSelect={() => { onCreateTask?.(); close(); }} />
                <CmdItem icon={<LayoutDashboard size={14} />} label="Go to Dashboard" onSelect={() => go(ROUTES.DASHBOARD)} />
                <CmdItem icon={<Settings size={14} />} label="Open Settings" onSelect={() => go(ROUTES.SETTINGS)} />
                <CmdItem icon={<Search size={14} />} label="Open Universal Search" shortcut="/" onSelect={() => { go(ROUTES.SEARCH); }} />
              </Command.Group>
            )}

            {/* Favorite Projects */}
            {!query && favoriteProjects.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Favorites</span>}>
                {favoriteProjects.map(p => (
                  <CmdItem key={p.id} icon={<span>{p.icon}</span>} label={p.name} subtitle="Project" onSelect={() => go(ROUTES.PROJECT_OVERVIEW(p.id))} />
                ))}
              </Command.Group>
            )}

            {/* Recent Projects */}
            {!query && recentProjects.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Recent Projects</span>}>
                {recentProjects.map(p => (
                  <CmdItem key={p.id} icon={<span>{p.icon}</span>} label={p.name}
                    subtitle={p.status}
                    onSelect={() => go(ROUTES.PROJECT_OVERVIEW(p.id))}
                  />
                ))}
              </Command.Group>
            )}

            {/* Search Results */}
            {query && filteredProjects.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Projects</span>}>
                {filteredProjects.map(p => (
                  <CmdItem key={p.id} icon={<span>{p.icon}</span>} label={p.name} subtitle="Project" onSelect={() => go(ROUTES.PROJECT_OVERVIEW(p.id))} />
                ))}
              </Command.Group>
            )}

            {query && allTasks.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Tasks</span>}>
                {allTasks.map(t => (
                  <CmdItem key={t.id} icon={<ArrowRight size={14} />} label={t.title} subtitle={t.status} onSelect={() => go(ROUTES.PROJECT_BACKLOG(t.projectId))} />
                ))}
              </Command.Group>
            )}

            {query && allDocs.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Documents</span>}>
                {allDocs.map(d => (
                  <CmdItem key={d.id} icon={<FileText size={14} />} label={d.title} subtitle="Document" onSelect={() => go(ROUTES.PROJECT_DOCS(d.projectId))} />
                ))}
              </Command.Group>
            )}

            {query && allSnippets.length > 0 && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Snippets</span>}>
                {allSnippets.map(s => (
                  <CmdItem key={s.id} icon={<Code2 size={14} />} label={s.title} subtitle={s.language} onSelect={() => go(ROUTES.PROJECT_SNIPPETS(s.projectId))} />
                ))}
              </Command.Group>
            )}

            {/* Navigation */}
            {!query && (
              <Command.Group heading={<span className="px-2 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider">Navigate</span>}>
                <CmdItem icon={<FolderOpen size={14} />} label="All Projects" onSelect={() => go(ROUTES.PROJECTS)} />
                <CmdItem icon={<Star size={14} />} label="Notifications" onSelect={() => go(ROUTES.NOTIFICATIONS)} />
              </Command.Group>
            )}
          </Command.List>

          <div className="px-4 py-2 border-t border-surface-border flex items-center gap-4 text-xs text-content-muted">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className="bg-surface-secondary border border-surface-border rounded px-1.5 py-0.5">⌘K</kbd>
              Toggle
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CmdItem({ icon, label, subtitle, shortcut, onSelect }: {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors duration-100',
        'data-[selected=true]:bg-surface-secondary data-[selected=true]:text-content-primary',
        'hover:bg-surface-secondary text-content-primary'
      )}
    >
      <span className="text-content-muted flex-shrink-0">{icon}</span>
      <span className="flex-1 font-medium truncate">{label}</span>
      {subtitle && <span className="text-xs text-content-muted truncate max-w-[100px]">{subtitle}</span>}
      {shortcut && <kbd className="text-xs text-content-muted bg-surface-secondary border border-surface-border rounded px-1.5 py-0.5 ml-auto">{shortcut}</kbd>}
    </Command.Item>
  );
}
