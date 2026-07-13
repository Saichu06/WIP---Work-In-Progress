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
    <div className="p-8 max-w-2xl mx-auto animate-in">
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
          <div className="mt-5 flex justify-end">
            <button onClick={handleSave} className="btn-primary">
              {saved ? '✓ Saved' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <img src="/assets/logo.png" alt="WIP" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="text-sm font-semibold text-content-primary">About WIP</h2>
              <p className="text-xs text-content-muted">Work In Progress — Project Operating System</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-content-secondary">
            <div className="flex justify-between py-2 border-b border-surface-border">
              <span>Version</span><span className="font-medium text-content-primary">0.1.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-border">
              <span>Storage</span><span className="font-medium text-content-primary">Local Storage</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Philosophy</span><span className="font-medium text-content-primary italic">Every project is always a Work In Progress.</span>
            </div>
          </div>
        </div>

        {/* Import / Export */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-1">Import / Export</h2>
          <p className="text-xs text-content-muted mb-5">Back up your entire workspace or restore from a previous export.</p>
          <div className="flex gap-3">
            <button onClick={exportWorkspace} className="btn-secondary flex-1">
              <Download size={15} /> Export Workspace
            </button>
            <label className={cn('btn-secondary flex-1 cursor-pointer', importing && 'opacity-50 cursor-not-allowed')}>
              <Upload size={15} /> {importing ? 'Importing…' : 'Import Workspace'}
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
          </div>
          <p className="text-xs text-content-muted mt-3 flex items-start gap-1.5">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            Importing a workspace will overwrite all current data. Export first to back up.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-100">
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
  );
}
