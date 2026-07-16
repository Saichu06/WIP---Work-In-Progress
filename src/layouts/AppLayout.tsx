import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { useApp } from '@/contexts/AppContext';
import { useThemeEffect } from '@/hooks/useThemeEffect';

export function AppLayout() {
  const { refreshProjects } = useApp();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  // Apply theme / font-size / density / motion / accent to <html> whenever preferences change
  useThemeEffect();

  const openCreateProject = () => setProjectDialogOpen(true);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary">
      <Sidebar onCreateProject={openCreateProject} />
      <main className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col">
        <Outlet context={{ onCreateProject: openCreateProject }} />
      </main>

      <CommandPalette onCreateProject={openCreateProject} />

      <ProjectDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onSave={() => { refreshProjects(); setProjectDialogOpen(false); }}
      />
    </div>
  );
}
