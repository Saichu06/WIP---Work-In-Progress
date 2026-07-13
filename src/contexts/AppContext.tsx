import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project, WorkspaceSettings } from '@/types';
import { ProjectStorage } from '@/storage/ProjectStorage';
import { SettingsStorage } from '@/storage/SettingsStorage';

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
  notifications: Notification[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(SettingsStorage.get());
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(SettingsStorage.get().sidebarCollapsed);
  const [notifications] = useState<Notification[]>([]);

  const refreshProjects = useCallback(() => {
    setProjects(ProjectStorage.get());
  }, []);

  const refreshSettings = useCallback(() => {
    setSettings(SettingsStorage.get());
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    SettingsStorage.update({ sidebarCollapsed: v });
  }, []);

  useEffect(() => {
    refreshProjects();
    refreshSettings();
  }, [refreshProjects, refreshSettings]);

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

  return (
    <AppContext.Provider value={{
      projects, settings, refreshProjects, refreshSettings,
      commandOpen, setCommandOpen,
      searchOpen, setSearchOpen,
      sidebarCollapsed, setSidebarCollapsed,
      notifications,
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
