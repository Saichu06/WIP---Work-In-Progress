import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Search, Check, Clock, Users, Sparkles, Star, ChevronRight, Layers,
  Compass, Eye, Code2, FileText, Package, AlertCircle, Plus, LayoutGrid,
  Bot, Settings, ArrowRight, ShieldAlert, GitFork, ArrowUpRight, FolderTree
} from 'lucide-react';
import { BlueprintStorage } from '@/storage/BlueprintStorage';
import { BLUEPRINT_CATEGORIES } from '@/constants/blueprints';
import { cn } from '@/utils';
import type { Blueprint, BlueprintCategory } from '@/types';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { useApp } from '@/contexts/AppContext';

// Simple helper to render difficulty badge styling
function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const styles = {
    beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    intermediate: 'bg-blue-50 text-blue-700 border-blue-100',
    advanced: 'bg-red-50 text-red-700 border-red-100'
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', styles[difficulty])}>
      {difficulty}
    </span>
  );
}

export function BlueprintLibrary() {
  const navigate = useNavigate();
  const { refreshProjects } = useApp();
  const outletContext = useOutletContext<{ onCreateProject?: () => void }>();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedOrigin, setSelectedOrigin] = useState<'All' | 'Official' | 'Custom'>('All');
  
  // Selection states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  // Project Creation Modal state
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createPreSelected, setCreatePreSelected] = useState<Blueprint | null>(null);

  // Preview Panel Active Tab
  const [previewTab, setPreviewTab] = useState<'overview' | 'structure' | 'stack'>('overview');

  // Load lists
  const allBlueprints = useMemo(() => BlueprintStorage.getAll(), []);

  const loadLists = () => {
    setFavorites(BlueprintStorage.getFavorites());
    setRecents(BlueprintStorage.getRecentlyUsed());
  };

  useEffect(() => {
    loadLists();
    // Default select first item
    if (allBlueprints.length > 0) {
      setSelectedId(allBlueprints[0].id);
    }
  }, [allBlueprints]);

  // Handle Favorites toggle
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    BlueprintStorage.toggleFavorite(id);
    loadLists();
  };

  // Main Filter Logic
  const filtered = useMemo(() => {
    let list = allBlueprints;

    // Filter by Category or Virtual lists
    if (activeCategory === 'Featured') {
      list = list.filter(b => b.featured);
    } else if (activeCategory === 'Favorites') {
      list = list.filter(b => favorites.includes(b.id));
    } else if (activeCategory === 'Recently Used') {
      list = list.filter(b => recents.includes(b.id));
    } else if (activeCategory !== 'All') {
      list = list.filter(b => b.category === activeCategory);
    }

    // Filter by Difficulty
    if (selectedDifficulty !== 'All') {
      list = list.filter(b => b.difficulty === selectedDifficulty.toLowerCase());
    }

    // Filter by Origin
    if (selectedOrigin === 'Official') {
      list = list.filter(b => !b.isCustom);
    } else if (selectedOrigin === 'Custom') {
      list = list.filter(b => b.isCustom);
    }

    // Filter by Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q))) ||
        (b.recommendedStack && b.recommendedStack.some(s => s.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [search, activeCategory, selectedDifficulty, selectedOrigin, favorites, recents, allBlueprints]);

  // Selected Blueprint derived
  const selectedBlueprint = useMemo(() => {
    return allBlueprints.find(b => b.id === selectedId) || null;
  }, [selectedId, allBlueprints]);

  // Open creation modal
  const handleStartBuilding = (bp: Blueprint) => {
    setCreatePreSelected(bp);
    setCreateProjectOpen(true);
  };

  return (
    <div className="flex-1 overflow-hidden flex bg-surface-primary animate-in h-screen">
      {/* ── Left Sidebar (Categories & Search) ── */}
      <aside className="w-56 flex-shrink-0 border-r border-surface-border flex flex-col bg-white">
        {/* Search */}
        <div className="p-4 border-b border-surface-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              className="input pl-9 h-9 text-xs"
              placeholder="Search blueprints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Quick Filters */}
          <div>
            <span className="px-3 text-[10px] font-bold text-content-muted uppercase tracking-widest block mb-1.5">Discover</span>
            <div className="space-y-0.5">
              {[
                { id: 'All', label: 'All Blueprints', icon: LayoutGrid },
                { id: 'Featured', label: 'Featured Starters', icon: Sparkles },
                { id: 'Recently Used', label: 'Recently Used', icon: Clock },
                { id: 'Favorites', label: 'Favorites', icon: Star, count: favorites.length },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 h-8.5 rounded-lg text-xs font-medium transition-all text-left',
                    activeCategory === item.id
                      ? 'bg-surface-secondary text-content-primary'
                      : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={13} className={cn(activeCategory === item.id ? 'text-content-primary' : 'text-content-muted')} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] bg-surface-secondary border px-1.5 py-0.5 rounded-full font-bold">{item.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <span className="px-3 text-[10px] font-bold text-content-muted uppercase tracking-widest block mb-1.5">Categories</span>
            <div className="space-y-0.5">
              {BLUEPRINT_CATEGORIES.map(cat => {
                if (cat === 'All' || cat === 'Custom') return null;
                const count = allBlueprints.filter(b => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 h-8 rounded-lg text-xs font-medium transition-all text-left',
                      activeCategory === cat
                        ? 'bg-surface-secondary text-content-primary'
                        : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                    )}
                  >
                    <span>{cat}</span>
                    <span className="text-[9px] text-content-muted font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings / Origin Filters */}
          <div>
            <span className="px-3 text-[10px] font-bold text-content-muted uppercase tracking-widest block mb-1.5">Filters</span>
            <div className="px-3 space-y-3 pt-1">
              {/* Difficulty */}
              <div>
                <label className="text-[10px] font-medium text-content-muted uppercase block mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="input h-8 py-0 px-2 text-[11px] rounded-lg bg-surface-secondary"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Origin */}
              <div>
                <label className="text-[10px] font-medium text-content-muted uppercase block mb-1">Origin</label>
                <select
                  value={selectedOrigin}
                  onChange={e => setSelectedOrigin(e.target.value)}
                  className="input h-8 py-0 px-2 text-[11px] rounded-lg bg-surface-secondary"
                >
                  <option value="All">All Starters</option>
                  <option value="Official">Official Templates</option>
                  <option value="Custom">Custom Templates</option>
                </select>
              </div>
            </div>
          </div>

          {/* Community Placeholder */}
          <div className="pt-2">
            <div className="mx-2 p-3 bg-surface-secondary border border-surface-border rounded-xl text-center">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">Community Library</span>
              <p className="text-[10px] text-content-muted mt-1 leading-relaxed">Share and download project templates. Coming soon!</p>
              <button disabled className="mt-2 w-full h-7 rounded-lg border border-dashed border-surface-border text-[10px] font-semibold cursor-not-allowed text-content-muted">
                Disabled
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Center: Blueprint Cards Responsive Grid ── */}
      <section className="flex-1 min-w-0 flex flex-col border-r border-surface-border overflow-hidden">
        {/* Page Title Header */}
        <div className="p-6 border-b border-surface-border bg-white flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-content-primary flex items-center gap-2">
              <Compass size={18} className="text-content-secondary" /> Blueprint Store
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">Explore premium starters to initialize your workspace instantly.</p>
          </div>
          {outletContext?.onCreateProject && (
            <button onClick={outletContext.onCreateProject} className="btn-secondary h-9 px-3 text-xs">
              <Plus size={13} /> Custom Blueprint
            </button>
          )}
        </div>

        {/* Blueprint Grid Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-secondary/30">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="text-content-muted" size={24} />}
              title="No blueprints found"
              description="Try adjusting your filter options, origin selection, or clear the search query."
              action={<button onClick={() => { setSearch(''); setActiveCategory('All'); setSelectedDifficulty('All'); setSelectedOrigin('All'); }} className="btn-secondary h-9 px-4 text-xs">Clear Filters</button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
              {filtered.map(bp => {
                const isFav = favorites.includes(bp.id);
                const isSelected = selectedId === bp.id;
                return (
                  <div
                    key={bp.id}
                    onClick={() => setSelectedId(bp.id)}
                    className={cn(
                      'card p-4 flex flex-col justify-between hover:shadow-md cursor-pointer transition-all duration-200 border-2 select-none min-h-[160px] relative group',
                      isSelected ? 'border-content-primary bg-white ring-1 ring-content-primary' : 'border-surface-border bg-white hover:border-gray-300'
                    )}
                  >
                    {/* Top row */}
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                          style={{ backgroundColor: `${bp.color}15`, borderColor: `${bp.color}30` }}
                        >
                          {bp.icon}
                        </div>
                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(bp.id, e)}
                          className={cn(
                            'p-1.5 rounded-lg border border-surface-border transition-colors hover:bg-surface-secondary',
                            isFav ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white text-content-muted group-hover:opacity-100 opacity-0'
                          )}
                        >
                          <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Header */}
                      <h3 className="text-xs font-bold text-content-primary leading-tight truncate" title={bp.name}>{bp.name}</h3>
                      <span className="text-[10px] text-content-muted block mt-0.5 font-medium">{bp.category}</span>

                      {/* Description */}
                      <p className="text-[11px] text-content-secondary line-clamp-2 mt-2 leading-relaxed">
                        {bp.description}
                      </p>
                    </div>

                    {/* Footer Chips */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-surface-border">
                      <div className="flex items-center gap-1.5">
                        {bp.difficulty && <DifficultyBadge difficulty={bp.difficulty} />}
                        <span className="text-[9px] text-content-muted font-semibold flex items-center gap-1">
                          <Clock size={10} /> {bp.setupTime}
                        </span>
                      </div>
                      <ChevronRight size={13} className={cn('text-content-muted transition-transform group-hover:translate-x-0.5', isSelected && 'text-content-primary')} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Right Panel: Live Preview & Start Building ── */}
      <aside className="w-96 flex-shrink-0 flex flex-col bg-white border-l border-surface-border overflow-hidden">
        {selectedBlueprint ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header Preview */}
            <div className="p-6 border-b border-surface-border bg-surface-secondary/10 flex-shrink-0">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm border border-surface-border"
                  style={{ backgroundColor: `${selectedBlueprint.color}15` }}
                >
                  {selectedBlueprint.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider">{selectedBlueprint.category}</span>
                    {selectedBlueprint.isCustom && (
                      <span className="text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.2 rounded">Custom</span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-content-primary mt-1 leading-snug">{selectedBlueprint.name}</h2>
                  <p className="text-[10px] text-content-muted mt-0.5">Target: {selectedBlueprint.audience}</p>
                </div>
              </div>

              {/* Start Building Action */}
              <button
                onClick={() => handleStartBuilding(selectedBlueprint)}
                className="btn-yellow w-full mt-5 h-10 text-xs font-semibold flex items-center justify-center gap-2 group shadow-sm active:scale-[0.99] border-2"
                style={{ borderColor: selectedBlueprint.color, color: '#111827' }}
              >
                Use this Blueprint
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-3 border-b border-surface-border text-center py-3 bg-surface-secondary/20 flex-shrink-0">
              <div className="border-r border-surface-border">
                <span className="text-base font-bold text-content-primary block">{selectedBlueprint.generatedTasks || selectedBlueprint.sampleTasks.length || 0}</span>
                <span className="text-[9px] font-medium text-content-muted uppercase block">Tasks</span>
              </div>
              <div className="border-r border-surface-border">
                <span className="text-base font-bold text-content-primary block">{selectedBlueprint.generatedSprints || selectedBlueprint.sprintNames.length || 0}</span>
                <span className="text-[9px] font-medium text-content-muted uppercase block">Sprints</span>
              </div>
              <div>
                <span className="text-base font-bold text-content-primary block">{selectedBlueprint.estimatedDuration || '—'}</span>
                <span className="text-[9px] font-medium text-content-muted uppercase block">Duration</span>
              </div>
            </div>

            {/* Preview Tabs */}
            <div className="flex border-b border-surface-border px-4 bg-white flex-shrink-0">
              {[
                { id: 'overview' as const, label: 'Overview' },
                { id: 'structure' as const, label: 'Structure' },
                { id: 'stack' as const, label: 'Tech Stack' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id)}
                  className={cn(
                    'tab-link py-2 text-xs',
                    previewTab === tab.id && 'tab-link-active'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {previewTab === 'overview' && (
                <>
                  <div>
                    <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1.5">Description</h4>
                    <p className="text-xs text-content-secondary leading-relaxed">{selectedBlueprint.description}</p>
                  </div>

                  {selectedBlueprint.useCases && selectedBlueprint.useCases.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1.5">Primary Use Cases</h4>
                      <ul className="space-y-1.5">
                        {selectedBlueprint.useCases.map((u, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-content-secondary leading-relaxed">
                            <span className="text-content-muted font-bold mt-0.5">•</span>
                            <span>{u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedBlueprint.requirements && selectedBlueprint.requirements.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1.5">Prerequisites</h4>
                      <ul className="space-y-1.5">
                        {selectedBlueprint.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-content-secondary leading-relaxed">
                            <AlertCircle size={11} className="text-content-muted mt-0.5 flex-shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {previewTab === 'structure' && (
                <>
                  {/* Sprints Timeline */}
                  <div>
                    <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Clock size={11} /> Sprints Plan
                    </h4>
                    <div className="space-y-2 border-l-2 border-surface-border ml-2 pl-4">
                      {selectedBlueprint.sprintNames.map((s, i) => (
                        <div key={i} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-surface-border border border-white" />
                          <span className="text-xs font-semibold text-content-primary block leading-none">{s}</span>
                          <span className="text-[10px] text-content-muted mt-0.5 block">Sprint {i + 1} · 2 weeks duration</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Folder Structure */}
                  {selectedBlueprint.folderStructure && (
                    <div>
                      <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                        <FolderTree size={11} /> Suggested Folder Structure
                      </h4>
                      <pre className="bg-surface-secondary/60 border border-surface-border rounded-xl p-3 text-[10px] text-content-secondary font-mono whitespace-pre overflow-x-auto">
                        {selectedBlueprint.folderStructure}
                      </pre>
                    </div>
                  )}

                  {/* Generated Items Summary */}
                  <div>
                    <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Layers size={11} /> Project Items
                    </h4>
                    <div className="bg-surface-secondary border border-surface-border rounded-xl p-3.5 space-y-2.5 text-xs text-content-secondary font-medium">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-content-secondary"><Check size={11} /> Generated Sprints</span>
                        <span className="text-content-primary font-bold">{selectedBlueprint.sprintNames.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-content-secondary"><Check size={11} /> Starter Tasks</span>
                        <span className="text-content-primary font-bold">{selectedBlueprint.sampleTasks.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-content-secondary"><Check size={11} /> Documents</span>
                        <span className="text-content-primary font-bold">{selectedBlueprint.defaultDocs.length}</span>
                      </div>
                      {selectedBlueprint.defaultSnippets && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-content-secondary"><Check size={11} /> Starter Code Snippets</span>
                          <span className="text-content-primary font-bold">{selectedBlueprint.defaultSnippets.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {previewTab === 'stack' && (
                <>
                  {selectedBlueprint.recommendedStack && (
                    <div>
                      <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2">Recommended Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.recommendedStack.map(tech => (
                          <span key={tech} className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-surface-border text-xs font-semibold text-content-primary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBlueprint.defaultSnippets && selectedBlueprint.defaultSnippets.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Code2 size={11} /> Included Code Snippets
                      </h4>
                      <div className="space-y-2">
                        {selectedBlueprint.defaultSnippets.map((s, i) => (
                          <div key={i} className="p-3 bg-surface-secondary/40 border border-surface-border rounded-xl">
                            <span className="text-xs font-semibold text-content-primary block">{s.title}</span>
                            <span className="text-[10px] text-content-muted block mt-0.5 capitalize">{s.language} · {s.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-secondary flex items-center justify-center">
              <Sparkles size={24} className="text-content-muted animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-content-primary">Select a Starter</p>
            <p className="text-xs text-content-muted leading-relaxed">Hover or select a blueprint on the grid to inspect its sprints structure, tasks list, and code snippets.</p>
          </div>
        )}
      </aside>

      {/* ── Project Creation Dialog Modal ── */}
      {createPreSelected && (
        <ProjectDialog
          open={createProjectOpen}
          onClose={() => { setCreateProjectOpen(false); setCreatePreSelected(null); }}
          onSave={() => {
            refreshProjects();
            setCreateProjectOpen(false);
            setCreatePreSelected(null);
            // Navigate to Dashboard/Home
            navigate('/home');
          }}
          project={undefined} // new project
        />
      )}
    </div>
  );
}
