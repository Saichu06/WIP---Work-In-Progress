import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, User, Briefcase, Link2, MapPin, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils';
import type { UserProfile } from '@/types';

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'basic' | 'professional' | 'workspace';

export function ProfileEditDialog({ open, onClose }: ProfileEditDialogProps) {
  const { profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(profile?.profileImage);

  const [form, setForm] = useState<Partial<UserProfile>>({
    fullName: '',
    username: '',
    bio: '',
    role: '',
    company: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    workspaceName: '',
    timezone: '',
    language: '',
  });

  // Sync form when profile loads or dialog reopens
  useEffect(() => {
    if (open && profile) {
      setForm({
        fullName: profile.fullName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        role: profile.role || '',
        company: profile.company || '',
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        workspaceName: profile.workspaceName || '',
        timezone: profile.timezone || '',
        language: profile.language || '',
      });
      setImagePreview(profile.profileImage);
      setSaved(false);
    }
  }, [open, profile]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateProfile({ ...form, profileImage: imagePreview });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'workspace', label: 'Workspace' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-surface-border flex flex-col max-h-[90vh] animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="text-base font-semibold text-content-primary">Edit Profile</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 h-auto w-auto rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="px-6 py-4 border-b border-surface-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar
                src={imagePreview}
                name={form.fullName || profile?.fullName}
                size="xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Upload photo"
              >
                <Upload size={16} className="text-white" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-content-muted">JPEG, PNG or WebP · Max 2 MB</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-xs px-3 h-8"
                >
                  <Upload size={12} /> Upload
                </button>
                {imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="btn-danger text-xs px-3 h-8"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border px-6 flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'tab-link text-xs',
                activeTab === tab.id && 'tab-link-active'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                    <input className="input pl-9 text-sm h-9" value={form.fullName} onChange={set('fullName')} placeholder="Sai Charan" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-xs">@</span>
                    <input className="input pl-7 text-sm h-9" value={form.username} onChange={set('username')} placeholder="saicharan" />
                  </div>
                </div>
              </div>
              <div>
                <label className="label text-xs">Bio</label>
                <textarea
                  className="textarea text-sm"
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Language</label>
                  <select className="input text-sm h-9" value={form.language} onChange={set('language')}>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Timezone</label>
                  <select className="input text-sm h-9" value={form.timezone} onChange={set('timezone')}>
                    {((Intl as any).supportedValuesOf?.('timeZone') ?? ['UTC', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney']).map((tz: string) => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'professional' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Role / Title</label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                    <input className="input pl-9 text-sm h-9" value={form.role} onChange={set('role')} placeholder="Software Engineer" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Company</label>
                  <input className="input text-sm h-9" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
                </div>
              </div>
              <div>
                <label className="label text-xs">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                  <input className="input pl-9 text-sm h-9" value={form.location} onChange={set('location')} placeholder="Hyderabad, India" />
                </div>
              </div>
              <div>
                <label className="label text-xs">Website</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                  <input className="input pl-9 text-sm h-9" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" />
                </div>
              </div>
              <div>
                <label className="label text-xs">GitHub</label>
                <div className="relative">
                  <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                  <input className="input pl-9 text-sm h-9" value={form.github} onChange={set('github')} placeholder="github.com/username" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">LinkedIn</label>
                  <div className="relative">
                    <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                    <input className="input pl-9 text-sm h-9" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Twitter / X</label>
                  <div className="relative">
                    <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                    <input className="input pl-9 text-sm h-9" value={form.twitter} onChange={set('twitter')} placeholder="@handle" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'workspace' && (
            <>
              <div>
                <label className="label text-xs">Workspace Name</label>
                <input className="input text-sm h-9" value={form.workspaceName} onChange={set('workspaceName')} placeholder="My Workspace" />
                <p className="text-xs text-content-muted mt-1">Displayed in the sidebar and on your profile.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border flex-shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
