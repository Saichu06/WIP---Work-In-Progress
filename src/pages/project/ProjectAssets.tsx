import { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Upload, Image, FileText, Film, Archive, File,
  Download, Trash2, Pin, Search, Grid3X3, List, X
} from 'lucide-react';
import { AssetStorage } from '@/storage/AssetStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatFileSize, formatRelative, getAssetType } from '@/utils';
import type { Project, Asset, AssetType } from '@/types';

const ASSET_ICONS: Record<AssetType, React.ReactNode> = {
  image: <Image size={20} />,
  video: <Film size={20} />,
  pdf: <FileText size={20} />,
  zip: <Archive size={20} />,
  document: <FileText size={20} />,
  other: <File size={20} />,
};

const ASSET_COLORS: Record<AssetType, string> = {
  image: 'text-blue-500 bg-blue-50',
  video: 'text-purple-500 bg-purple-50',
  pdf: 'text-red-500 bg-red-50',
  zip: 'text-amber-500 bg-amber-50',
  document: 'text-emerald-500 bg-emerald-50',
  other: 'text-gray-500 bg-gray-100',
};

export function ProjectAssets() {
  const { project } = useOutletContext<{ project: Project }>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAssets(AssetStorage.getByProject(project.id));
  }, [project.id]);

  const refresh = () => setAssets(AssetStorage.getByProject(project.id));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
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
          resolve();
        };
        reader.readAsDataURL(file);
      });
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
    }
  };

  const handleDownload = (asset: Asset) => {
    const a = document.createElement('a');
    a.href = asset.dataUrl;
    a.download = asset.name;
    a.click();
  };

  const togglePin = (asset: Asset) => {
    AssetStorage.update(asset.id, { isPinned: !asset.isPinned });
    refresh();
  };

  const types: (AssetType | 'all')[] = ['all', 'image', 'video', 'pdf', 'document', 'zip', 'other'];
  const filtered = assets.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pinned = filtered.filter(a => a.isPinned);
  const unpinned = filtered.filter(a => !a.isPinned);

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Assets</h1>
              <p className="page-subtitle">{assets.length} file{assets.length !== 1 ? 's' : ''} · {formatFileSize(assets.reduce((acc, a) => acc + a.size, 0))} total</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
              <Upload size={16} /> Upload Files
            </button>
          </div>

          {/* Drop Zone + Upload */}
          <div
            className={cn(
              'mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-150 cursor-pointer',
              dragging ? 'border-brand-yellow bg-brand-yellow/10' : 'border-surface-border hover:border-gray-300 hover:bg-surface-secondary'
            )}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} className={cn('mx-auto mb-2', dragging ? 'text-brand-yellow-dark' : 'text-content-muted')} />
            <p className="text-sm font-medium text-content-secondary">
              {uploading ? 'Uploading…' : dragging ? 'Drop files to upload' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-content-muted mt-1">Images, videos, PDFs, documents, and more</p>
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input className="input pl-9 h-9 text-sm" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap', typeFilter === t ? 'bg-content-primary text-white' : 'bg-surface-secondary text-content-muted hover:text-content-primary border border-surface-border')}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-surface-secondary border border-surface-border rounded-xl p-1 ml-auto flex-shrink-0">
              <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-white shadow-sm text-content-primary' : 'text-content-muted')}>
                <List size={14} />
              </button>
            </div>
          </div>

          {assets.length === 0 ? (
            <EmptyState
              icon="🖼️"
              title="No assets yet"
              description="Upload images, videos, PDFs, and other files to keep your project assets organized."
              action={<button onClick={() => fileInputRef.current?.click()} className="btn-yellow">Upload First File</button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon="🔍" title="No matching assets" description="Try a different search or filter." />
          ) : (
            <>
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Pinned</p>
                  <AssetGrid assets={pinned} view={view} onSelect={setSelectedAsset} selected={selectedAsset} onDelete={handleDelete} onDownload={handleDownload} onPin={togglePin} />
                </div>
              )}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">All Files</p>}
                  <AssetGrid assets={unpinned} view={view} onSelect={setSelectedAsset} selected={selectedAsset} onDelete={handleDelete} onDownload={handleDownload} onPin={togglePin} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {selectedAsset && (
        <div className="w-80 border-l border-surface-border bg-white flex flex-col flex-shrink-0 animate-slide-in-left">
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <h3 className="text-sm font-semibold text-content-primary">Preview</h3>
            <button onClick={() => setSelectedAsset(null)} className="btn-ghost p-1.5"><X size={14} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Preview */}
            <div className="p-4 border-b border-surface-border bg-surface-secondary">
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.dataUrl} alt={selectedAsset.name} className="w-full rounded-xl object-contain max-h-48" />
              ) : selectedAsset.type === 'video' ? (
                <video src={selectedAsset.dataUrl} controls className="w-full rounded-xl max-h-48" />
              ) : (
                <div className={cn('w-full h-32 rounded-xl flex items-center justify-center text-4xl', ASSET_COLORS[selectedAsset.type])}>
                  {ASSET_ICONS[selectedAsset.type]}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-content-muted mb-1">Filename</p>
                <p className="text-sm font-medium text-content-primary break-all">{selectedAsset.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-content-muted mb-1">Type</p>
                  <p className="text-sm text-content-primary capitalize">{selectedAsset.type}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Size</p>
                  <p className="text-sm text-content-primary">{formatFileSize(selectedAsset.size)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-content-muted mb-1">Uploaded</p>
                <p className="text-sm text-content-primary">{formatRelative(selectedAsset.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-surface-border space-y-2">
            <button onClick={() => handleDownload(selectedAsset)} className="btn-secondary w-full justify-center text-sm">
              <Download size={14} /> Download
            </button>
            <button onClick={() => { togglePin(selectedAsset); setSelectedAsset({ ...selectedAsset, isPinned: !selectedAsset.isPinned }); }} className="btn-ghost w-full justify-center text-sm">
              <Pin size={14} /> {selectedAsset.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button onClick={() => handleDelete(selectedAsset)} className="btn-danger w-full justify-center text-sm">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetGrid({ assets, view, onSelect, selected, onDelete, onDownload, onPin }: {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {assets.map(asset => (
          <div
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={cn('group relative cursor-pointer rounded-xl border overflow-hidden transition-all', selected?.id === asset.id ? 'border-content-primary ring-2 ring-content-primary/20' : 'border-surface-border hover:shadow-md')}
          >
            {asset.type === 'image' ? (
              <img src={asset.dataUrl} alt={asset.name} className="w-full h-28 object-cover" />
            ) : (
              <div className={cn('w-full h-28 flex items-center justify-center', ASSET_COLORS[asset.type])}>
                {ASSET_ICONS[asset.type]}
              </div>
            )}
            <div className="p-2 bg-white border-t border-surface-border">
              <p className="text-xs font-medium text-content-primary truncate">{asset.name}</p>
              <p className="text-xs text-content-muted">{formatFileSize(asset.size)}</p>
            </div>
            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onPin(asset); }} className="w-6 h-6 bg-white/90 rounded-md flex items-center justify-center hover:bg-white shadow-sm">
                <Pin size={10} fill={asset.isPinned ? 'currentColor' : 'none'} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(asset); }} className="w-6 h-6 bg-white/90 rounded-md flex items-center justify-center hover:bg-red-50 text-red-500 shadow-sm">
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assets.map(asset => (
        <div
          key={asset.id}
          onClick={() => onSelect(asset)}
          className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group', selected?.id === asset.id ? 'border-content-primary bg-surface-secondary' : 'border-surface-border bg-white hover:shadow-sm')}
        >
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', ASSET_COLORS[asset.type])}>
            {asset.type === 'image' ? (
              <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover rounded-lg" />
            ) : ASSET_ICONS[asset.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-content-primary truncate">{asset.name}</p>
            <p className="text-xs text-content-muted">{formatFileSize(asset.size)} · {formatRelative(asset.createdAt)}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onDownload(asset); }} className="btn-ghost p-1.5"><Download size={12} /></button>
            <button onClick={e => { e.stopPropagation(); onPin(asset); }} className="btn-ghost p-1.5"><Pin size={12} fill={asset.isPinned ? 'currentColor' : 'none'} /></button>
            <button onClick={e => { e.stopPropagation(); onDelete(asset); }} className="btn-ghost p-1.5 text-red-500"><Trash2 size={12} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
