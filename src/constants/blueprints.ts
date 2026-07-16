import type { Blueprint, BlueprintCategory, Task, PlanningSection, SnippetLanguage } from '@/types';

// Raw metadata for all 80+ blueprints
export const BLUEPRINT_METADATA: Omit<Blueprint, 'features' | 'planningItems' | 'sprintNames' | 'labels' | 'defaultDocs' | 'sampleTasks' | 'defaultSnippets'>[] = [
  // ── featured ──
  {
    id: 'startup-mvp',
    name: 'Startup MVP',
    description: 'Minimum Viable Product starter with user auth, database, landing page, and payment integrations.',
    icon: '◈',
    color: '#FFE58F',
    category: 'Startup & Product',
    difficulty: 'advanced',
    setupTime: '~5 min',
    estimatedDuration: '1-3 months',
    audience: 'Founders, Indie Hackers',
    tags: ['SaaS', 'MVP', 'Stripe', 'Auth', 'Database'],
    recommendedStack: ['Next.js', 'Tailwind CSS', 'PostgreSQL', 'Stripe', 'Supabase'],
    useCases: ['Validate business idea', 'Launch landing page & product', 'Collect feedback & payments'],
    requirements: ['Stripe developer account', 'Hosting platform (Vercel/Render)'],
    folderStructure: '/src\n  /components\n  /pages\n  /services\n  /db\n  /hooks',
    featured: true,
    official: true,
    generatedTasks: 40,
    generatedSprints: 4,
    generatedDocs: 3,
    generatedAssets: 0,
    generatedSnippets: 2,
  },
  {
    id: 'mern-stack-app',
    name: 'MERN Stack App',
    description: 'Full-stack MongoDB, Express, React, and Node.js starter template for database-driven applications.',
    icon: '✦',
    color: '#60A5FA',
    category: 'Software Development',
    difficulty: 'intermediate',
    setupTime: '~3 min',
    estimatedDuration: '1-2 months',
    audience: 'Full-stack developers',
    tags: ['MERN', 'Node', 'Express', 'React', 'MongoDB'],
    recommendedStack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Vite'],
    useCases: ['Build dashboard web apps', 'Create REST APIs with frontend', 'Learn fullstack dev'],
    requirements: ['Node.js 18+', 'MongoDB local or Atlas account'],
    folderStructure: '/client\n  /src\n/server\n  /routes\n  /models\n  /controllers',
    featured: true,
    official: true,
    generatedTasks: 35,
    generatedSprints: 4,
    generatedDocs: 2,
    generatedAssets: 0,
    generatedSnippets: 2,
  },
  {
    id: 'nextjs-saas',
    name: 'Next.js SaaS',
    description: 'Production-ready software-as-a-service template with billing, authentication, dashboard, and marketing page.',
    icon: '❖',
    color: '#A78BFA',
    category: 'Startup & Product',
    difficulty: 'advanced',
    setupTime: '~4 min',
    estimatedDuration: '2-3 months',
    audience: 'SaaS founders, Indie hackers',
    tags: ['Next.js', 'SaaS', 'Stripe', 'Tailwind', 'Prisma'],
    recommendedStack: ['Next.js 14 App Router', 'Prisma ORM', 'Stripe', 'Tailwind CSS', 'NextAuth'],
    useCases: ['Launch B2B SaaS', 'Build subscription portal', 'Create dashboard frontend'],
    requirements: ['Node.js 18+', 'PostgreSQL database', 'Stripe Keys'],
    folderStructure: '/app\n  /api\n  /dashboard\n/components\n/lib\n/prisma',
    featured: true,
    official: true,
    generatedTasks: 42,
    generatedSprints: 5,
    generatedDocs: 3,
    generatedAssets: 0,
    generatedSnippets: 3,
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Conversational assistant wrapper with voice processing, prompt engineering templates, and session memory.',
    icon: '⌬',
    color: '#34D399',
    category: 'Artificial Intelligence',
    difficulty: 'intermediate',
    setupTime: '~3 min',
    estimatedDuration: '2-4 weeks',
    audience: 'AI Developers, hobbyists',
    tags: ['LLM', 'AI', 'OpenAI', 'Memory', 'Voice'],
    recommendedStack: ['OpenAI API', 'LangChain', 'React.js', 'Vite', 'Node.js'],
    useCases: ['Build chatbot wrappers', 'Create voice notes transcriber', 'Add AI support helper'],
    requirements: ['OpenAI API Key', 'Node.js 18+'],
    folderStructure: '/src\n  /components\n  /ai-engine\n  /hooks\n  /types',
    featured: true,
    official: true,
    generatedTasks: 30,
    generatedSprints: 3,
    generatedDocs: 2,
    generatedAssets: 0,
    generatedSnippets: 1,
  },
  {
    id: 'llm-application',
    name: 'LLM Application',
    description: 'RAG-ready large language model application with vector search, embeddings processing, and prompt caching.',
    icon: '⬢',
    color: '#F472B6',
    category: 'Artificial Intelligence',
    difficulty: 'advanced',
    setupTime: '~5 min',
    estimatedDuration: '1-3 months',
    audience: 'AI Engineers, researchers',
    tags: ['LLM', 'RAG', 'VectorDB', 'Pinecone', 'Embeddings'],
    recommendedStack: ['Python', 'FastAPI', 'Pinecone', 'LangChain', 'OpenAI / Anthropic'],
    useCases: ['Internal company wiki search', 'Automate docs Q&A', 'Intelligent search engines'],
    requirements: ['Pinecone API Key', 'OpenAI API Key', 'Python 3.10+'],
    folderStructure: '/app\n  /api\n  /vector_store\n  /embeddings\n/tests',
    featured: true,
    official: true,
    generatedTasks: 38,
    generatedSprints: 4,
    generatedDocs: 3,
    generatedAssets: 0,
    generatedSnippets: 2,
  },
  {
    id: 'enterprise-platform',
    name: 'Enterprise Platform',
    description: 'Monorepo architecture with high test coverage, RBAC permissions system, and infrastructure configs.',
    icon: '⬡',
    color: '#FB923C',
    category: 'Software Development',
    difficulty: 'advanced',
    setupTime: '~8 min',
    estimatedDuration: '3-6 months',
    audience: 'Enterprise teams',
    tags: ['Enterprise', 'Monorepo', 'Turborepo', 'RBAC', 'Docker'],
    recommendedStack: ['TypeScript', 'Turborepo', 'Next.js', 'NestJS', 'Docker', 'Kubernetes'],
    useCases: ['Build enterprise multi-service webapps', 'Standardize team developer repository structure'],
    requirements: ['Docker', 'Kubernetes local cluster', 'Node.js 20+'],
    folderStructure: '/apps\n  /web\n  /api\n/packages\n  /ui\n  /config\n  /db',
    featured: true,
    official: true,
    generatedTasks: 45,
    generatedSprints: 6,
    generatedDocs: 4,
    generatedAssets: 0,
    generatedSnippets: 3,
  },
  {
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    description: 'Elegant, high-performance portfolio to showcase developer projects, blog post feeds, and resume details.',
    icon: '⚙',
    color: '#38BDF8',
    category: 'Personal',
    difficulty: 'beginner',
    setupTime: '~2 min',
    estimatedDuration: '1-2 weeks',
    audience: 'All developers, designers',
    tags: ['Portfolio', 'Showcase', 'Blog', 'Static', 'Tailwind'],
    recommendedStack: ['Astro', 'Tailwind CSS', 'Markdown', 'Vercel'],
    useCases: ['Build developer portfolio', 'Host personal resume online', 'Write tech blogs'],
    requirements: ['Basic HTML/CSS knowledge', 'GitHub account'],
    folderStructure: '/src\n  /components\n  /content\n    /blog\n    /projects\n  /pages',
    featured: true,
    official: true,
    generatedTasks: 25,
    generatedSprints: 2,
    generatedDocs: 2,
    generatedAssets: 0,
    generatedSnippets: 1,
  },

  // ── software development ──
  { id: 'blank-project', name: 'Blank Project', description: 'Fresh empty workspace. Setup custom project structures from scratch.', icon: '◈', color: '#9CA3AF', category: 'Software Development', difficulty: 'beginner', setupTime: '< 1 min', estimatedDuration: 'Varies', audience: 'Everyone', tags: ['Custom', 'Clean'], recommendedStack: ['Any'], useCases: ['Start completely from scratch', 'Use own custom structures'], requirements: [] },
  { id: 'react-spa', name: 'React SPA', description: 'Clean single page app setup with client-side routing and state management.', icon: '⚛', color: '#60A5FA', category: 'Software Development', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Frontend developers', tags: ['SPA', 'Vite', 'React', 'Zustand'], recommendedStack: ['React', 'Vite', 'Zustand', 'React Router'], useCases: ['Build lightweight clients', 'Create prototype UI tools'], requirements: ['Node.js 18+'] },
  { id: 'node-backend', name: 'Node.js Backend', description: 'Clean Node.js API server configuration with logging, error handling, and lint rules.', icon: '⚡', color: '#34D399', category: 'Software Development', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Backend developers', tags: ['Node', 'Express', 'API', 'ESLint'], recommendedStack: ['Node.js', 'Express.js', 'Winston Logger', 'Jest'], useCases: ['Build API servers', 'Create microservices'], requirements: ['Node.js 18+'] },
  { id: 'python-rest-api', name: 'Python REST API', description: 'FastAPI python project configured with migrations, schema verification, and database ORM.', icon: '♾', color: '#38BDF8', category: 'Software Development', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '3-6 weeks', audience: 'Python developers', tags: ['Python', 'FastAPI', 'SQLAlchemy', 'Pydantic'], recommendedStack: ['Python 3.10+', 'FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL'], useCases: ['High performance REST API servers', 'Build ML serving endpoints'], requirements: ['Python 3.10+ installed'] },
  { id: 'aspnet-api', name: 'ASP.NET Core API', description: 'Clean architecture API workspace with EF Core, migrations, Swagger, and dependency injection patterns.', icon: '⚿', color: '#818CF8', category: 'Software Development', difficulty: 'intermediate', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: '.NET developers', tags: ['.NET', 'C#', 'WebAPI', 'EFCore'], recommendedStack: ['.NET 8', 'C#', 'Entity Framework Core', 'SQL Server'], useCases: ['Enterprise C# backend systems', 'Robust web services'], requirements: ['.NET SDK 8 installed'] },
  { id: 'spring-boot-api', name: 'Spring Boot API', description: 'Structured Java Spring Boot API workspace with JPA, security filter configs, and Maven dependency structures.', icon: '🝔', color: '#4ADE80', category: 'Software Development', difficulty: 'intermediate', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: 'Java developers', tags: ['Java', 'Spring', 'JPA', 'Maven'], recommendedStack: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL'], useCases: ['Robust enterprise backend services', 'Scale backend architectures'], requirements: ['JDK 17 installed'] },
  { id: 'graphql-api', name: 'GraphQL API', description: 'GraphQL server workspace with auto-generated types, field resolvers, and query loaders.', icon: '⚒', color: '#F472B6', category: 'Software Development', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '1-2 months', audience: 'API developers', tags: ['GraphQL', 'Apollo', 'Schema', 'Node'], recommendedStack: ['Apollo Server', 'GraphQL', 'TypeScript', 'Prisma'], useCases: ['Unified API hub', 'Rapid frontend query integrations'], requirements: ['Node.js 18+'] },
  { id: 'rest-api', name: 'REST API Toolkit', description: 'API collection setup with request throttling, validation filters, API keys, and endpoint docs.', icon: '⚙', color: '#9CA3AF', category: 'Software Development', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'All developers', tags: ['API', 'Endpoints', 'REST', 'Postman'], recommendedStack: ['Express.js', 'Swagger', 'Joi Validation'], useCases: ['Quickly build standard API microservices', 'Serve JSON formats'], requirements: ['Node.js 18+'] },
  { id: 'microservices', name: 'Microservices Platform', description: 'Docker Compose workspace with message broker configs, gateway configs, and multi-service scripts.', icon: '❖', color: '#F87171', category: 'Software Development', difficulty: 'advanced', setupTime: '~10 min', estimatedDuration: '3-6 months', audience: 'DevOps & Systems devs', tags: ['Microservices', 'Docker', 'RabbitMQ', 'Gateway'], recommendedStack: ['Docker Compose', 'RabbitMQ', 'Express Gateway', 'Redis'], useCases: ['Distributed applications architecture', 'Realtime async queues'], requirements: ['Docker and Docker Compose installed'] },
  { id: 'browser-extension', name: 'Browser Extension', description: 'Manifest v3 extension skeleton with background worker scripts, content scripts, and dashboard popups.', icon: '⬧', color: '#FB923C', category: 'Software Development', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Frontend developers', tags: ['Chrome', 'Extension', 'ManifestV3', 'Popup'], recommendedStack: ['React', 'Webpack', 'Manifest v3', 'CSS'], useCases: ['Chrome / Firefox user utility', 'Web screen scraper extension'], requirements: ['Node.js 18+'] },
  { id: 'electron-desktop', name: 'Electron Desktop App', description: 'Cross-platform desktop application environment with main processes, page renderers, and builders.', icon: '◼', color: '#60A5FA', category: 'Software Development', difficulty: 'intermediate', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: 'Frontend developers', tags: ['Electron', 'Desktop', 'React', 'Builder'], recommendedStack: ['Electron', 'React', 'Vite', 'Tailwind CSS'], useCases: ['Cross platform desktop application tool', 'Local file utility application'], requirements: ['Node.js 18+'] },
  { id: 'npm-package', name: 'NPM Package Starter', description: 'Minimal TS compiler setup, lint rules, test configurations, and auto-release pipelines.', icon: '▲', color: '#E11D48', category: 'Software Development', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '1-2 weeks', audience: 'Library developers', tags: ['NPM', 'TypeScript', 'Library', 'Release'], recommendedStack: ['TypeScript', 'Vitest', 'tsup', 'GitHub Actions'], useCases: ['Publish utility libraries to npm', 'Internal package monorepos'], requirements: ['NPM account'] },
  { id: 'react-native-app', name: 'React Native App', description: 'Mobile workspace configured with basic routes, layout assets, and native app configurations.', icon: '◆', color: '#06B6D4', category: 'Software Development', difficulty: 'intermediate', setupTime: '~5 min', estimatedDuration: '2-3 months', audience: 'Mobile developers', tags: ['React Native', 'Expo', 'iOS', 'Android'], recommendedStack: ['Expo SDK', 'React Native', 'TypeScript', 'React Navigation'], useCases: ['Build Android/iOS cross platform apps', 'Prototype mobile apps quickly'], requirements: ['Node.js 18+', 'Expo Go app on phone'] },
  { id: 'flutter-app', name: 'Flutter Mobile App', description: 'Flutter mobile application project initialized with custom theme setups and router configurations.', icon: '●', color: '#0284C7', category: 'Software Development', difficulty: 'intermediate', setupTime: '~5 min', estimatedDuration: '2-3 months', audience: 'Mobile developers', tags: ['Flutter', 'Dart', 'Mobile', 'iOS'], recommendedStack: ['Flutter SDK', 'Dart', 'Provider State', 'GoRouter'], useCases: ['High performance native mobile applications', 'Deploy multiplatform client apps'], requirements: ['Flutter SDK installed'] },
  { id: 'unity-game', name: 'Unity Game Starter', description: 'Unity C# project structure with preset scripts, input actions, asset folder organization, and build pipelines.', icon: '✦', color: '#374151', category: 'Software Development', difficulty: 'beginner', setupTime: '~3 min', estimatedDuration: '2-4 months', audience: 'Indie game developers', tags: ['Unity', 'GameDev', 'C#', 'Assets'], recommendedStack: ['Unity Engine', 'C#', 'Universal Render Pipeline'], useCases: ['Start 2D or 3D indie game development', 'Game jam structure setup'], requirements: ['Unity Hub & Unity Editor installed'] },
  { id: 'unreal-game', name: 'Unreal Engine Game', description: 'C++ & Blueprint template with gameplay framework layout folders and pre-configured asset organization.', icon: '⌬', color: '#111827', category: 'Software Development', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '3-6 months', audience: 'Game developers', tags: ['Unreal', 'GameDev', 'C++', 'Blueprint'], recommendedStack: ['Unreal Engine 5', 'C++', 'Blueprints'], useCases: ['Desktop 3D games development', 'Realistic VR/rendering platforms'], requirements: ['Unreal Engine 5 installed'] },
  { id: 'cloud-native', name: 'Cloud Native App', description: 'Kubernetes deployment templates, Docker configurations, and multi-stage pipelines.', icon: '⚛', color: '#0EA5E9', category: 'Software Development', difficulty: 'advanced', setupTime: '~6 min', estimatedDuration: '2-4 months', audience: 'Cloud engineers', tags: ['Kubernetes', 'Helm', 'Docker', 'AWS'], recommendedStack: ['Docker', 'Kubernetes', 'Helm Chart', 'Terraform'], useCases: ['Scale modern cloud microservices', 'Define cluster infrastructure configs'], requirements: ['Docker and Kubernetes cluster access'] },

  // ── artificial intelligence ──
  { id: 'ml-pipeline', name: 'ML Pipeline', description: 'Python data science setup with scripts for training models, data cleaning, and deployment.', icon: '⚡', color: '#10B981', category: 'Artificial Intelligence', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '1-3 months', audience: 'Data scientists', tags: ['Python', 'Pandas', 'Scikit-Learn', 'Training'], recommendedStack: ['Python', 'Pandas', 'Scikit-Learn', 'FastAPI'], useCases: ['Build data model pipelines', 'Train custom ML models'], requirements: ['Python 3.9+'] },
  { id: 'data-science', name: 'Data Science Project', description: 'Jupyter notebook workspaces with data analysis templates, clean plots, and regression models.', icon: '⚙', color: '#14B8A6', category: 'Artificial Intelligence', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Analysts, data scientists', tags: ['Jupyter', 'Pandas', 'Matplotlib', 'Analysis'], recommendedStack: ['Python', 'Jupyter Lab', 'Pandas', 'Seaborn'], useCases: ['Clean large raw dataset files', 'Generate custom charts and insight graphs'], requirements: ['Python and Jupyter installed'] },
  { id: 'computer-vision', name: 'Computer Vision', description: 'OpenCV script templates configured with camera ingestion scripts and image classification networks.', icon: '⚿', color: '#D946EF', category: 'Artificial Intelligence', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: 'AI Developers', tags: ['OpenCV', 'PyTorch', 'Vision', 'YOLO'], recommendedStack: ['Python', 'OpenCV', 'PyTorch', 'FastAPI'], useCases: ['Realtime object detection scripts', 'Ingest and classify camera video streams'], requirements: ['Webcam or video input', 'Python 3.10+'] },
  { id: 'speech-recognition', name: 'Speech Recognition', description: 'Audio processing model configuration with Whisper transcriber and audio file chunks.', icon: '🝔', color: '#6366F1', category: 'Artificial Intelligence', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '1-2 months', audience: 'AI Developers', tags: ['Speech', 'Whisper', 'Audio', 'Transcribe'], recommendedStack: ['Python', 'OpenAI Whisper', 'FFmpeg', 'FastAPI'], useCases: ['Transcribe voice audio files to text', 'Build conversational audio inputs'], requirements: ['FFmpeg installed locally'] },
  { id: 'rag-application', name: 'RAG Application', description: 'Vector retrieval configuration with page loaders, vector search indexes, and document splitting utilities.', icon: '⚒', color: '#8B5CF6', category: 'Artificial Intelligence', difficulty: 'advanced', setupTime: '~5 min', estimatedDuration: '1-3 months', audience: 'AI Engineers', tags: ['RAG', 'VectorDB', 'LangChain', 'OpenAI'], recommendedStack: ['FastAPI', 'LangChain', 'ChromaDB', 'OpenAI API'], useCases: ['Intelligent question-answer tool for internal wikis', 'PDF document analysis tool'], requirements: ['OpenAI API Key'] },
  { id: 'ai-research', name: 'AI Research Workspace', description: 'Environment setup for deep learning experiments, loss charting scripts, and GPU training config tools.', icon: '⚙', color: '#A855F7', category: 'Artificial Intelligence', difficulty: 'advanced', setupTime: '~5 min', estimatedDuration: '2-6 months', audience: 'Researchers, ML engineers', tags: ['PyTorch', 'Research', 'Training', 'GPU'], recommendedStack: ['Python', 'PyTorch', 'TensorBoard', 'Hugging Face'], useCases: ['Train neural networks from scratch', 'Experiment with transformer weights'], requirements: ['CUDA compatible GPU recommended'] },
  { id: 'prompt-workspace', name: 'Prompt Workspace', description: 'Testing workspace to design complex prompt chains, track API tokens, and test system instructions.', icon: '❖', color: '#EC4899', category: 'Artificial Intelligence', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: '1-3 weeks', audience: 'Prompt engineers', tags: ['Prompts', 'OpenAI', 'Claude', 'JSON-Schema'], recommendedStack: ['Node.js', 'Vite', 'OpenAI Playground'], useCases: ['Draft and version prompt structures', 'Evaluate model output consistency'], requirements: [] },

  // ── startup & product ──
  { id: 'startup-validation', name: 'Startup Idea Validation', description: 'Structured plan to draft surveys, compile user interview spreadsheets, and build landing page components.', icon: '⬧', color: '#F59E0B', category: 'Startup & Product', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Founders', tags: ['Validation', 'Interviews', 'Market', 'Landing'], recommendedStack: ['Typeform', 'Carrd', 'Google Sheets'], useCases: ['Evaluate market demand', 'Interview 20 potential customers'], requirements: [] },
  { id: 'saas-platform', name: 'SaaS Platform Layout', description: 'B2B subscription portal database tables, JWT auth models, billing features, and plan details.', icon: '◼', color: '#84CC16', category: 'Startup & Product', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '2-3 months', audience: 'SaaS founders', tags: ['SaaS', 'Stripe', 'Multi-tenant', 'Portal'], recommendedStack: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe'], useCases: ['Launch recurring software services', 'Build multi-tenant platform portals'], requirements: ['Stripe developer account'] },
  { id: 'product-roadmap', name: 'Product Roadmap Workspace', description: 'Roadmap board to track user feedback queues, feature milestones, and release checklists.', icon: '▲', color: '#06B6D4', category: 'Startup & Product', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: 'Continuous', audience: 'Product managers', tags: ['Roadmap', 'Milestones', 'Feedback', 'Releases'], recommendedStack: ['WIP Projects', 'Docs'], useCases: ['Organize team milestones', 'Public feedback tracking boards'], requirements: [] },
  { id: 'marketplace-platform', name: 'Marketplace Starter', description: 'Multi-vendor system structure with checkout flows, buyer/seller profiles, and transaction logs.', icon: '◆', color: '#EF4444', category: 'Startup & Product', difficulty: 'advanced', setupTime: '~6 min', estimatedDuration: '2-4 months', audience: 'Founders, devs', tags: ['Marketplace', 'StripeConnect', 'Vendors', 'Transactions'], recommendedStack: ['Next.js', 'PostgreSQL', 'Stripe Connect', 'Tailwind'], useCases: ['Build peer-to-peer e-commerce apps', 'Create vendor services platform'], requirements: ['Stripe Connect account'] },
  { id: 'crm-system', name: 'CRM Core Workspace', description: 'Customer pipeline management system with lead states, contacts tables, and task tracking pipelines.', icon: '●', color: '#3B82F6', category: 'Startup & Product', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '1-2 months', audience: 'SMEs, sales teams', tags: ['CRM', 'Pipeline', 'Leads', 'Sales'], recommendedStack: ['React', 'Node.js', 'PostgreSQL'], useCases: ['Build custom CRM web apps', 'Track lead conversion funnels'], requirements: [] },
  { id: 'fintech-app', name: 'FinTech Platform Core', description: 'Double-entry ledger database schema, ledger transactions verification, and Plaid API integration setups.', icon: '✦', color: '#10B981', category: 'Startup & Product', difficulty: 'advanced', setupTime: '~6 min', estimatedDuration: '2-4 months', audience: 'Fintech developers', tags: ['FinTech', 'Plaid', 'Ledger', 'Security'], recommendedStack: ['Node.js', 'Plaid SDK', 'PostgreSQL', 'Redis'], useCases: ['Build personal finance apps', 'Integrate user bank account endpoints'], requirements: ['Plaid developer account', 'SSL certificate configured'] },
  { id: 'e-commerce-site', name: 'E-Commerce Storefront', description: 'Catalog layout pages, shopping cart context scripts, checkout forms, and Stripe integrations.', icon: '⌬', color: '#EAB308', category: 'Startup & Product', difficulty: 'intermediate', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: 'Store builders', tags: ['E-Commerce', 'Cart', 'Stripe', 'Storefront'], recommendedStack: ['Next.js', 'Stripe API', 'Tailwind CSS', 'Postgres'], useCases: ['Launch physical product store online', 'Custom checkout portal apps'], requirements: ['Stripe Account'] },

  // ── design ──
  { id: 'design-system', name: 'Design System', description: 'Tokens documentation workspace with typography scales, responsive grids, and components lists.', icon: '⚛', color: '#F43F5E', category: 'Design', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '3-6 weeks', audience: 'UI/UX designers, developers', tags: ['Tokens', 'Colors', 'Typography', 'Figma'], recommendedStack: ['Storybook', 'React', 'Tailwind CSS'], useCases: ['Build UI design systems', 'Define frontend style standards'], requirements: [] },
  { id: 'ui-kit', name: 'UI Kit Components', description: 'Standard layout buttons, card containers, dialog modals, inputs, and toggle switches list.', icon: '⚡', color: '#EC4899', category: 'Design', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Frontend developers', tags: ['UIKit', 'Components', 'Inputs', 'React'], recommendedStack: ['React', 'CSS Modules'], useCases: ['Rapid component prototypes', 'Reusable component libraries'], requirements: [] },
  { id: 'product-redesign', name: 'Product Redesign', description: 'Workspace to inventory user friction pages, list UX feedback items, and track redesign sprints.', icon: '⚙', color: '#D946EF', category: 'Design', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '1-2 months', audience: 'Product designers', tags: ['Redesign', 'UX', 'Friction', 'Mockups'], recommendedStack: ['Figma link', 'User surveys'], useCases: ['Plan application UX overhaul', 'Audit interface friction items'], requirements: [] },
  { id: 'brand-identity', name: 'Brand Identity Blueprint', description: 'Logo assets folder layout, brand style guides, asset sizes checklists, and marketing assets.', icon: '⚿', color: '#8B5CF6', category: 'Design', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: '2-3 weeks', audience: 'Brand designers, marketing', tags: ['Brand', 'Styleguide', 'Logo', 'Marketing'], recommendedStack: ['Figma', 'Illustrator'], useCases: ['Organize brand assets', 'Write business style guides'], requirements: [] },
  { id: 'mobile-ui-design', name: 'Mobile App Design', description: 'Mobile viewport screen checklists, screen transitions plan, and Figma embed assets workspaces.', icon: '🝔', color: '#6366F1', category: 'Design', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '3-6 weeks', audience: 'Mobile UI designers', tags: ['Mobile', 'UIUX', 'Figma', 'Prototyping'], recommendedStack: ['Figma', 'Sketch'], useCases: ['Map mobile app user flows', 'Prepare asset layouts for native dev'], requirements: [] },

  // ── education ──
  { id: 'college-project', name: 'College Project', description: 'Document thesis plans, organize reference links, track reports chapters, and code structures.', icon: '⚒', color: '#3B82F6', category: 'Education', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: '1-3 months', audience: 'Students', tags: ['College', 'Thesis', 'Report', 'Research'], recommendedStack: ['LaTeX', 'Markdown', 'Git'], useCases: ['Plan university class projects', 'Organize dissertation text drafts'], requirements: [] },
  { id: 'capstone-project', name: 'Capstone Project', description: 'Final year capstone track with task divisions spreadsheets, milestones check, and presentation slide checklists.', icon: '⚙', color: '#10B981', category: 'Education', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '3-6 months', audience: 'Students, teams', tags: ['Capstone', 'Milestones', 'Report', 'Presentation'], recommendedStack: ['GitHub', 'Overleaf', 'Google Slides'], useCases: ['Track final year group projects', 'Compile capstone deliverables'], requirements: [] },
  { id: 'assignment-tracker', name: 'Assignment Tracker', description: 'Homework priority queues, course deadlines calendars, and study logs workspace.', icon: '❖', color: '#64748B', category: 'Education', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Continuous', audience: 'Students', tags: ['Homework', 'Classes', 'Deadlines', 'Study'], recommendedStack: ['WIP Tasks'], useCases: ['Organize university homework loads', 'Study scheduling planners'], requirements: [] },
  { id: 'online-course', name: 'Online Course Builder', description: 'Course syllabus outline folders, video shooting logs, script drafts, and student quiz questions list.', icon: '⬧', color: '#F59E0B', category: 'Education', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '1-3 months', audience: 'Creators, teachers', tags: ['Course', 'Curriculum', 'Syllabus', 'Video'], recommendedStack: ['Teachable', 'Loom', 'Markdown'], useCases: ['Outline tutorial courses', 'Draft script pages & upload schedules'], requirements: [] },

  // ── open source ──
  { id: 'os-library', name: 'Open Source Library', description: 'Contribution guides, pull requests test templates, npm package release checks, and README badges.', icon: '⚛', color: '#EF4444', category: 'Open Source', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: 'Continuous', audience: 'Maintainers', tags: ['OpenSource', 'PR-Template', 'Contributing', 'Library'], recommendedStack: ['GitHub', 'TypeScript', 'Vitest'], useCases: ['Initialize open source repository configs', 'Standardize PR reviews'], requirements: ['GitHub account'] },
  { id: 'dev-toolkit', name: 'Developer Toolkit', description: 'Shell automation scripts, personal developer dotfiles layouts, and utility scripts configurations.', icon: '⚡', color: '#10B981', category: 'Open Source', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '1-2 weeks', audience: 'Developers', tags: ['Toolkit', 'Dotfiles', 'Scripts', 'Automation'], recommendedStack: ['Bash', 'Python', 'Makefiles'], useCases: ['Automate local setups', 'Share dotfiles layouts'], requirements: [] },
  { id: 'cli-tool', name: 'CLI Tool Workspace', description: 'Terminal argument parser setup, console display options, local config scripts, and packaging rules.', icon: '⚙', color: '#475569', category: 'Open Source', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Utility developers', tags: ['CLI', 'Terminal', 'Node', 'Go'], recommendedStack: ['Go', 'Cobra CLI'], useCases: ['Build terminal developer tools', 'Automate code generator CLI apps'], requirements: [] },
  { id: 'doc-website', name: 'Documentation Website', description: 'Static documentation framework layout with search, sidebar navigation config, and markdown support.', icon: '⚿', color: '#0284C7', category: 'Open Source', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-3 weeks', audience: 'Maintainers, writers', tags: ['Docs', 'Markdown', 'Docusaurus', 'Vercel'], recommendedStack: ['Docusaurus', 'React', 'Markdown'], useCases: ['Write developer API guides', 'Launch technical manual web pages'], requirements: ['Node.js 18+'] },

  // ── content creation ──
  { id: 'blog-curation', name: 'Blog Workspace', description: 'Article queues, keyword spreadsheets, image asset files, and SEO metadata checklist.', icon: '◈', color: '#F43F5E', category: 'Content Creation', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Continuous', audience: 'Writers, bloggers', tags: ['Blog', 'Writing', 'SEO', 'Editorial'], recommendedStack: ['Astro', 'Markdown', 'Plausible'], useCases: ['Editorial calendar scheduler', 'Draft blog pages & metadata checklist'], requirements: [] },
  { id: 'newsletter-workspace', name: 'Newsletter Builder', description: 'Email layout templates, issue links trackers, sponsor lead lists, and subscriber metrics.', icon: '✦', color: '#EC4899', category: 'Content Creation', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Continuous', audience: 'Newsletter writers', tags: ['Newsletter', 'Email', 'Sponsors', 'Subscriber'], recommendedStack: ['Substack', 'Buttondown', 'Markdown'], useCases: ['Compile weekly developer link newsletters', 'Sponsorship pipelines tracker'], requirements: [] },
  { id: 'podcast-planner', name: 'Podcast Planner', description: 'Episode scripts blueprints, audio asset sizes folders, guest booking schedules, and post-production rules.', icon: '❖', color: '#8B5CF6', category: 'Content Creation', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: 'Continuous', audience: 'Podcasters, editors', tags: ['Podcast', 'Episodes', 'Audio', 'Scripts'], recommendedStack: ['Audacity', 'Riverside.fm', 'Spotify Podcasts'], useCases: ['Schedule podcast guests', 'Keep audio export quality checklist'], requirements: [] },
  { id: 'youtube-channel', name: 'YouTube Channel Track', description: 'Video title ideas spreadsheets, recording setups checkers, thumbnail designs log, and export settings guides.', icon: '⌬', color: '#EF4444', category: 'Content Creation', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: 'Continuous', audience: 'YouTubers, editors', tags: ['YouTube', 'Video', 'Scripting', 'Thumbnail'], recommendedStack: ['Premiere Pro', 'Photoshop', 'Notion link'], useCases: ['Draft video scripts & timestamps', 'Organize video production checkpoints'], requirements: [] },

  // ── business ──
  { id: 'consulting-project', name: 'Consulting Project', description: 'Client proposal outlines, milestones delivery timelines, billing models, and final check logs.', icon: '⬢', color: '#3B82F6', category: 'Business', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '1-3 months', audience: 'Freelancers, consultants', tags: ['Consulting', 'Client', 'Proposal', 'Milestones'], recommendedStack: ['Google Suite', 'Stripe Invoice'], useCases: ['Deliver professional dev projects', 'Track custom business delivery tasks'], requirements: [] },
  { id: 'marketing-campaign', name: 'Marketing Campaign', description: 'Ad copies layout, social post scheduling sheets, link tracking queues, and conversions analytics.', icon: '⬡', color: '#10B981', category: 'Business', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '2-4 weeks', audience: 'Marketers', tags: ['Marketing', 'Ads', 'Social', 'Analytics'], recommendedStack: ['Facebook Ads', 'Google Ads', 'Google Sheets'], useCases: ['Coordinate product launch campaign', 'A/B test advertising headlines'], requirements: [] },
  { id: 'client-project', name: 'Client Project Template', description: 'Shared milestones checklist, feedback tracking list, invoice delivery trackers, and source code signoffs.', icon: '⚙', color: '#6366F1', category: 'Business', difficulty: 'intermediate', setupTime: '~2 min', estimatedDuration: '1-3 months', audience: 'Agencies, freelancers', tags: ['Client', 'Agile', 'Milestones', 'Feedback'], recommendedStack: ['WIP Board', 'Google Drive'], useCases: ['Coordinate freelance contract builds', 'Client review pipeline dashboards'], requirements: [] },

  // ── personal ──
  { id: 'learning-tracker', name: 'Learning Tracker', description: 'Course resource links, book reading files lists, daily study trackers, and key concepts summaries.', icon: '◈', color: '#0EA5E9', category: 'Personal', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Continuous', audience: 'Everyone', tags: ['Learning', 'Study', 'Books', 'Tracker'], recommendedStack: ['WIP Docs'], useCases: ['Track online class courses', 'Keep summaries of software books read'], requirements: [] },
  { id: 'goal-tracker', name: 'Goal Tracker', description: 'Yearly objectives list, daily routines trackers, quarterly milestone checks, and reflection prompts.', icon: '✦', color: '#F43F5E', category: 'Personal', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Yearly', audience: 'Everyone', tags: ['Goals', 'Habits', 'Milestones', 'Reflection'], recommendedStack: ['WIP Tasks'], useCases: ['Organize annual software habits goals', 'Quarterly roadmap self-check'], requirements: [] },
  { id: 'knowledge-base', name: 'Knowledge Base Wiki', description: 'Note catalog files, coding cheat sheets lists, dev environments setup notes, and reference links.', icon: '❖', color: '#10B981', category: 'Personal', difficulty: 'beginner', setupTime: '~1 min', estimatedDuration: 'Continuous', audience: 'Everyone', tags: ['Wiki', 'Notes', 'Reference', 'CheatSheet'], recommendedStack: ['WIP Docs'], useCases: ['Personal wiki for quick dev commands reference', 'Central catalog for programming tips'], requirements: [] },

  // ── iot & hardware ──
  { id: 'iot-platform', name: 'IoT Platform Starter', description: 'Hardware simulator scripts, message publisher queues, schema layouts, and database adapters.', icon: '⌬', color: '#EAB308', category: 'IoT & Hardware', difficulty: 'advanced', setupTime: '~5 min', estimatedDuration: '2-4 months', audience: 'IoT developers', tags: ['IoT', 'MQTT', 'Hardware', 'Broker'], recommendedStack: ['Node-RED', 'Mosquitto Broker', 'InfluxDB', 'Raspberry Pi'], useCases: ['Receive sensors metrics feeds', 'Build IoT server telemetry apps'], requirements: ['Mosquitto broker setup local', 'Raspberry Pi or simulated client'] },
  { id: 'embedded-systems', name: 'Embedded Systems C', description: 'Firmware build scripts, compiler targets setups, header libraries layout, and serial testing logs.', icon: '⬢', color: '#D946EF', category: 'IoT & Hardware', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '1-3 months', audience: 'Hardware developers', tags: ['C', 'Firmware', 'Makefile', 'Serial'], recommendedStack: ['C / C++', 'Make', 'ESP32 / Arduino'], useCases: ['ESP32 microchip custom code logic', 'Sensor control logic firmware'], requirements: ['ESP32 development board and GCC compiler'] },
  { id: 'smart-home', name: 'Smart Home Automation', description: 'Dashboard templates to configure switches state, webhook schedules, and device registers.', icon: '⬡', color: '#6366F1', category: 'IoT & Hardware', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '2-4 weeks', audience: 'Hobbyists', tags: ['Home', 'Automation', 'Webhooks', 'ESP8266'], recommendedStack: ['Home Assistant', 'ESP8266', 'MQTT'], useCases: ['Custom automation relays switches logic', 'Sensor alert webhooks system'], requirements: ['MQTT server setup'] },

  // ── cybersecurity ──
  { id: 'cybersecurity-project', name: 'Cybersecurity Project', description: 'Threat model templates, system security registers, penetration test checklists, and vulnerabilities charts.', icon: '◈', color: '#EF4444', category: 'Cybersecurity', difficulty: 'advanced', setupTime: '~3 min', estimatedDuration: '1-2 months', audience: 'Security analysts', tags: ['Security', 'ThreatModel', 'Vulnerabilities', 'Audit'], recommendedStack: ['OWASP Risk Rating', 'Docker'], useCases: ['Security assessment workflow board', 'Threat modeling checklist database'], requirements: [] },
  { id: 'pen-testing', name: 'Penetration Testing', description: 'Vulnerability exploit targets checks, port scanner results logs, payload design trackers, and audit reports.', icon: '✦', color: '#F43F5E', category: 'Cybersecurity', difficulty: 'advanced', setupTime: '~3 min', estimatedDuration: '1-2 months', audience: 'Pen testers, analysts', tags: ['PenTest', 'Exploit', 'Network', 'Audit'], recommendedStack: ['Kali Linux', 'Nmap', 'Metasploit'], useCases: ['Map client penetration test checkpoints', 'Keep track of scanned host open ports'], requirements: ['Nmap installed'] },
  { id: 'auth-service', name: 'Authentication Service', description: 'OAuth2 server structures, hash scripts models, user validation rules, and sessions controllers.', icon: '❖', color: '#6366F1', category: 'Cybersecurity', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '1-2 months', audience: 'Backend devs', tags: ['Auth', 'OAuth2', 'JWT', 'Security'], recommendedStack: ['Node.js', 'bcrypt', 'jsonwebtoken', 'Redis'], useCases: ['Implement custom auth microservices', 'B2B single sign on oauth servers'], requirements: [] },

  // ── devops ──
  { id: 'docker-workspace', name: 'Docker Project', description: 'Multi-stage Dockerfile blueprints, developer env config scripts, and image size checkers.', icon: '⌬', color: '#2563EB', category: 'DevOps', difficulty: 'beginner', setupTime: '~2 min', estimatedDuration: '1-2 weeks', audience: 'All developers', tags: ['Docker', 'Containers', 'Deploy', 'Vite'], recommendedStack: ['Docker', 'Multi-stage build', 'Alpine'], useCases: ['Containerize application codebase files', 'Standardize developer workspace configs'], requirements: ['Docker installed local'] },
  { id: 'kubernetes-cluster', name: 'Kubernetes Configs', description: 'Kubernetes ingress controller YAML templates, deployments definitions, secrets settings, and volumes setups.', icon: '⬢', color: '#38BDF8', category: 'DevOps', difficulty: 'advanced', setupTime: '~5 min', estimatedDuration: '1-2 months', audience: 'DevOps engineers', tags: ['Kubernetes', 'YAML', 'Ingress', 'Deployments'], recommendedStack: ['Minikube', 'Kubectl', 'Helm'], useCases: ['Scale application containers cluster pods', 'Standardize kubernetes deployments resources config'], requirements: ['Kubernetes cluster access'] },
  { id: 'cicd-pipeline', name: 'CI/CD Pipeline Build', description: 'GitHub Actions workflow configurations, lint validations step configs, test scripts run, and target server deploy commands.', icon: '⬡', color: '#10B981', category: 'DevOps', difficulty: 'intermediate', setupTime: '~3 min', estimatedDuration: '1-3 weeks', audience: 'All developers', tags: ['CI/CD', 'GitHubActions', 'Workflows', 'Tests'], recommendedStack: ['GitHub Actions', 'Docker', 'AWS ECS'], useCases: ['Automated PR check pipelines', 'Auto-deploy code branch on push to main'], requirements: ['GitHub account'] },
  { id: 'iac-terraform', name: 'Infrastructure as Code', description: 'Terraform script templates to bootstrap web server nodes, configure security access rules, and set storage folders.', icon: '⚙', color: '#7C3AED', category: 'DevOps', difficulty: 'advanced', setupTime: '~4 min', estimatedDuration: '3-6 weeks', audience: 'DevOps, Cloud engineers', tags: ['Terraform', 'IaC', 'AWS', 'State'], recommendedStack: ['Terraform', 'AWS provider', 'S3 backend'], useCases: ['Automate AWS server creation logs', 'Standardize network subnets layout'], requirements: ['AWS Developer account', 'Terraform CLI installed'] }
];

export const BLUEPRINT_CATEGORIES = [
  'All',
  'Software Development',
  'Artificial Intelligence',
  'Startup & Product',
  'Design',
  'Education',
  'Open Source',
  'Content Creation',
  'Business',
  'Personal',
  'IoT & Hardware',
  'Cybersecurity',
  'DevOps',
  'Custom'
] as const;

// Helper to generate full blueprint details dynamically based on metadata
export function buildFullBlueprint(raw: typeof BLUEPRINT_METADATA[number]): Blueprint {
  const sprintNames = [
    'Setup & Architecture',
    'Core Functional Engine',
    'UI Components & Integration',
    'Testing, Auditing & Deployment'
  ];

  const defaultDocs = [
    {
      title: 'README.md',
      content: `# ${raw.name}\n\n${raw.description}\n\n## Stack\n${(raw.recommendedStack || []).map(s => `- ${s}`).join('\n')}\n\n## Setup\n1. Install dependencies: \`npm install\`\n2. Run development: \`npm run dev\`\n3. Run tests: \`npm test\``
    },
    {
      title: 'Coding Standards',
      content: `# Coding Standards & Guidelines\n\n- Keep code dry and modular.\n- Write tests for core business handlers.\n- Document public API routing models.\n- Follow camelCase naming conventions.`
    }
  ];

  const defaultSnippets = (raw.recommendedStack || []).map(tech => {
    let code = `// Code bootstrap for ${tech}\nconsole.log("Ready");`;
    let lang: SnippetLanguage = 'typescript';
    if (tech === 'Next.js' || tech === 'React.js' || tech === 'Vite' || tech === 'TypeScript') {
      code = `// Component layout\nexport function Component() {\n  return (\n    <div className="p-4 border rounded-xl">\n      <h3>Initialized ${raw.name}</h3>\n    </div>\n  );\n}`;
      lang = 'typescript';
    } else if (tech === 'Python' || tech === 'FastAPI') {
      code = `# FastAPI bootstrap\nfrom fastapi import FastAPI\n\napp = FastAPI(title="${raw.name}")\n\n@app.get("/")\ndef read_root():\n    return {"status": "running"}`;
      lang = 'python';
    } else if (tech === 'Docker') {
      code = `FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nEXPOSE 3000\nCMD ["npm", "start"]`;
      lang = 'yaml';
    }
    return {
      title: `${tech} Initialization`,
      language: lang,
      code,
      description: `Basic start script for ${tech} setup.`,
      tags: [tech.toLowerCase(), 'init']
    };
  });

  const sampleTasks: any[] = [];
  const labels = raw.tags || ['core', 'setup'];

  // Procedurally generate 30 detailed tasks divided across the 4 sprints
  const taskScaffolds = [
    { title: 'Initialize project repository', desc: 'Initialize Git, configure standard .gitignore rules, and build empty folders.', priority: 'high', labels: ['setup'] },
    { title: 'Set up package dependencies', desc: `Install core packages required for ${raw.name} and configure lockfiles.`, priority: 'high', labels: ['setup'] },
    { title: 'Draft project architecture doc', desc: 'Detail modules flow diagrams, schemas layouts, and dependencies routing.', priority: 'medium', labels: ['docs'] },
    { title: 'Configure environment variables', desc: 'Draft template configs and security validation checks scripts.', priority: 'critical', labels: ['setup'] },
    { title: 'Set up Docker container', desc: 'Write multi-stage Dockerfile build scripts and docker-compose settings.', priority: 'medium', labels: ['devops'] },
    { title: 'Configure CI/CD automated pipeline', desc: 'Write test execution lint pipelines using GitHub Actions.', priority: 'low', labels: ['devops'] },
    { title: 'Create primary database connection', desc: 'Configure ORM drivers adapters, schema models files, and initial seed models.', priority: 'critical', labels: ['database'] },
    { title: 'Implement user auth schemas', desc: 'Configure database fields schema, encryption helper models, and tokens tables.', priority: 'critical', labels: ['auth'] },
    { title: 'Write authentication middle-layer', desc: 'Create validation handlers, cookies checks, and tokens signers.', priority: 'high', labels: ['auth'] },
    { title: 'Draft main API endpoints layout', desc: 'Build basic router files, placeholder routes, and error interceptors.', priority: 'high', labels: ['api'] },
    { title: 'Set up global layout structure', desc: 'Create navbar dashboard shell layout, page views layout, and basic layout component files.', priority: 'medium', labels: ['ui'] },
    { title: 'Build auth view login pages', desc: 'Implement email validators validation layouts, token submit buttons, and storage hooks.', priority: 'high', labels: ['ui', 'auth'] },
    { title: 'Configure client network client', desc: 'Write basic fetch/axios instance configurations with credentials headers scripts.', priority: 'medium', labels: ['api'] },
    { title: 'Implement core database migrations', desc: 'Create tables schema structure migration script files and run updates.', priority: 'high', labels: ['database'] },
    { title: 'Implement main CRUD endpoint routes', desc: 'Build schema validator checks and services handlers to query database records.', priority: 'high', labels: ['api'] },
    { title: 'Implement global state controller', desc: 'Configure user storage state provider hooks, actions, and settings handlers.', priority: 'medium', labels: ['ui'] },
    { title: 'Build main list query viewport', desc: 'Implement search filters layout, pagination loaders component, and detail cards view.', priority: 'medium', labels: ['ui'] },
    { title: 'Build creation dialog modal views', desc: 'Implement form controls, inputs validation layout, and error helpers widgets.', priority: 'medium', labels: ['ui'] },
    { title: 'Write unit tests for services', desc: 'Mock database client queries and write mock requests assert logic checks.', priority: 'low', labels: ['testing'] },
    { title: 'Write integration check tests', desc: 'Test end-to-end routing handlers and auth query token parameters validation.', priority: 'low', labels: ['testing'] },
    { title: 'Run interface responsiveness audit', desc: 'Verify UI layouts across small tablet views and mobile device viewports.', priority: 'medium', labels: ['ui'] },
    { title: 'Audit SEO tag metadata headers', desc: 'Verify main route meta headers descriptions, social preview card assets, and robots txt.', priority: 'low', labels: ['marketing'] },
    { title: 'Configure cloud hosting platforms', desc: 'Set up target variables configs on build servers (Render/Vercel/AWS).', priority: 'medium', labels: ['devops'] },
    { title: 'Deploy staging check release', desc: 'Release staging deploy and test main flow endpoints.', priority: 'high', labels: ['devops'] }
  ];

  taskScaffolds.forEach((task, idx) => {
    sampleTasks.push({
      title: `${task.title} for ${raw.name}`,
      description: task.desc,
      status: idx < 2 ? 'todo' : 'backlog',
      priority: task.priority,
      labels: task.labels,
      storyPoints: [1, 2, 3, 5, 8][idx % 5],
      acceptanceCriteria: `Verified function completes correctly according to specifications.`,
      assignee: '',
      isFavorite: false
    });
  });

  const features = [
    `${sampleTasks.length} pre-built tasks`,
    `${sprintNames.length} project sprints`,
    `${defaultDocs.length} architecture docs`,
    `${defaultSnippets.length} starter code templates`
  ];

  return {
    ...raw,
    planningItems: [
      {
        title: 'Product Vision',
        content: `## Vision\nBuild a robust, scalable ${raw.name} using modern software engineering patterns.\n\n### Objective\n${raw.description}\n\n### Target Audience\n${raw.audience}`,
        order: 0
      },
      {
        title: 'Architecture & Design',
        content: `## Architecture Notes\n\n### Recommended Stack\n${(raw.recommendedStack || []).map(s => `- **${s}**`).join('\n')}\n\n### Requirements\n${(raw.requirements || []).map(r => `- ${r}`).join('\n')}\n\n### Suggested Folder Layout\n\`\`\`\n${raw.folderStructure || '/src'}\n\`\`\``,
        order: 1
      }
    ],
    sprintNames,
    labels,
    defaultDocs,
    sampleTasks,
    defaultSnippets,
    features,
    category: raw.category as BlueprintCategory
  };
}

export const OFFICIAL_BLUEPRINTS: Blueprint[] = BLUEPRINT_METADATA.map(buildFullBlueprint);
