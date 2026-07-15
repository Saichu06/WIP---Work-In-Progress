import type { ProjectTemplate } from '@/types';

export const PROJECT_COLORS = [
  '#FFE58F', '#F06277', '#60A5FA', '#34D399', '#A78BFA',
  '#FB923C', '#38BDF8', '#F472B6', '#4ADE80', '#FACC15',
];

export const PROJECT_ICONS = [
  '📦', '🚀', '⚡', '🎯', '🔥', '💡', '🛠️', '🌐', '📱', '🤖',
  '🎨', '📊', '🔬', '🏗️', '⚙️', '📝', '🎮', '💎', '🌟', '🔐',
];

export const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  testing: 'Testing',
  done: 'Done',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  backlog: '#9CA3AF',
  todo: '#60A5FA',
  'in-progress': '#F59E0B',
  review: '#A78BFA',
  testing: '#38BDF8',
  done: '#22C55E',
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F06277',
  medium: '#F59E0B',
  low: '#22C55E',
};

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const SNIPPET_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'scss', 'sql', 'bash', 'json', 'yaml', 'markdown', 'plaintext',
];

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#9CA3AF' },
  { id: 'todo', title: 'To Do', color: '#60A5FA' },
  { id: 'in-progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'review', title: 'Review', color: '#A78BFA' },
  { id: 'testing', title: 'Testing', color: '#38BDF8' },
  { id: 'done', title: 'Done', color: '#22C55E' },
];

