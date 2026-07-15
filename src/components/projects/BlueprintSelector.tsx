import { useState, useMemo } from 'react';
import { Search, Check, Clock, Users, Sparkles, Star, ChevronRight, Layers } from 'lucide-react';
import { BLUEPRINT_CATEGORIES } from '@/constants/blueprints';
import { BlueprintStorage } from '@/storage/BlueprintStorage';
import { cn } from '@/utils';
import type { Blueprint, BlueprintCategory } from '@/types';

interface BlueprintSelectorProps {
  selected: Blueprint | null;
  onSelect: (blueprint: Blueprint) => void;
}

function BlueprintPreview({ blueprint }: { blueprint: Blueprint }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
          style={{ backgroundColor: `${blueprint.color}20`, border: `1.5px solid ${blueprint.color}40` }}
        >
          {blueprint.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-content-primary">{blueprint.name}</h3>
          <span className="text-xs text-content-muted">{blueprint.category}</span>
        </div>
      </div>

      <p className="text-sm text-content-secondary leading-relaxed">{blueprint.description}</p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs text-content-secondary">
          <Clock size={11} /> {blueprint.setupTime}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs text-content-secondary">
          <Users size={11} /> {blueprint.audience}
        </div>
        {blueprint.isCustom && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <Star size={11} /> Custom
          </div>
        )}
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">What's included</p>
        <ul className="space-y-1.5">
          {blueprint.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-content-secondary">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${blueprint.color}20` }}>
                <Check size={9} style={{ color: blueprint.color }} />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Project Structure */}
      {(blueprint.sprintNames.length > 0 || blueprint.sampleTasks.length > 0) && (
        <div>
          <p className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">Project structure</p>
          <div className="bg-surface-secondary rounded-xl border border-surface-border p-3 space-y-1.5 text-xs text-content-secondary font-mono">
            <div className="flex items-center gap-1.5 text-content-primary font-semibold">
              <Layers size={11} /> {blueprint.name}
            </div>
            {blueprint.sprintNames.slice(0, 5).map((s, i) => (
              <div key={i} className="ml-4 flex items-center gap-1.5">
                <ChevronRight size={9} className="text-content-muted" /> Sprint: {s}
              </div>
            ))}
            {blueprint.sampleTasks.length > 0 && (
              <div className="ml-4 flex items-center gap-1.5 text-content-muted">
                <ChevronRight size={9} /> {blueprint.sampleTasks.length} pre-built tasks
              </div>
            )}
            {blueprint.defaultDocs.length > 0 && (
              <div className="ml-4 flex items-center gap-1.5 text-content-muted">
                <ChevronRight size={9} /> {blueprint.defaultDocs.length} documentation pages
              </div>
            )}
            {blueprint.defaultSnippets && blueprint.defaultSnippets.length > 0 && (
              <div className="ml-4 flex items-center gap-1.5 text-content-muted">
                <ChevronRight size={9} /> {blueprint.defaultSnippets.length} code snippets
              </div>
            )}
          </div>
        </div>
      )}

      {/* Labels */}
      {blueprint.labels.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">Labels</p>
          <div className="flex flex-wrap gap-1.5">
            {blueprint.labels.slice(0, 12).map(l => (
              <span key={l} className="px-2 py-0.5 rounded-md bg-surface-secondary border border-surface-border text-[10px] text-content-secondary capitalize">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlueprintSelector({ selected, onSelect }: BlueprintSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<typeof BLUEPRINT_CATEGORIES[number]>('All');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<Blueprint | null>(null);

  const allBlueprints = useMemo(() => BlueprintStorage.getAll(), []);

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? allBlueprints :
               activeCategory === 'Custom' ? allBlueprints.filter(b => b.isCustom) :
               allBlueprints.filter(b => b.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.features.some(f => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search, allBlueprints]);

  const preview = hovered || selected;

  return (
    <div className="flex h-full min-h-0">
      {/* Left sidebar: categories */}
      <div className="w-44 flex-shrink-0 border-r border-surface-border flex flex-col py-3">
        <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest px-4 mb-2">Categories</p>
        <div className="flex-1 overflow-y-auto">
          {BLUEPRINT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'w-full text-left px-4 py-2 text-xs font-medium transition-all',
                activeCategory === cat
                  ? 'bg-surface-secondary text-content-primary border-r-2 border-content-primary'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary/50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Center: blueprint grid */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-surface-border">
        {/* Search */}
        <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              className="input pl-8 text-xs h-8"
              placeholder="Search blueprints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-sm text-content-muted">
              No blueprints found
            </div>
          ) : filtered.map(bp => (
            <button
              key={bp.id}
              onClick={() => onSelect(bp)}
              onMouseEnter={() => setHovered(bp)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'text-left p-3 rounded-xl border-2 transition-all duration-150 flex flex-col gap-1.5',
                selected?.id === bp.id
                  ? 'border-content-primary bg-surface-secondary shadow-sm'
                  : 'border-surface-border hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{bp.icon}</span>
                {selected?.id === bp.id && (
                  <div className="w-4 h-4 rounded-full bg-content-primary flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
                {bp.isCustom && <Star size={10} className="text-amber-500" />}
              </div>
              <div className="font-semibold text-xs text-content-primary leading-tight">{bp.name}</div>
              <div className="text-[10px] text-content-muted flex items-center gap-1">
                <Clock size={9} /> {bp.setupTime}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: preview pane */}
      <div className="w-72 flex-shrink-0 flex flex-col min-h-0">
        {preview ? (
          <BlueprintPreview blueprint={preview} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
              <Sparkles size={20} className="text-content-muted" />
            </div>
            <p className="text-sm font-medium text-content-primary">Select a Blueprint</p>
            <p className="text-xs text-content-muted">Hover or click a blueprint to preview its structure and features.</p>
          </div>
        )}
      </div>
    </div>
  );
}
