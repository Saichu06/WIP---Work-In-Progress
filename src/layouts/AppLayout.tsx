import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { useApp } from '@/contexts/AppContext';

export function AppLayout() {
  const { refreshProjects } = useApp();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const openCreateProject = () => setProjectDialogOpen(true);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary">
      <Sidebar onCreateProject={openCreateProject} />
      <main className="flex-1 overflow-y-auto min-w-0">
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