export const DEFAULT_PLANNING_SECTIONS = [
  { title: 'Vision', content: '', order: 0 },
  { title: 'Goals', content: '', order: 1 },
  { title: 'Requirements', content: '', order: 2 },
  { title: 'Architecture Notes', content: '', order: 3 },
  { title: 'Research', content: '', order: 4 },
  { title: 'Ideas', content: '', order: 5 },
  { title: 'Competitor Analysis', content: '', order: 6 },
  { title: 'Future Features', content: '', order: 7 },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'mern-stack',
    name: 'MERN Stack App',
    description: 'Full-stack MongoDB, Express, React, Node.js application with sprints and architecture docs.',
    icon: '🌐',
    color: '#60A5FA',
    category: 'Web Development',
    planningItems: [
      { title: 'Vision', content: '## Vision\nBuild a scalable full-stack web application using the MERN stack.', order: 0 },
      { title: 'Architecture Notes', content: '## Architecture\n- **Frontend**: React + Vite\n- **Backend**: Node.js + Express\n- **Database**: MongoDB\n- **Auth**: JWT', order: 1 },
      { title: 'API Design', content: '## API Endpoints\n- `GET /api/users` - List users\n- `POST /api/auth/login` - Login\n- `POST /api/auth/register` - Register', order: 2 },
    ],
    sprintNames: ['Setup & Architecture', 'Backend API', 'Frontend UI', 'Integration & Testing', 'Deployment'],
    labels: ['frontend', 'backend', 'api', 'database', 'auth', 'ui', 'testing', 'deployment'],
    defaultDocs: [
      { title: 'Project Setup Guide', content: '# Project Setup\n\n## Prerequisites\n- Node.js 18+\n- MongoDB\n- npm or yarn\n\n## Installation\n```bash\nnpm install\nnpm run dev\n```' },
      { title: 'API Documentation', content: '# API Documentation\n\n## Authentication\nAll protected routes require a Bearer token.\n\n## Base URL\n`http://localhost:5000/api`' },
    ],
    sampleTasks: [
      { title: 'Initialize Express server', description: 'Set up Node.js + Express with middleware', status: 'backlog', priority: 'high', labels: ['backend'], storyPoints: 3, acceptanceCriteria: 'Server runs on port 5000', assignee: '', isFavorite: false },
      { title: 'Set up MongoDB connection', description: 'Configure Mongoose and database connection', status: 'backlog', priority: 'high', labels: ['backend', 'database'], storyPoints: 2, acceptanceCriteria: 'DB connects successfully', assignee: '', isFavorite: false },
      { title: 'Create React app with Vite', description: 'Initialize frontend with React + Vite', status: 'backlog', priority: 'high', labels: ['frontend'], storyPoints: 2, acceptanceCriteria: 'App renders without errors', assignee: '', isFavorite: false },
      { title: 'JWT Authentication middleware', description: 'Implement login, register, token validation', status: 'backlog', priority: 'critical', labels: ['backend', 'auth'], storyPoints: 5, acceptanceCriteria: 'Users can register/login with tokens', assignee: '', isFavorite: false },
      { title: 'Responsive dashboard UI', description: 'Build the main dashboard with data tables', status: 'backlog', priority: 'medium', labels: ['frontend', 'ui'], storyPoints: 5, acceptanceCriteria: 'Dashboard renders data from API', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'react-app',
    name: 'React App',
    description: 'Modern React application with TypeScript, component library and testing setup.',
    icon: '⚛️',
    color: '#38BDF8',
    category: 'Web Development',
    planningItems: [
      { title: 'Vision', content: '## Vision\nBuild a fast, modern React application with TypeScript.', order: 0 },
      { title: 'Component Architecture', content: '## Components\n- Atomic design pattern\n- Shared UI library\n- Custom hooks', order: 1 },
    ],
    sprintNames: ['Project Setup', 'Core Components', 'Features', 'Testing & Polish'],
    labels: ['component', 'hook', 'style', 'test', 'performance', 'accessibility'],
    defaultDocs: [
      { title: 'Component Library', content: '# Component Library\n\nAll shared components are in `src/components/ui/`.' },
      { title: 'State Management', content: '# State Management\n\nUsing React Context + useReducer for global state.' },
    ],
    sampleTasks: [
      { title: 'Setup Vite + TypeScript', description: 'Initialize project with Vite and configure TypeScript', status: 'backlog', priority: 'high', labels: ['component'], storyPoints: 1, acceptanceCriteria: 'App builds without TS errors', assignee: '', isFavorite: false },
      { title: 'Design system tokens', description: 'Define colors, spacing, typography constants', status: 'backlog', priority: 'high', labels: ['style'], storyPoints: 3, acceptanceCriteria: 'Token file documented', assignee: '', isFavorite: false },
      { title: 'Button component', description: 'Reusable button with variants and states', status: 'backlog', priority: 'medium', labels: ['component'], storyPoints: 2, acceptanceCriteria: 'All variants render correctly', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'dotnet-api',
    name: '.NET API',
    description: 'ASP.NET Core Web API with Entity Framework, JWT auth and Swagger documentation.',
    icon: '🔷',
    color: '#A78BFA',
    category: 'Backend',
    planningItems: [
      { title: 'Vision', content: '## Vision\nBuild a production-grade REST API using ASP.NET Core.', order: 0 },
      { title: 'Architecture Notes', content: '## Architecture\n- Clean Architecture\n- Repository Pattern\n- CQRS with MediatR', order: 1 },
    ],
    sprintNames: ['Infrastructure', 'Domain Layer', 'Application Layer', 'API Layer', 'Testing'],
    labels: ['controller', 'service', 'repository', 'migration', 'auth', 'swagger', 'test'],
    defaultDocs: [
      { title: 'API Overview', content: '# API Overview\n\n## Tech Stack\n- ASP.NET Core 8\n- Entity Framework Core\n- SQL Server / PostgreSQL\n- Swagger / OpenAPI' },
    ],
    sampleTasks: [
      { title: 'Setup project structure', description: 'Clean Architecture with Domain, Application, Infrastructure, API layers', status: 'backlog', priority: 'high', labels: ['infrastructure'], storyPoints: 3, acceptanceCriteria: 'Solution compiles successfully', assignee: '', isFavorite: false },
      { title: 'Entity Framework setup', description: 'Configure DbContext, migrations, seed data', status: 'backlog', priority: 'high', labels: ['migration'], storyPoints: 3, acceptanceCriteria: 'Database created from migrations', assignee: '', isFavorite: false },
      { title: 'JWT authentication', description: 'Implement JWT token generation and validation', status: 'backlog', priority: 'critical', labels: ['auth'], storyPoints: 5, acceptanceCriteria: 'Protected endpoints reject unauthorized requests', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'ai-startup',
    name: 'AI Startup',
    description: 'AI product development workspace with model research, dataset tracking, and product planning.',
    icon: '🤖',
    color: '#4ADE80',
    category: 'AI / ML',
    planningItems: [
      { title: 'Vision', content: '## Vision\nBuild an AI-powered product that solves a real problem at scale.', order: 0 },
      { title: 'Model Research', content: '## Models Under Review\n- GPT-4 / Claude\n- Open source: LLaMA, Mistral\n- Fine-tuning strategy', order: 1 },
      { title: 'Dataset Strategy', content: '## Data Sources\n- Curated public datasets\n- Synthetic data generation\n- User feedback loops', order: 2 },
      { title: 'Go To Market', content: '## GTM Strategy\n- Target: Developers & Enterprises\n- Pricing: Usage-based\n- Launch: Product Hunt', order: 3 },
    ],
    sprintNames: ['Research & Discovery', 'MVP Prototype', 'Model Integration', 'Product Launch'],
    labels: ['research', 'model', 'dataset', 'ux', 'api', 'eval', 'launch'],
    defaultDocs: [
      { title: 'Research Notes', content: '# Research Notes\n\nDocument your model evaluations, benchmark results, and technical findings here.' },
      { title: 'Product Spec', content: '# Product Specification\n\n## Problem\n\n## Solution\n\n## Target Users\n\n## Success Metrics' },
    ],
    sampleTasks: [
      { title: 'Evaluate LLM providers', description: 'Test OpenAI, Anthropic, Gemini APIs for use case fit', status: 'backlog', priority: 'high', labels: ['research', 'model'], storyPoints: 5, acceptanceCriteria: 'Comparison matrix completed', assignee: '', isFavorite: false },
      { title: 'Design system prompt', description: 'Create and iterate on the core system prompt', status: 'backlog', priority: 'critical', labels: ['model'], storyPoints: 3, acceptanceCriteria: 'Prompt produces consistent outputs', assignee: '', isFavorite: false },
      { title: 'Build MVP interface', description: 'Minimal product UI for early testing', status: 'backlog', priority: 'high', labels: ['ux'], storyPoints: 8, acceptanceCriteria: 'Users can interact with the AI feature', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'React Native or Flutter mobile app workspace with platform-specific planning.',
    icon: '📱',
    color: '#FB923C',
    category: 'Mobile',
    planningItems: [
      { title: 'Vision', content: '## Vision\nBuild a native mobile experience that delights users.', order: 0 },
      { title: 'Platform Strategy', content: '## Platforms\n- iOS (iPhone + iPad)\n- Android\n- Cross-platform: React Native / Flutter', order: 1 },
      { title: 'UX Flow', content: '## User Flows\n- Onboarding\n- Core feature loop\n- Settings & profile', order: 2 },
    ],
    sprintNames: ['Design & Wireframes', 'Core Screens', 'Features', 'QA & App Store'],
    labels: ['ios', 'android', 'ui', 'navigation', 'api', 'performance', 'testing'],
    defaultDocs: [
      { title: 'Screen Map', content: '# Screen Map\n\n- Splash Screen\n- Onboarding\n- Home\n- Profile\n- Settings' },
      { title: 'App Store Checklist', content: '# App Store Submission\n\n- [ ] App icon (1024x1024)\n- [ ] Screenshots (all sizes)\n- [ ] Privacy policy\n- [ ] App description' },
    ],
    sampleTasks: [
      { title: 'Design app icon', description: 'Create icon for iOS and Android in all required sizes', status: 'backlog', priority: 'high', labels: ['ui', 'ios', 'android'], storyPoints: 2, acceptanceCriteria: 'Icon passes store guidelines', assignee: '', isFavorite: false },
      { title: 'Navigation structure', description: 'Implement tab bar and stack navigation', status: 'backlog', priority: 'high', labels: ['navigation'], storyPoints: 3, acceptanceCriteria: 'All routes navigate correctly', assignee: '', isFavorite: false },
      { title: 'Onboarding flow', description: '3-screen onboarding with animations', status: 'backlog', priority: 'medium', labels: ['ui'], storyPoints: 5, acceptanceCriteria: 'Users complete onboarding in <2 min', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'research-project',
    name: 'Research Project',
    description: 'Academic or professional research workspace with literature review, methodology, and findings.',
    icon: '🔬',
    color: '#FACC15',
    category: 'Research',
    planningItems: [
      { title: 'Research Question', content: '## Primary Research Question\n\nWhat is the main question this research aims to answer?', order: 0 },
      { title: 'Literature Review', content: '## Key Papers\n- Author (Year) - Summary\n- Author (Year) - Summary', order: 1 },
      { title: 'Methodology', content: '## Research Method\n- Qualitative / Quantitative\n- Data collection approach\n- Analysis method', order: 2 },
      { title: 'Findings', content: '## Results\nDocument your key findings here.', order: 3 },
    ],
    sprintNames: ['Literature Review', 'Data Collection', 'Analysis', 'Writing & Publication'],
    labels: ['literature', 'data', 'analysis', 'writing', 'review', 'citation'],
    defaultDocs: [
      { title: 'Abstract', content: '# Abstract\n\nWrite a 200-300 word summary of your research here.' },
      { title: 'References', content: '# References\n\nUse APA/MLA/IEEE format for all citations.' },
    ],
    sampleTasks: [
      { title: 'Literature review - Phase 1', description: 'Identify and review 20 key papers', status: 'backlog', priority: 'high', labels: ['literature'], storyPoints: 8, acceptanceCriteria: 'Summary notes for each paper', assignee: '', isFavorite: false },
      { title: 'Design research methodology', description: 'Define data collection and analysis approach', status: 'backlog', priority: 'high', labels: ['data'], storyPoints: 5, acceptanceCriteria: 'Methodology section written', assignee: '', isFavorite: false },
    ],
  },
  {
    id: 'college-project',
    name: 'College Project',
    description: 'Academic semester project with assignment tracking, presentation prep, and team coordination.',
    icon: '🎓',
    color: '#F472B6',
    category: 'Academic',
    planningItems: [
      { title: 'Project Brief', content: '## Project Overview\n- Course:\n- Instructor:\n- Deadline:\n- Team Members:', order: 0 },
      { title: 'Division of Work', content: '## Team Responsibilities\n- Member 1:\n- Member 2:\n- Member 3:', order: 1 },
    ],
    sprintNames: ['Planning & Research', 'Development', 'Testing', 'Report & Presentation'],
    labels: ['research', 'development', 'documentation', 'presentation', 'submission'],
    defaultDocs: [
      { title: 'Project Report', content: '# Project Report\n\n## Introduction\n\n## Objectives\n\n## Methodology\n\n## Results\n\n## Conclusion' },
      { title: 'Presentation Notes', content: '# Presentation Notes\n\n## Slide 1: Introduction\n\n## Slide 2: Problem Statement\n\n## Slide 3: Solution' },
    ],
    sampleTasks: [
      { title: 'Topic selection and approval', description: 'Finalize project topic with instructor', status: 'backlog', priority: 'critical', labels: ['research'], storyPoints: 1, acceptanceCriteria: 'Topic approved by instructor', assignee: '', isFavorite: false },
      { title: 'Create project proposal', description: 'Write and submit project proposal document', status: 'backlog', priority: 'high', labels: ['documentation'], storyPoints: 3, acceptanceCriteria: 'Proposal submitted before deadline', assignee: '', isFavorite: false },
      { title: 'Build project prototype', description: 'Implement core functionality', status: 'backlog', priority: 'high', labels: ['development'], storyPoints: 13, acceptanceCriteria: 'Working demo ready', assignee: '', isFavorite: false },
      { title: 'Prepare presentation slides', description: 'Design and finalize presentation deck', status: 'backlog', priority: 'medium', labels: ['presentation'], storyPoints: 3, acceptanceCriteria: 'Slides reviewed by team', assignee: '', isFavorite: false },
    ],
  },
];

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/home',
  DASHBOARD: '/home', // alias kept for backward compat
  PROJECTS: '/projects',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROJECT: (id: string) => `/projects/${id}`,
  PROJECT_OVERVIEW: (id: string) => `/projects/${id}/overview`,
  PROJECT_PLANNING: (id: string) => `/projects/${id}/planning`,
  PROJECT_BACKLOG: (id: string) => `/projects/${id}/backlog`,
  PROJECT_SPRINTS: (id: string) => `/projects/${id}/sprints`,
  PROJECT_BOARD: (id: string) => `/projects/${id}/board`,
  PROJECT_TIMELINE: (id: string) => `/projects/${id}/timeline`,
  PROJECT_DOCS: (id: string) => `/projects/${id}/docs`,
  PROJECT_ASSETS: (id: string) => `/projects/${id}/assets`,
  PROJECT_SNIPPETS: (id: string) => `/projects/${id}/snippets`,
  PROJECT_ANALYTICS: (id: string) => `/projects/${id}/analytics`,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
};

