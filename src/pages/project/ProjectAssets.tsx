import { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Upload, Image, FileText, Film, Archive, File,
  Download, Trash2, Pin, Search, Grid3X3, List, X,
  Folder, ChevronRight, ChevronDown, HardDrive
} from 'lucide-react';
import { AssetStorage } from '@/storage/AssetStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatFileSize, formatRelative, getAssetType } from '@/utils';
import type { Project, Asset, AssetType } from '@/types';
import { useToast } from '@/contexts/ToastContext';

const ASSET_ICONS: Record<AssetType, React.ReactNode> = {
  image: <Image size={18} />,
  video: <Film size={18} />,
  pdf: <FileText size={18} />,
  zip: <Archive size={18} />,
  document: <FileText size={18} />,
  other: <File size={18} />,
};

const ASSET_COLORS: Record<AssetType, string> = {
  image: 'text-blue-600 bg-blue-50 border border-blue-100',
  video: 'text-purple-600 bg-purple-50 border border-purple-100',
  pdf: 'text-red-600 bg-red-50 border border-red-100',
  zip: 'text-amber-600 bg-amber-50 border border-amber-100',
  document: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
  other: 'text-gray-600 bg-gray-100 border border-gray-200',
};

export function ProjectAssets() {
  const { project } = useOutletContext<{ project: Project }>();
  const { success, error } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAssets(AssetStorage.getByProject(project.id));
  }, [project.id]);

  const refresh = () => setAssets(AssetStorage.getByProject(project.id));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let count = 0;
    try {
      for (const file of Array.from(files)) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const asset = AssetStorage.create({
              projectId: project.id,
              name: file.name,
              type: getAssetType(file.type),
              size: file.size,
              dataUrl,
              isPinned: false,
              isFavorite: false,
            });
            ActivityStorage.log('asset_uploaded', 'Asset uploaded', `"${file.name}" was uploaded`, project.id, asset.id);
            count++;
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      success('Upload completed', `Successfully uploaded ${count} file(s).`);
    } catch (err) {
      error('Upload failed', 'An error occurred during file upload.');
    }
    setUploading(false);
    refresh();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`Delete "${asset.name}"?`)) {
      AssetStorage.delete(asset.id);
      ActivityStorage.log('asset_deleted', 'Asset deleted', `"${asset.name}" was deleted`, project.id);
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      refresh();
      success('File deleted');
    }
  };

  const handleDownload = (asset: Asset) => {
    const a = document.createElement('a');
    a.href = asset.dataUrl;
    a.download = asset.name.split('/').pop() || asset.name;
    a.click();
  };

  const togglePin = (asset: Asset) => {
    AssetStorage.update(asset.id, { isPinned: !asset.isPinned });
    refresh();
  };

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const types: (AssetType | 'all')[] = ['all', 'image', 'video', 'pdf', 'document', 'zip', 'other'];

  // Apply filters
  const filtered = assets.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pinned = filtered.filter(a => a.isPinned);
  const unpinned = filtered.filter(a => !a.isPinned);

  // Group unpinned into folders and roots
  const folderGroups: Record<string, Asset[]> = {};
  const rootAssets: Asset[] = [];

  unpinned.forEach(a => {
    if (a.name.includes('/')) {
      const parts = a.name.split('/');
      const folderName = parts[0];
      if (!folderGroups[folderName]) folderGroups[folderName] = [];
      folderGroups[folderName].push(a);
    } else {
      rootAssets.push(a);
    }
  });

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden animate-in">
      {/* Main content grid */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface-primary/10">
        {/* Sticky Header Actions */}
        <div className="px-8 pt-6 pb-4 bg-white border-b border-surface-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-bold text-content-primary">Assets Library</h1>
              <p className="text-xs text-content-muted">{assets.length} items total · {formatFileSize(assets.reduce((acc, a) => acc + a.size, 0))} utilized</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary h-9 text-xs">
              <Upload size={14} /> Upload Files
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input className="input pl-8 h-8 text-xs placeholder:text-content-muted" placeholder="Search file name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 overflow-x-auto select-none">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize',
                    typeFilter === t ? 'bg-content-primary text-white border-content-primary' : 'bg-surface-secondary text-content-secondary hover:text-content-primary border-surface-border'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-surface-secondary border border-surface-border rounded-xl p-0.5 ml-auto flex-shrink-0">
              <button onClick={() => setView('grid')} className={cn('p-1 rounded-lg transition-all', view === 'grid' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
                <Grid3X3 size={13} />
              </button>
              <button onClick={() => setView('list')} className={cn('p-1 rounded-lg transition-all', view === 'list' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
                <List size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Assets Listing Area */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
          {/* Drag and Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-150 cursor-pointer select-none',
              dragging ? 'border-brand-yellow bg-brand-yellow/5' : 'border-surface-border hover:border-gray-300 hover:bg-surface-secondary/40'
            )}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className={cn('mx-auto mb-1.5', dragging ? 'text-content-primary' : 'text-content-muted')} />
            <p className="text-xs font-semibold text-content-secondary">
              {uploading ? 'Processing files...' : dragging ? 'Drop to start uploading' : 'Drag files here or click to browse'}
            </p>
            <p className="text-[10px] text-content-muted mt-0.5">Use slashes in names to group (e.g. Design/logo.png)</p>
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

          {assets.length === 0 ? (
            <EmptyState
              icon="🖼️"
              title="No assets uploaded"
              description="Keep your plans, logos, design drafts, and zip releases in a single secure area."
              action={<button onClick={() => fileInputRef.current?.click()} className="btn-yellow">Upload Asset</button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon="🔍" title="No assets found" description="Try a different search query." />
          ) : (
            <div className="space-y-6">
              {/* Pinned Section */}
              {pinned.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Pin size={10} className="rotate-45" /> Pinned Assets
                  </p>
                  <AssetRenderGroup assets={pinned} view={view} onSelect={setSelectedAsset} selected={selectedAsset} onDelete={handleDelete} onDownload={handleDownload} onPin={togglePin} />
                </div>
              )}

              {/* Folders & Roots Group */}
              <div className="space-y-4">
                {/* Folders */}
                {Object.entries(folderGroups).map(([folderName, folderAssets]) => {
                  const isCollapsed = collapsedFolders[folderName] ?? false;
                  return (
                    <div key={folderName} className="border border-surface-border bg-white rounded-2xl overflow-hidden shadow-sm">
                      <div
                        onClick={() => toggleFolder(folderName)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface-secondary/40 border-b border-surface-border cursor-pointer select-none hover:bg-surface-secondary/80 transition-colors"
                      >
                        {isCollapsed ? <ChevronRight size={14} className="text-content-muted" /> : <ChevronDown size={14} className="text-content-muted" />}
                        <Folder size={15} className="text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-content-primary">{folderName}</span>
                        <span className="text-[10px] bg-white border border-surface-border px-1.5 py-0.5 rounded text-content-muted ml-1">
                          {folderAssets.length} file{folderAssets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <div className="p-4 bg-white">
                          <AssetRenderGroup assets={folderAssets} view={view} onSelect={setSelectedAsset} selected={selectedAsset} onDelete={handleDelete} onDownload={handleDownload} onPin={togglePin} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Root Files */}
                {rootAssets.length > 0 && (
                  <div>
                    {(pinned.length > 0 || Object.keys(folderGroups).length > 0) && (
                      <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2">Files</p>
                    )}
                    <AssetRenderGroup assets={rootAssets} view={view} onSelect={setSelectedAsset} selected={selectedAsset} onDelete={handleDelete} onDownload={handleDownload} onPin={togglePin} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Sidebar */}
      {selectedAsset && (
        <div className="w-80 border-l border-surface-border bg-white flex flex-col flex-shrink-0 animate-slide-in-left select-none">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider">Inspect File</h3>
            <button onClick={() => setSelectedAsset(null)} className="btn-ghost p-1 h-7 w-7 rounded-lg flex items-center justify-center"><X size={14} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Visual Container */}
            <div className="rounded-xl overflow-hidden border border-surface-border bg-surface-secondary flex items-center justify-center p-4">
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.dataUrl} alt={selectedAsset.name} className="max-w-full rounded-lg object-contain max-h-40" />
              ) : selectedAsset.type === 'video' ? (
                <video src={selectedAsset.dataUrl} controls className="max-w-full rounded-lg max-h-40" />
              ) : (
                <div className={cn('w-20 h-20 rounded-xl flex items-center justify-center text-3xl', ASSET_COLORS[selectedAsset.type])}>
                  {ASSET_ICONS[selectedAsset.type]}
                </div>
              )}
            </div>

            {/* Attributes */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider block">File Name</span>
                <span className="text-xs font-semibold text-content-primary break-all block mt-0.5">{selectedAsset.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-surface-secondary">
                <div>
                  <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider block">File Type</span>
                  <span className="text-xs font-semibold text-content-primary capitalize block mt-0.5">{selectedAsset.type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider block">File Size</span>
                  <span className="text-xs font-semibold text-content-primary block mt-0.5">{formatFileSize(selectedAsset.size)}</span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-surface-secondary">
                <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider block">Uploaded At</span>
                <span className="text-xs font-semibold text-content-primary block mt-0.5">{formatRelative(selectedAsset.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-4 border-t border-surface-border space-y-2 flex-shrink-0">
            <button onClick={() => handleDownload(selectedAsset)} className="btn-secondary w-full justify-center text-xs h-9">
              <Download size={13} /> Download File
            </button>
            <button onClick={() => { togglePin(selectedAsset); setSelectedAsset({ ...selectedAsset, isPinned: !selectedAsset.isPinned }); }} className="btn-ghost w-full justify-center text-xs h-9">
              <Pin size={13} className="rotate-45" /> {selectedAsset.isPinned ? 'Unpin Asset' : 'Pin Asset'}
            </button>
            <button onClick={() => handleDelete(selectedAsset)} className="btn-danger w-full justify-center text-xs h-9">
              <Trash2 size={13} /> Delete Permanent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetRenderGroup({ assets, view, onSelect, selected, onDelete, onDownload, onPin }: {
  assets: Asset[];
  view: 'grid' | 'list';
  onSelect: (a: Asset) => void;
  selected: Asset | null;
  onDelete: (a: Asset) => void;
  onDownload: (a: Asset) => void;
  onPin: (a: Asset) => void;
}) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map(asset => {
          const isSelected = selected?.id === asset.id;
          return (
            <div
              key={asset.id}
              onClick={() => onSelect(asset)}
              className={cn(
                'group relative cursor-pointer rounded-2xl border overflow-hidden transition-all bg-white shadow-sm hover:shadow-md select-none',
                isSelected ? 'border-content-primary ring-2 ring-content-primary/20' : 'border-surface-border'
              )}
            >
              {asset.type === 'image' ? (
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-28 object-cover" />
              ) : (
                <div className={cn('w-full h-28 flex items-center justify-center', ASSET_COLORS[asset.type])}>
                  {ASSET_ICONS[asset.type]}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs font-semibold text-content-primary truncate">{asset.name.split('/').pop()}</p>
                <p className="text-[10px] text-content-muted mt-0.5">{formatFileSize(asset.size)}</p>
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onPin(asset); }}
                  className="w-6 h-6 bg-white/95 rounded-md flex items-center justify-center hover:bg-white text-content-secondary shadow-sm"
                >
                  <Pin size={10} className="rotate-45" fill={asset.isPinned ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(asset); }}
                  className="w-6 h-6 bg-white/95 rounded-md flex items-center justify-center hover:bg-red-50 text-red-500 shadow-sm"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-border rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-border">
      {assets.map(asset => {
        const isSelected = selected?.id === asset.id;
        return (
          <div
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={cn(
              'flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-surface-secondary/40',
              isSelected && 'bg-surface-secondary/80'
            )}
          >
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', ASSET_COLORS[asset.type])}>
              {asset.type === 'image' ? (
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover rounded-lg" />
              ) : ASSET_ICONS[asset.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-content-primary truncate">{asset.name.split('/').pop()}</p>
              <p className="text-[10px] text-content-muted mt-0.5">{formatFileSize(asset.size)} · {formatRelative(asset.createdAt)}</p>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onDownload(asset); }} className="p-1 hover:bg-surface-border text-content-secondary rounded"><Download size={12} /></button>
              <button onClick={e => { e.stopPropagation(); onPin(asset); }} className={cn('p-1 hover:bg-surface-border rounded', asset.isPinned ? 'text-amber-500' : 'text-content-muted')}><Pin size={12} className="rotate-45" fill={asset.isPinned ? 'currentColor' : 'none'} /></button>
              <button onClick={e => { e.stopPropagation(); onDelete(asset); }} className="p-1 hover:bg-surface-border text-red-500 rounded"><Trash2 size={12} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
