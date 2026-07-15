export type ProjectStatus = 'active' | 'archived' | 'completed' | 'on-hold';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'testing' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type SprintStatus = 'planning' | 'active' | 'completed';
export type DocType = 'document' | 'folder';
export type AssetType = 'image' | 'video' | 'pdf' | 'zip' | 'document' | 'other';
export type SnippetLanguage =
  | 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go'
  | 'rust' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'html' | 'css' | 'scss'
  | 'sql' | 'bash' | 'json' | 'yaml' | 'markdown' | 'plaintext';

export type ActivityType =
  | 'project_created' | 'project_updated' | 'project_archived' | 'project_deleted'
  | 'sprint_created' | 'sprint_started' | 'sprint_completed'
  | 'task_created' | 'task_updated' | 'task_completed' | 'task_moved'
  | 'doc_created' | 'doc_updated' | 'doc_deleted'
  | 'snippet_created' | 'snippet_updated' | 'snippet_deleted'
  | 'asset_uploaded' | 'asset_deleted'
  | 'planning_updated' | 'settings_updated';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  progress: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  notes: string;
  status: SprintStatus;
  capacity: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivityLog {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  taskId: string;
  relationship: 'blocks' | 'blocked-by' | 'related' | 'duplicate' | 'parent' | 'child';
}

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  taskId: string; // e.g., WIP-001
  position: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  storyPoints: number;
  acceptanceCriteria: string;
  comments: TaskComment[];
  assignee: string;
  isFavorite: boolean;
  dueDate?: string;
  archivedAt?: string; // null means active
  estimatedTime?: number;
  actualTime?: number;
  epicId?: string;
  storyId?: string;
  version: number;
  watchers: string[];
  checklist: ChecklistItem[];
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  activities: TaskActivityLog[];
  dependencies: TaskDependency[];
  createdAt: string;
  updatedAt: string;
}


export interface Document {
  id: string;
  projectId: string;
  parentId?: string;
  type: DocType;
  title: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Snippet {
  id: string;
  projectId: string;
  title: string;
  description: string;
  language: SnippetLanguage;
  code: string;
  tags: string[];
  isFavorite: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: AssetType;
  size: number;
  dataUrl: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  type: ActivityType;
  title: string;
  description: string;
  entityId?: string;
  createdAt: string;
}

export interface PlanningSection {
  id: string;
  projectId: string;
  title: string;
  content: string;
  order: number;
  updatedAt: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  accentColor: string;
  defaultTemplate: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  exportedAt?: string;
}

export interface BoardPreferences {
  compact: boolean;
  showLabels: boolean;
  showStoryPoints: boolean;
  showDueDates: boolean;
  showChecklist: boolean;
  cardSize: 'sm' | 'md' | 'lg';
}

export interface UndoAction {
  id: string;
  type: 'archive' | 'delete' | 'restore' | 'move' | 'duplicate';
  payload: any;
  expiresAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  planningItems: Omit<PlanningSection, 'id' | 'projectId' | 'updatedAt'>[];
  sprintNames: string[];
  labels: string[];
  defaultDocs: { title: string; content: string }[];
  sampleTasks: Omit<Task, 'id' | 'projectId' | 'sprintId' | 'createdAt' | 'updatedAt' | 'comments' | 'taskId' | 'position' | 'version' | 'watchers' | 'checklist' | 'subtasks' | 'attachments' | 'activities' | 'dependencies'>[];
}

export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'document' | 'snippet' | 'asset' | 'sprint' | 'planning';
  title: string;
  subtitle?: string;
  projectId?: string;
  projectName?: string;
  url: string;
}

export type BlueprintCategory =
  | 'Development'
  | 'AI & ML'
  | 'Startup'
  | 'Enterprise'
  | 'Design'
  | 'Education'
  | 'Personal'
  | 'Open Source'
  | 'Custom';

export interface Blueprint extends ProjectTemplate {
  category: BlueprintCategory;
  setupTime: string;    // e.g. "~5 min"
  audience: string;     // e.g. "Solo devs, small teams"
  features: string[];   // Feature bullets shown in preview
  defaultSnippets?: { title: string; language: string; code: string; description: string; tags: string[] }[];
  isCustom?: boolean;
  createdAt?: string;
}
