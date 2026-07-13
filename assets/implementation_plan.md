# WIP — Project Operating System: Implementation Plan

## Overview

Building a complete SaaS-quality **Project Operating System** using React + Vite + TypeScript + Tailwind CSS + shadcn/ui. The app runs entirely on LocalStorage with a service-layer architecture that makes future API migration seamless.

The logo is a yellow "WORK IN PROGRESS" pin-board badge — guiding the visual identity: bold, focused, and energetic with yellow/red accents on a minimal, clean white/neutral base.

---

## Proposed Changes

### Phase 1 — Project Scaffold & Config

#### [NEW] Vite + React + TypeScript project at `c:\Users\Hp\Desktop\WIP\`
- `vite.config.ts`, `tsconfig.json`, `package.json`
- Install: `react`, `react-router-dom`, `tailwindcss`, `shadcn/ui`, `lucide-react`, `@radix-ui/*`, `@hello-pangea/dnd`, `react-syntax-highlighter`, `recharts`, `date-fns`, `cmdk`, `clsx`, `tailwind-merge`

---

### Phase 2 — Types & Constants

#### [NEW] `src/types/index.ts`
All shared TypeScript types: Project, Sprint, Task, Document, Snippet, Asset, ActivityLog, Settings, etc.

#### [NEW] `src/constants/index.ts`
Enums for Status, Priority, Labels, Column IDs, routes, etc.

---

### Phase 3 — Storage Layer (Service Architecture)

All storage services expose `get()`, `create()`, `update()`, `delete()`, `search()`.

#### [NEW] `src/storage/ProjectStorage.ts`
#### [NEW] `src/storage/SprintStorage.ts`
#### [NEW] `src/storage/TaskStorage.ts`
#### [NEW] `src/storage/DocumentStorage.ts`
#### [NEW] `src/storage/SnippetStorage.ts`
#### [NEW] `src/storage/AssetStorage.ts`
#### [NEW] `src/storage/ActivityStorage.ts`
#### [NEW] `src/storage/SettingsStorage.ts`

---

### Phase 4 — Contexts & Hooks

#### [NEW] `src/contexts/AppContext.tsx` — Global state (projects, active project, search, notifications)
#### [NEW] `src/hooks/useProjects.ts`
#### [NEW] `src/hooks/useTasks.ts`
#### [NEW] `src/hooks/useSprints.ts`
#### [NEW] `src/hooks/useSearch.ts`
#### [NEW] `src/hooks/useActivity.ts`

---

### Phase 5 — Layouts

#### [NEW] `src/layouts/AppLayout.tsx` — Sidebar + content area
#### [NEW] `src/layouts/ProjectLayout.tsx` — Project tabs + content area

---

### Phase 6 — Core Components

#### Sidebar
- `src/components/sidebar/Sidebar.tsx`
- `src/components/sidebar/SidebarNav.tsx`
- `src/components/sidebar/ProjectList.tsx`

#### Command Palette
- `src/components/command/CommandPalette.tsx` (CTRL+K, powered by cmdk)

#### Common UI
- `src/components/ui/` — Extended shadcn components
- `src/components/common/EmptyState.tsx`
- `src/components/common/Avatar.tsx`
- `src/components/common/PriorityBadge.tsx`
- `src/components/common/StatusBadge.tsx`
- `src/components/common/ActivityFeed.tsx`

---

### Phase 7 — Pages

#### Global Pages
- `src/pages/Dashboard.tsx` — Overview, recent activity, pinned projects
- `src/pages/Search.tsx` — Global search results
- `src/pages/Notifications.tsx`
- `src/pages/Settings.tsx`

#### Project Pages (inside ProjectLayout)
- `src/pages/project/ProjectOverview.tsx`
- `src/pages/project/ProjectPlanning.tsx`
- `src/pages/project/ProjectBacklog.tsx`
- `src/pages/project/ProjectSprints.tsx`
- `src/pages/project/ProjectBoard.tsx` — Kanban with drag-and-drop
- `src/pages/project/ProjectTimeline.tsx`
- `src/pages/project/ProjectDocs.tsx`
- `src/pages/project/ProjectAssets.tsx`
- `src/pages/project/ProjectSnippets.tsx`
- `src/pages/project/ProjectAnalytics.tsx`
- `src/pages/project/ProjectSettings.tsx`

---

### Phase 8 — Routing

#### [NEW] `src/App.tsx`
React Router with nested routes: `/`, `/projects/:id/*` with tab-based sub-routes.

---

## Verification Plan

### Manual Verification
- Create project → navigate all tabs → verify data persists on refresh
- Create sprint → add tasks → drag on Kanban board
- Add documentation → rich text renders
- Add code snippet → syntax highlighting works
- CTRL+K opens command palette
- Sidebar collapses correctly
- Empty states show on all pages with no data

---

## Open Questions

> [!NOTE]
> The logo is a bold yellow "WORK IN PROGRESS" pin badge. The visual identity will be built around: yellow (#FFE58F) accents, red (#F06277) accents, clean white/gray backgrounds, Inter font, bold card-based layout.

> [!IMPORTANT]
> Due to the sheer size of this application, I will build it in organized phases. The entire application will be complete in one execution — no half-finished screens.
