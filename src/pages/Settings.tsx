import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsStorage } from '@/storage/SettingsStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { exportWorkspace, importWorkspace } from '@/utils';
import { Download, Upload, RefreshCw, Info, User, Palette, FolderOpen, Bell, Database, Keyboard, Monitor, Sun, Moon } from 'lucide-react';
import { PROJECT_COLORS } from '@/constants';
import { Avatar } from '@/components/common/Avatar';
import { ProfileEditDialog } from '@/components/common/ProfileEditDialog';
import { cn } from '@/utils';

type Tab = 'general' | 'appearance' | 'workspace' | 'profile' | 'notifications' | 'data' | 'about';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Monitor },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'workspace', label: 'Workspace', icon: FolderOpen },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'general';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { settings, refreshSettings, preferences, updatePreferences } = useApp();
  const { profile, user, updateProfile } = useAuth();

  // Sync tab from URL param
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && TABS.find(t => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // General state
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [generalSaved, setGeneralSaved] = useState(false);

  // Appearance state
  const [accentColor, setAccentColor] = useState(preferences.accentColor);

  // Profile edit
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Import
  const [importing, setImporting] = useState(false);

  const saveGeneral = () => {
    SettingsStorage.update({ dateFormat });
    ActivityStorage.log('settings_updated', 'Settings updated', 'General settings saved');
    refreshSettings();
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2000);
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

  const displayName = profile?.fullName || user?.name || 'User';
  const avatarSrc = profile?.profileImage || user?.avatar;

  return (
    <div className="flex-1 overflow-hidden flex animate-in">
      {/* ── Sidebar Tabs ── */}
      <aside className="w-48 flex-shrink-0 border-r border-surface-border bg-surface-primary p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2">Settings</p>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-surface-secondary text-content-primary'
                  : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
              )}
            >
              <Icon size={14} className="flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">

          {/* ── General ── */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">General</h1>
                <p className="page-subtitle">Basic workspace configuration.</p>
              </div>
              <div className="card space-y-4">
                <div>
                  <label className="label">Date Format</label>
                  <select className="input" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                    <option value="MMM dd, yyyy">MMM dd, yyyy (Jan 01, 2025)</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy (01/01/2025)</option>
                    <option value="MM/dd/yyyy">MM/dd/yyyy (01/01/2025)</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd (2025-01-01)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveGeneral} className="btn-primary text-sm">Save Changes</button>
                  {generalSaved && <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">Appearance</h1>
                <p className="page-subtitle">Customize how WIP looks and feels.</p>
              </div>

              <div className="card space-y-5">
                {/* Theme */}
                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => updatePreferences({ theme: opt.value as any })}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                            preferences.theme === opt.value
                              ? 'border-content-primary bg-surface-secondary text-content-primary'
                              : 'border-surface-border text-content-secondary hover:bg-surface-secondary'
                          )}
                        >
                          <Icon size={14} /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-content-muted mt-1.5">Dark mode CSS coming soon. Setting is saved.</p>
                </div>

                {/* Sidebar Density */}
                <div>
                  <label className="label">Sidebar Density</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['compact', 'comfortable', 'expanded'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => updatePreferences({ sidebarDensity: opt as any })}
                        className={cn(
                          'px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all',
                          preferences.sidebarDensity === opt
                            ? 'border-content-primary bg-surface-secondary text-content-primary'
                            : 'border-surface-border text-content-secondary hover:bg-surface-secondary'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="label">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => updatePreferences({ fontSize: opt as any })}
                        className={cn(
                          'px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all',
                          preferences.fontSize === opt
                            ? 'border-content-primary bg-surface-secondary text-content-primary'
                            : 'border-surface-border text-content-secondary hover:bg-surface-secondary'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="label">Accent Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setAccentColor(c); updatePreferences({ accentColor: c }); }}
                        className={cn('w-7 h-7 rounded-full transition-all hover:scale-110', accentColor === c && 'ring-2 ring-offset-2 ring-content-primary scale-110')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-content-primary">Reduced Motion</p>
                    <p className="text-xs text-content-muted mt-0.5">Disable transition animations</p>
                  </div>
                  <button
                    onClick={() => updatePreferences({ reducedMotion: !preferences.reducedMotion })}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      preferences.reducedMotion ? 'bg-content-primary' : 'bg-gray-200'
                    )}
                  >
                    <span className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      preferences.reducedMotion ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Workspace ── */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">Workspace</h1>
                <p className="page-subtitle">Manage your workspace and data.</p>
              </div>
              <div className="card space-y-4">
                <div>
                  <label className="label">Workspace Name</label>
                  <input
                    className="input"
                    defaultValue={profile?.workspaceName || settings.workspaceName}
                    onBlur={e => {
                      updateProfile({ workspaceName: e.target.value });
                      SettingsStorage.update({ workspaceName: e.target.value });
                      refreshSettings();
                    }}
                    placeholder="My Workspace"
                  />
                  <p className="text-xs text-content-muted mt-1">Changes save automatically when you click away.</p>
                </div>
              </div>
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
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Manage your personal information.</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-4 mb-5">
                  <Avatar src={avatarSrc} name={displayName} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{displayName}</p>
                    <p className="text-xs text-content-muted">{profile?.email || user?.email}</p>
                    {profile?.role && <p className="text-xs text-content-secondary mt-0.5">{profile.role}</p>}
                  </div>
                  <button onClick={() => setProfileEditOpen(true)} className="btn-secondary text-sm ml-auto">
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Username', profile?.username ? `@${profile.username}` : '—'],
                    ['Company', profile?.company || '—'],
                    ['Location', profile?.location || '—'],
                    ['Website', profile?.website || '—'],
                    ['GitHub', profile?.github || '—'],
                    ['LinkedIn', profile?.linkedin || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5 p-3 bg-surface-secondary rounded-xl">
                      <span className="text-content-muted text-[10px] font-semibold uppercase tracking-wide">{k}</span>
                      <span className="text-content-primary font-medium truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">Notifications</h1>
                <p className="page-subtitle">Choose what activities generate notifications.</p>
              </div>
              <div className="card space-y-4">
                <ToggleRow
                  label="Enable notifications"
                  description="Turn all in-app notifications on or off"
                  value={preferences.notificationsEnabled}
                  onChange={v => updatePreferences({ notificationsEnabled: v })}
                />
                <div className="border-t border-surface-border pt-4 space-y-3">
                  <p className="text-xs font-semibold text-content-muted uppercase tracking-wider">Events</p>
                  <ToggleRow label="Task Created" value={preferences.notifyTaskCreated} onChange={v => updatePreferences({ notifyTaskCreated: v })} disabled={!preferences.notificationsEnabled} />
                  <ToggleRow label="Task Completed" value={preferences.notifyTaskCompleted} onChange={v => updatePreferences({ notifyTaskCompleted: v })} disabled={!preferences.notificationsEnabled} />
                  <ToggleRow label="Sprint Started" value={preferences.notifySprintStarted} onChange={v => updatePreferences({ notifySprintStarted: v })} disabled={!preferences.notificationsEnabled} />
                  <ToggleRow label="Blueprint Imported" value={preferences.notifyBlueprintImported} onChange={v => updatePreferences({ notifyBlueprintImported: v })} disabled={!preferences.notificationsEnabled} />
                  <ToggleRow label="Document Updated" value={preferences.notifyDocUpdated} onChange={v => updatePreferences({ notifyDocUpdated: v })} disabled={!preferences.notificationsEnabled} />
                  <ToggleRow label="Asset Uploaded" value={preferences.notifyAssetUploaded} onChange={v => updatePreferences({ notifyAssetUploaded: v })} disabled={!preferences.notificationsEnabled} />
                </div>
              </div>
            </div>
          )}

          {/* ── Data ── */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">Data</h1>
                <p className="page-subtitle">Import, export and manage your workspace data.</p>
              </div>
              <div className="card">
                <h2 className="text-sm font-semibold text-content-primary mb-1">Backup & Restore</h2>
                <p className="text-xs text-content-muted mb-4">Export your workspace data to a JSON backup or restore from a previous backup.</p>
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
          )}

          {/* ── About ── */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h1 className="page-title">About WIP</h1>
                <p className="page-subtitle">Work In Progress — your personal Project Operating System.</p>
              </div>
              <div className="card space-y-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/logo.png" alt="WIP" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-sm font-bold text-content-primary">WIP — Work In Progress</p>
                    <p className="text-xs text-content-muted">A lightweight, SaaS-quality Project Operating System</p>
                  </div>
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">
                  WIP helps teams plan sprints, track backlogs, organize documents, share developer code snippets,
                  and manage files — all persisted locally in your browser. Designed to feel like a premium desktop
                  application with the simplicity of a personal tool.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Storage', 'Browser LocalStorage'],
                    ['Framework', 'React + Vite'],
                    ['Language', 'TypeScript'],
                    ['License', 'MIT'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5 p-3 bg-surface-secondary rounded-xl">
                      <span className="text-content-muted text-[10px] font-semibold uppercase tracking-wide">{k}</span>
                      <span className="text-content-primary font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <ProfileEditDialog open={profileEditOpen} onClose={() => setProfileEditOpen(false)} />
    </div>
  );
}

function ToggleRow({
  label, description, value, onChange, disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', disabled && 'opacity-50')}>
      <div>
        <p className="text-sm font-medium text-content-primary">{label}</p>
        {description && <p className="text-xs text-content-muted mt-0.5">{description}</p>}
      </div>
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
          value ? 'bg-content-primary' : 'bg-gray-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
          value ? 'translate-x-5' : 'translate-x-1'
        )} />
      </button>
    </div>
  );
}
