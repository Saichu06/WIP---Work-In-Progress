import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project, WorkspaceSettings, AppNotification, UserPreferences } from '@/types';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { SettingsStorage } from '@/storage/SettingsStorage';
import { NotificationStorage } from '@/storage/NotificationStorage';
import { PreferenceStorage } from '@/storage/PreferenceStorage';

interface AppContextValue {
  projects: Project[];
  settings: WorkspaceSettings;
  refreshProjects: () => void;
  refreshSettings: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  // Preferences
  preferences: UserPreferences;
  updatePreferences: (data: Partial<UserPreferences>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(SettingsStorage.get());
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(SettingsStorage.get().sidebarCollapsed);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(PreferenceStorage.get());

  const refreshProjects = useCallback(() => {
    setProjects(ProjectStorage.get());
  }, []);

  const refreshSettings = useCallback(() => {
    setSettings(SettingsStorage.get());
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(NotificationStorage.get());
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    SettingsStorage.update({ sidebarCollapsed: v });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    NotificationStorage.markRead(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    NotificationStorage.markAllRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const clearNotifications = useCallback(() => {
    NotificationStorage.clear();
    refreshNotifications();
  }, [refreshNotifications]);

  const updatePreferences = useCallback((data: Partial<UserPreferences>) => {
    const updated = PreferenceStorage.update(data);
    setPreferences(updated);
    // Sync accentColor to settings if changed
    if (data.accentColor) {
      SettingsStorage.update({ accentColor: data.accentColor });
    }
  }, []);

  useEffect(() => {
    refreshProjects();
    refreshSettings();
    refreshNotifications();
    setPreferences(PreferenceStorage.get());
  }, [refreshProjects, refreshSettings, refreshNotifications]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      projects, settings, refreshProjects, refreshSettings,
      commandOpen, setCommandOpen,
      searchOpen, setSearchOpen,
      sidebarCollapsed, setSidebarCollapsed,
      notifications, unreadCount,
      refreshNotifications,
      markNotificationRead, markAllNotificationsRead, clearNotifications,
      preferences, updatePreferences,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
