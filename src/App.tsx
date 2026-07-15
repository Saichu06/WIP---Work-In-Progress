import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';
import { ProjectLayout } from '@/layouts/ProjectLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';

// Public pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// App pages
import { HomeDashboard } from '@/pages/HomeDashboard';
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

// Wrapper to thread outlet context into HomeDashboard
function HomeDashboardWrapper() {
  const { onCreateProject } = useOutletContext<{ onCreateProject: () => void }>();
  return <HomeDashboard onCreateProject={onCreateProject} />;
}

// Private app shell with sidebar
function PrivateAppShell() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Routes>

              {/* ── Public routes ── */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* ── Private app shell ── */}
              <Route element={<PrivateAppShell />}>
                <Route path="home" element={<HomeDashboardWrapper />} />
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

                {/* Catch-all inside app → redirect to home */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Route>

            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
