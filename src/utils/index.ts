import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, fmt = 'MMM dd, yyyy'): string {
  try { return format(parseISO(dateString), fmt); } catch { return dateString; }
}

export function formatRelative(dateString: string): string {
  try { return formatDistanceToNow(parseISO(dateString), { addSuffix: true }); } catch { return dateString; }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function exportWorkspace(): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects: JSON.parse(localStorage.getItem('wip_projects') || '[]'),
    sprints: JSON.parse(localStorage.getItem('wip_sprints') || '[]'),
    tasks: JSON.parse(localStorage.getItem('wip_tasks') || '[]'),
    documents: JSON.parse(localStorage.getItem('wip_documents') || '[]'),
    snippets: JSON.parse(localStorage.getItem('wip_snippets') || '[]'),
    assets: JSON.parse(localStorage.getItem('wip_assets') || '[]'),
    planning: JSON.parse(localStorage.getItem('wip_planning') || '[]'),
    activity: JSON.parse(localStorage.getItem('wip_activity') || '[]'),
    settings: JSON.parse(localStorage.getItem('wip_settings') || '{}'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wip-workspace-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importWorkspace(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.projects) localStorage.setItem('wip_projects', JSON.stringify(data.projects));
        if (data.sprints) localStorage.setItem('wip_sprints', JSON.stringify(data.sprints));
        if (data.tasks) localStorage.setItem('wip_tasks', JSON.stringify(data.tasks));
        if (data.documents) localStorage.setItem('wip_documents', JSON.stringify(data.documents));
        if (data.snippets) localStorage.setItem('wip_snippets', JSON.stringify(data.snippets));
        if (data.assets) localStorage.setItem('wip_assets', JSON.stringify(data.assets));
        if (data.planning) localStorage.setItem('wip_planning', JSON.stringify(data.planning));
        if (data.activity) localStorage.setItem('wip_activity', JSON.stringify(data.activity));
        if (data.settings) localStorage.setItem('wip_settings', JSON.stringify(data.settings));
        resolve();
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function getAssetType(mimeType: string): 'image' | 'video' | 'pdf' | 'zip' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'zip';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  return 'other';
}
