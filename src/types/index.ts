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

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  storyPoints: number;
  acceptanceCriteria: string;
  comments: Comment[];
  assignee: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
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
  sampleTasks: Omit<Task, 'id' | 'projectId' | 'sprintId' | 'createdAt' | 'updatedAt' | 'comments'>[];
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
