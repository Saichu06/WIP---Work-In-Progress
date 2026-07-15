import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SettingsStorage } from '@/storage/SettingsStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { exportWorkspace, importWorkspace } from '@/utils';
import { Download, Upload, RefreshCw, Info } from 'lucide-react';
import { PROJECT_COLORS } from '@/constants';
import { cn } from '@/utils';

export function Settings() {
  const { settings, refreshSettings } = useApp();
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleSave = () => {
    SettingsStorage.update({ workspaceName, accentColor, dateFormat });
    ActivityStorage.log('settings_updated', 'Settings updated', 'Workspace settings were saved');
    refreshSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importWorkspace(file);
      window.location.reload();
    } catch {
      alert('Failed to import workspace. Please check the file format.');
    }
    setImporting(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure your workspace preferences.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Workspace */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-4">Workspace</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Workspace Name</label>
                <input className="input" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="My Workspace" />
              </div>
              <div>
                <label className="label">Date Format</label>
                <select className="input" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                  <option value="MMM dd, yyyy">MMM dd, yyyy (Jan 01, 2025)</option>
                  <option value="dd/MM/yyyy">dd/MM/yyyy (01/01/2025)</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy (01/01/2025)</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd (2025-01-01)</option>
                </select>
              </div>
              <div>
                <label className="label">Accent Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map(c => (
                    <button key={c} onClick={() => setAccentColor(c)} className={cn('w-7 h-7 rounded-full transition-transform hover:scale-110', accentColor === c && 'ring-2 ring-offset-2 ring-content-primary scale-110')} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary text-sm">Save Changes</button>
              {saved && <span className="text-xs text-emerald-600 font-medium">Settings saved!</span>}
            </div>
          </div>

          {/* Backup & Import */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-1">Backup & Restore</h2>
            <p className="text-xs text-content-muted mb-4">Export your workspace data to a JSON backup file or import an existing backup.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportWorkspace} className="btn-secondary text-sm">
                <Download size={14} /> Export Backup
              </button>
              <label className="btn-secondary text-sm cursor-pointer">
                <Upload size={14} /> {importing ? 'Importing...' : 'Restore Backup'}
                <input type="file" onChange={handleImport} accept=".json" className="hidden" disabled={importing} />
              </label>
            </div>
          </div>

          {/* About */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-2 flex items-center gap-1.5">
              <Info size={15} className="text-blue-500" /> About WIP
            </h2>
            <p className="text-xs text-content-secondary leading-relaxed">
              WIP (Work In Progress) is a lightweight, SaaS-quality Project Operating System designed to help teams plan sprints, track backlogs, organize documents, share developer code snippets, and manage files locally in the browser. All data is securely persisted in your browser's LocalStorage.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 bg-red-50/20">
            <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
            <p className="text-xs text-content-muted mb-4">These actions are irreversible. Proceed with caution.</p>
            <button
              onClick={() => {
                if (confirm('This will permanently delete all your workspace data. Are you sure?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn-danger text-sm"
            >
              <RefreshCw size={14} /> Reset Entire Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
