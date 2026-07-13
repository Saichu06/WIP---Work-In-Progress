import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AppLayout } from '@/layouts/AppLayout';
import { ProjectLayout } from '@/layouts/ProjectLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { SearchPage } from '@/pages/Search';
import { Notifications } from '@/pages/Notifications';
import { Settings } from '@/pages/Settings';
import { ProjectOverview } from '@/pages/project/ProjectOverview';
import { ProjectPlanning } from '@/pages/project/ProjectPlanning';
import { ProjectBacklog } from '@/pages/project/ProjectBacklog';
import { ProjectSprints } from '@/pages/project/ProjectSprints';
import { ProjectBoard } from '@/pages/project/ProjectBoard';
import { ProjectTimeline } from '@/pages/project/ProjectTimeline';
import { ProjectDocs } from '@/pages/project/ProjectDocs';
import { ProjectAssets } from '@/pages/project/ProjectAssets';
import { ProjectSnippets } from '@/pages/project/ProjectSnippets';
import { ProjectAnalytics } from '@/pages/project/ProjectAnalytics';
import { ProjectSettings } from '@/pages/project/ProjectSettings';

// Wrapper to pass outlet context into Dashboard
function DashboardWrapper() {
  const { onCreateProject } = useOutletContext<{ onCreateProject: () => void }>();
  return <Dashboard onCreateProject={onCreateProject} />;
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardWrapper />} />
            <Route path="projects" element={<Projects />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />

            <Route path="projects/:id" element={<ProjectLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ProjectOverview />} />
              <Route path="planning" element={<ProjectPlanning />} />
              <Route path="backlog" element={<ProjectBacklog />} />
              <Route path="sprints" element={<ProjectSprints />} />
              <Route path="board" element={<ProjectBoard />} />
              <Route path="timeline" element={<ProjectTimeline />} />
              <Route path="docs" element={<ProjectDocs />} />
              <Route path="assets" element={<ProjectAssets />} />
              <Route path="snippets" element={<ProjectSnippets />} />
              <Route path="analytics" element={<ProjectAnalytics />} />
              <Route path="settings" element={<ProjectSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

