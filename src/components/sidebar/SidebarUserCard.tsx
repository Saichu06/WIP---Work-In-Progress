import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, Palette, Keyboard, Download, HelpCircle, LogOut,
  ChevronDown, Edit3, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/common/Avatar';
import { ProfileEditDialog } from '@/components/common/ProfileEditDialog';
import { exportWorkspace } from '@/utils';
import { cn } from '@/utils';

interface SidebarUserCardProps {
  collapsed: boolean;
}

const SHORTCUTS = [
  { key: '⌘K', label: 'Command palette' },
  { key: '⌘/', label: 'Search' },
  { key: 'G H', label: 'Go to Dashboard' },
  { key: 'G P', label: 'Go to Projects' },
];

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const displayName = profile?.fullName || user?.name || 'User';
  const workspaceName = profile?.workspaceName || user?.workspaceName || 'Workspace';
  const avatarSrc = profile?.profileImage || user?.avatar;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      icon: User, label: 'View Profile',
      action: () => { setMenuOpen(false); navigate('/profile'); }
    },
    {
      icon: Edit3, label: 'Edit Profile',
      action: () => { setMenuOpen(false); setEditOpen(true); }
    },
    { type: 'separator' as const },
    {
      icon: Settings, label: 'Settings',
      action: () => { setMenuOpen(false); navigate('/settings'); }
    },
    {
      icon: Bell, label: 'Notifications',
      action: () => { setMenuOpen(false); navigate('/notifications'); }
    },
    {
      icon: Palette, label: 'Appearance',
      action: () => { setMenuOpen(false); navigate('/settings?tab=appearance'); }
    },
    {
      icon: Keyboard, label: 'Keyboard Shortcuts',
      action: () => { setMenuOpen(false); setShortcutsOpen(true); }
    },
    { type: 'separator' as const },
    {
      icon: Download, label: 'Export Workspace',
      action: () => { setMenuOpen(false); exportWorkspace(); }
    },
    {
      icon: HelpCircle, label: 'Help',
      action: () => { setMenuOpen(false); window.open('https://github.com', '_blank'); }
    },
    { type: 'separator' as const },
    {
      icon: LogOut, label: 'Sign Out',
      action: handleLogout,
      danger: true,
    },
  ];

  if (collapsed) {
    return (
      <div className="p-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-surface-secondary transition-colors"
          title={displayName}
        >
          <Avatar src={avatarSrc} name={displayName} size="sm" />
        </button>
        {menuOpen && (
          <DropdownMenu
            items={menuItems}
            menuRef={menuRef}
            className="bottom-12 left-2"
          />
        )}
        <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} />
        <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative p-2">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-all duration-150 group',
          menuOpen && 'bg-surface-secondary'
        )}
      >
        <Avatar src={avatarSrc} name={displayName} size="sm" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-content-primary truncate leading-tight">{displayName}</p>
          <p className="text-[10px] text-content-muted truncate leading-tight mt-0.5">{workspaceName}</p>
        </div>
        <ChevronDown
          size={13}
          className={cn(
            'text-content-muted flex-shrink-0 transition-transform duration-200',
            menuOpen && 'rotate-180'
          )}
        />
      </button>

      {menuOpen && (
        <DropdownMenu
          items={menuItems}
          menuRef={undefined}
          className="bottom-full mb-1 left-0 right-0"
        />
      )}

      <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

/* ─── Dropdown ─── */

interface MenuItem {
  type?: 'separator';
  icon?: React.ElementType;
  label?: string;
  action?: () => void;
  danger?: boolean;
}

function DropdownMenu({
  items, menuRef, className,
}: {
  items: MenuItem[];
  menuRef: React.RefObject<HTMLDivElement> | undefined;
  className?: string;
}) {
  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 w-56 bg-white border border-surface-border rounded-xl shadow-lg py-1 overflow-hidden',
        className
      )}
      style={{ animation: 'dropdownIn 0.12s ease-out both' }}
    >
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div key={i} className="my-1 border-t border-surface-border" />;
        }
        const Icon = item.icon!;
        return (
          <button
            key={i}
            onClick={item.action}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-surface-secondary',
              item.danger ? 'text-red-600 hover:bg-red-50' : 'text-content-secondary hover:text-content-primary'
            )}
          >
            <Icon size={13} className="flex-shrink-0" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Shortcuts Modal ─── */

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const groups = [
    {
      label: 'Navigation',
      items: [
        { key: '⌘K', desc: 'Open command palette' },
        { key: 'G H', desc: 'Go to Dashboard' },
        { key: 'G P', desc: 'Go to Projects' },
        { key: 'G S', desc: 'Go to Settings' },
      ]
    },
    {
      label: 'Actions',
      items: [
        { key: 'N P', desc: 'New Project' },
        { key: 'N T', desc: 'New Task' },
        { key: '?', desc: 'Show shortcuts' },
        { key: 'Esc', desc: 'Close dialog' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-surface-border p-5 animate-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Keyboard size={15} /> Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 h-auto w-auto rounded-lg">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {groups.map(g => (
            <div key={g.label}>
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2">{g.label}</p>
              <div className="space-y-1">
                {g.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <span className="text-xs text-content-secondary">{item.desc}</span>
                    <kbd className="text-[10px] font-mono bg-surface-secondary border border-surface-border px-1.5 py-0.5 rounded text-content-muted">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
