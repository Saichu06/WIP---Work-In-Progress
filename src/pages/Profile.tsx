import { useState, useRef, useEffect } from 'react';
import {
  User, Briefcase, MapPin, Globe, Github, Linkedin, Twitter,
  Edit3, Upload, Trash2, BarChart2, Zap, CheckSquare, FolderOpen,
  FileText, Code2, Calendar, Flame, Link2, Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/common/Avatar';
import { ProfileEditDialog } from '@/components/common/ProfileEditDialog';
import { StatisticsStorage } from '@/storage/StatisticsStorage';
import { cn } from '@/utils';
import type { UserStatistics } from '@/types';

export function Profile() {
  const { profile, user, updateProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(StatisticsStorage.recalculate());
  }, []);

  const displayName = profile?.fullName || user?.name || 'User';
  const email = profile?.email || user?.email || '';
  const workspaceName = profile?.workspaceName || user?.workspaceName || 'Workspace';
  const avatarSrc = profile?.profileImage || user?.avatar;

  const memberSince = profile?.createdAt || user?.createdAt
    ? new Date(profile?.createdAt || user?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile({ profileImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const statCards = [
    { icon: FolderOpen, label: 'Projects', value: stats?.projectsCreated ?? 0, color: 'text-blue-600 bg-blue-50' },
    { icon: CheckSquare, label: 'Tasks Done', value: stats?.tasksCompleted ?? 0, color: 'text-emerald-600 bg-emerald-50' },
    { icon: Zap, label: 'Sprints', value: stats?.sprintsCompleted ?? 0, color: 'text-amber-600 bg-amber-50' },
    { icon: FileText, label: 'Documents', value: stats?.documentsCreated ?? 0, color: 'text-purple-600 bg-purple-50' },
    { icon: Code2, label: 'Snippets', value: stats?.snippetsCreated ?? 0, color: 'text-pink-600 bg-pink-50' },
    { icon: BarChart2, label: 'Blueprints', value: stats?.blueprintsUsed ?? 0, color: 'text-indigo-600 bg-indigo-50' },
    { icon: Calendar, label: 'Days Active', value: stats?.daysActive ?? 1, color: 'text-teal-600 bg-teal-50' },
    { icon: Flame, label: 'Streak', value: `${stats?.currentStreak ?? 1}d`, color: 'text-orange-600 bg-orange-50' },
  ];

  const socialLinks = [
    { icon: Globe, label: 'Website', value: profile?.website, href: profile?.website },
    { icon: Github, label: 'GitHub', value: profile?.github, href: profile?.github ? `https://${profile.github.replace(/^https?:\/\//, '')}` : undefined },
    { icon: Linkedin, label: 'LinkedIn', value: profile?.linkedin, href: profile?.linkedin ? `https://${profile.linkedin.replace(/^https?:\/\//, '')}` : undefined },
    { icon: Twitter, label: 'Twitter', value: profile?.twitter },
  ].filter(l => l.value);

  return (
    <div className="flex-1 overflow-y-auto bg-surface-primary animate-in">
      <div className="max-w-3xl mx-auto p-8">

        {/* ── Hero ── */}
        <div className="card mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar with upload overlay */}
            <div className="relative group flex-shrink-0">
              <Avatar src={avatarSrc} name={displayName} size="xl" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Change photo"
              >
                <Upload size={16} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-content-primary">{displayName}</h1>
                  {profile?.username && (
                    <p className="text-sm text-content-muted">@{profile.username}</p>
                  )}
                  {profile?.role && (
                    <p className="text-sm text-content-secondary mt-0.5 flex items-center gap-1.5">
                      <Briefcase size={12} /> {profile.role}{profile.company && ` at ${profile.company}`}
                    </p>
                  )}
                </div>
                <button onClick={() => setEditOpen(true)} className="btn-secondary text-sm flex-shrink-0">
                  <Edit3 size={13} /> Edit Profile
                </button>
              </div>

              {profile?.bio && (
                <p className="text-sm text-content-secondary mt-3 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-content-muted">
                {profile?.location && (
                  <span className="flex items-center gap-1"><MapPin size={11} />{profile.location}</span>
                )}
                <span className="flex items-center gap-1"><Mail size={11} />{email}</span>
                <span className="flex items-center gap-1"><Calendar size={11} />Member since {memberSince}</span>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {socialLinks.map(link => (
                    <a
                      key={link.label}
                      href={link.href || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors border border-surface-border rounded-lg px-2.5 py-1 hover:bg-surface-secondary"
                    >
                      <link.icon size={11} />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Workspace Statistics ── */}
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <BarChart2 size={14} /> Workspace Statistics
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {statCards.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors text-center">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.color)}>
                  <s.icon size={15} />
                </div>
                <span className="text-lg font-bold text-content-primary">{s.value}</span>
                <span className="text-[10px] text-content-muted font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Basic Information ── */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
              <User size={14} /> Basic Information
            </h2>
            <dl className="space-y-3">
              <InfoRow label="Full Name" value={displayName} />
              <InfoRow label="Username" value={profile?.username ? `@${profile.username}` : '—'} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Bio" value={profile?.bio || '—'} />
              <InfoRow label="Language" value={profile?.language || 'English'} />
              <InfoRow label="Timezone" value={profile?.timezone || '—'} />
            </dl>
          </div>

          {/* ── Professional ── */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Briefcase size={14} /> Professional
            </h2>
            <dl className="space-y-3">
              <InfoRow label="Role" value={profile?.role || '—'} />
              <InfoRow label="Company" value={profile?.company || '—'} />
              <InfoRow label="Location" value={profile?.location || '—'} />
              <InfoRow label="Website" value={profile?.website || '—'} link={profile?.website} />
              <InfoRow label="GitHub" value={profile?.github || '—'} link={profile?.github ? `https://${profile.github.replace(/^https?:\/\//, '')}` : undefined} />
              <InfoRow label="LinkedIn" value={profile?.linkedin || '—'} />
              <InfoRow label="Twitter" value={profile?.twitter || '—'} />
            </dl>
          </div>

          {/* ── Workspace ── */}
          <div className="card">
            <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
              <FolderOpen size={14} /> Workspace
            </h2>
            <dl className="space-y-3">
              <InfoRow label="Workspace Name" value={workspaceName} />
              <InfoRow label="Member Since" value={memberSince} />
              <InfoRow label="Projects Created" value={String(stats?.projectsCreated ?? 0)} />
              <InfoRow label="Tasks Completed" value={String(stats?.tasksCompleted ?? 0)} />
              <InfoRow label="Sprints Completed" value={String(stats?.sprintsCompleted ?? 0)} />
              <InfoRow label="Blueprints Used" value={String(stats?.blueprintsUsed ?? 0)} />
              <InfoRow label="Current Streak" value={`${stats?.currentStreak ?? 1} day${(stats?.currentStreak ?? 1) !== 1 ? 's' : ''}`} />
            </dl>
          </div>

          {/* ── Danger Zone ── */}
          <div className="card border-red-200 bg-red-50/20">
            <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
            <p className="text-xs text-content-muted mb-4">These actions are irreversible. Proceed with caution.</p>
            <button
              disabled
              className="btn-danger text-sm opacity-50 cursor-not-allowed"
              title="Coming in a future release"
            >
              Delete Profile
            </button>
            <p className="text-[10px] text-content-muted mt-2">Profile deletion will be available in a future release.</p>
          </div>
        </div>

      </div>
      <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <dt className="text-content-muted w-28 flex-shrink-0 pt-0.5">{label}</dt>
      <dd className="text-content-primary font-medium flex-1">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            <Link2 size={10} /> {value}
          </a>
        ) : (
          value || '—'
        )}
      </dd>
    </div>
  );
}
