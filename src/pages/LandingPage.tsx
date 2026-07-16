import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Github, Zap, Layout, FileText, Code2,
  BarChart2, Map, CheckCircle2, Circle, Menu, X,
  ChevronRight, Star, Users, Cpu, GraduationCap,
  Briefcase, Terminal
} from 'lucide-react';
import { cn } from '@/utils';

// ─── Data ───────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Blueprints', href: '#blueprints' },
  { label: 'Roadmap', href: '#roadmap' },
];

const FEATURES = [
  {
    icon: Layout,
    title: 'Project Management',
    description: 'Kanban boards, backlogs, sprints, and timelines — all in one workspace.',
  },
  {
    icon: Star,
    title: 'Blueprints',
    description: 'Start any project instantly with pre-built templates for your stack.',
  },
  {
    icon: Zap,
    title: 'Sprint Planning',
    description: 'Define goals, track velocity, and ship on schedule every sprint.',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Nested docs, markdown editor, and pinned pages — knowledge lives here.',
  },
  {
    icon: Code2,
    title: 'Developer Tools',
    description: 'Snippet library with syntax highlighting for 20+ languages.',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    description: 'Velocity, burndown, cycle time, and activity insights per project.',
  },
];

const BLUEPRINTS = [
  {
    icon: '⚛',
    name: 'React App',
    category: 'Web Development',
    setupTime: '~2 min',
    sprints: 4,
    features: ['Component library', 'State management', 'Testing setup'],
    color: '#38BDF8',
  },
  {
    icon: '🔷',
    name: 'ASP.NET Core API',
    category: 'Backend',
    setupTime: '~3 min',
    sprints: 5,
    features: ['Clean Architecture', 'JWT auth', 'Swagger docs'],
    color: '#A78BFA',
  },
  {
    icon: '🤖',
    name: 'AI Startup',
    category: 'AI / ML',
    setupTime: '~2 min',
    sprints: 4,
    features: ['Model research', 'Dataset tracking', 'GTM planning'],
    color: '#4ADE80',
  },
  {
    icon: '🚀',
    name: 'Startup MVP',
    category: 'Product',
    setupTime: '~2 min',
    sprints: 6,
    features: ['Product spec', 'Roadmap', 'Launch checklist'],
    color: '#F06277',
  },
  {
    icon: '🎓',
    name: 'College Project',
    category: 'Academic',
    setupTime: '~1 min',
    sprints: 4,
    features: ['Assignment tracking', 'Team coordination', 'Report template'],
    color: '#F472B6',
  },
];

const WORKFLOW_STEPS = [
  { label: 'Idea', icon: '💡', desc: 'Capture and define what you\'re building' },
  { label: 'Planning', icon: '🗺', desc: 'Document architecture, goals, and specs' },
  { label: 'Sprint', icon: '⚡', desc: 'Break work into focused 2-week cycles' },
  { label: 'Build', icon: '⚙', desc: 'Execute tasks, track progress in real time' },
  { label: 'Release', icon: '🚀', desc: 'Ship, review, and iterate with insights' },
];

const BUILT_FOR = [
  { icon: Terminal, label: 'Developers', desc: 'Ship code, not spreadsheets' },
  { icon: GraduationCap, label: 'Students', desc: 'Ace every group project' },
  { icon: Cpu, label: 'Startups', desc: 'Move fast from idea to product' },
  { icon: Users, label: 'Engineering Teams', desc: 'Stay aligned across sprints' },
  { icon: Briefcase, label: 'Freelancers', desc: 'Keep every client project organized' },
];

const ROADMAP = [
  {
    version: 'v0.1',
    title: 'Core Workspace',
    status: 'shipped',
    items: ['Projects & Kanban', 'Sprint Planning', 'Documentation', 'Snippets & Assets'],
  },
  {
    version: 'v0.5',
    title: 'Collaboration & Auth',
    status: 'current',
    items: ['Landing Page', 'Authentication', 'Blueprint Store', 'Home Dashboard'],
  },
  {
    version: 'v1.0',
    title: 'Team Features',
    status: 'planned',
    items: ['Real-time collaboration', 'Team workspaces', 'Integrations (GitHub, Jira)', 'Cloud sync'],
  },
];

// ─── App Preview mockup ──────────────────────────────────────────
function AppPreview() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      {/* Browser chrome */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-lg px-3 py-1 text-[11px] text-gray-400">
            app.wip.dev/projects/hero
          </div>
        </div>

        {/* App shell */}
        <div className="flex h-[340px] bg-gray-50">
          {/* Mini sidebar */}
          <div className="w-44 bg-white border-r border-gray-100 flex flex-col p-2 gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 mb-1">
              <div className="w-5 h-5 rounded bg-yellow-300 flex items-center justify-center">
                <span className="text-[9px] font-black text-gray-900">W</span>
              </div>
              <span className="text-[10px] font-bold text-gray-800">WIP</span>
            </div>
            {[
              { label: 'Overview', active: false },
              { label: 'Backlog', active: false },
              { label: 'Board', active: true },
              { label: 'Sprints', active: false },
              { label: 'Docs', active: false },
            ].map(item => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center px-2 py-1.5 rounded-lg text-[10px] font-medium',
                  item.active ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
                )}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Kanban board preview */}
          <div className="flex-1 p-3 overflow-hidden">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sprint 2 · Board</div>
            <div className="flex gap-2 h-[280px]">
              {[
                { title: 'To Do', color: '#60A5FA', tasks: ['Auth middleware', 'DB schema design'] },
                { title: 'In Progress', color: '#F59E0B', tasks: ['API endpoints', 'React components'] },
                { title: 'Review', color: '#A78BFA', tasks: ['Payment integration'] },
                { title: 'Done', color: '#22C55E', tasks: ['Setup CI/CD', 'Unit tests'] },
              ].map(col => (
                <div key={col.title} className="w-28 flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[9px] font-semibold text-gray-500">{col.title}</span>
                  </div>
                  <div className="space-y-1.5">
                    {col.tasks.map(task => (
                      <div key={task} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="text-[9px] font-medium text-gray-700 leading-snug">{task}</div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="w-3 h-1 rounded-full" style={{ backgroundColor: col.color + '60' }} />
                          <span className="text-[7px] text-gray-400">3pt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating pill badges */}
      <div className="absolute -top-3 -right-4 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold text-gray-700">Sprint 2 · Active</span>
      </div>
      <div className="absolute -bottom-3 -left-4 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <span className="text-[10px] font-bold text-gray-700">68%</span>
        <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full w-[68%] rounded-full bg-emerald-400" />
        </div>
        <span className="text-[9px] text-gray-400">Sprint progress</span>
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────
export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const workflowRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance workflow steps
  useEffect(() => {
    workflowRef.current = setInterval(() => {
      setActiveWorkflow(prev => (prev + 1) % WORKFLOW_STEPS.length);
    }, 2200);
    return () => { if (workflowRef.current) clearInterval(workflowRef.current); };
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ── Navigation ── */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm' : 'bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/logo.png"
              alt="WIP"
              className="w-14 h-14 object-contain transition-transform duration-200 group-hover:scale-105"
            />

            {/* Uncomment if you want the text back */}
            {/* 
  <div className="leading-tight">
    <h1 className="text-lg font-bold tracking-tight text-gray-900">WIP</h1>
    <p className="text-sm text-gray-500">Work In Progress</p>
  </div>
  */}

            <span className="hidden sm:inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Beta
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://github.com/Saichu06/WIP---Work-In-Progress"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Github size={14} />
              GitHub
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="px-4 py-2.5 text-sm font-medium text-center border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
                Sign in
              </Link>
              <Link to="/signup" className="px-4 py-2.5 text-sm font-semibold text-center bg-gray-900 text-white rounded-xl hover:bg-gray-800">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Now in beta — free forever for individuals
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                Everything your software project needs.{' '}
                <span className="relative">
                  <span className="relative z-10">One workspace.</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-yellow-300/60 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
                WIP is a developer-first project operating system. Plan sprints, manage tasks,
                write documentation, save snippets, and track analytics — all in one place.
              </p>

              <div className="flex items-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm"
                >
                  Start Building
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="https://github.com/Saichu06/WIP---Work-In-Progress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Github size={15} />
                  View GitHub
                </a>
              </div>

              <div className="flex items-center gap-4 mt-8 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> No account required to explore</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Open source</span>
              </div>
            </div>

            {/* Right — App preview */}
            <div className="hidden lg:block">
              <AppPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-12">From idea to shipped — in one tool</h2>

          <div className="flex items-center justify-center gap-0 flex-wrap">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <button
                  onClick={() => setActiveWorkflow(i)}
                  className={cn(
                    'flex flex-col items-center gap-2 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer',
                    activeWorkflow === i ? 'bg-white shadow-md border border-gray-200 scale-105' : 'hover:bg-white/50'
                  )}
                >
                  <span className="text-2xl" style={{ filter: 'grayscale(100%) contrast(120%)', opacity: 0.85 }}>{step.icon}</span>
                  <span className={cn(
                    'text-xs font-bold transition-colors',
                    activeWorkflow === i ? 'text-gray-900' : 'text-gray-400'
                  )}>
                    {step.label}
                  </span>
                  {activeWorkflow === i && (
                    <p className="text-[10px] text-gray-500 max-w-[110px] text-center leading-snug">
                      {step.desc}
                    </p>
                  )}
                </button>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight size={16} className="text-gray-300 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for the full project lifecycle</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything a developer or team needs — from first commit to final release.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="p-6 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all bg-white"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <feature.icon size={17} className="text-gray-700" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blueprint Showcase ── */}
      <section id="blueprints" className="py-24 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Blueprint Store</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start in minutes, not hours</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose a pre-built workspace template and get tasks, sprints, and docs configured automatically.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {BLUEPRINTS.map(bp => (
              <div key={bp.name} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ backgroundColor: bp.color + '20', border: `1px solid ${bp.color}30` }}
                >
                  <span style={{ filter: 'grayscale(100%) contrast(120%)', display: 'inline-block', opacity: 0.8 }}>
                    {bp.icon}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{bp.category}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">{bp.name}</h3>
                <div className="space-y-1 mb-4">
                  {bp.features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                  <div><span className="font-bold text-gray-600">{bp.sprints}</span> sprints</div>
                  <div>{bp.setupTime} setup</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Explore all blueprints <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Built For ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Who it's for</p>
            <h2 className="text-2xl font-bold text-gray-900">Built for builders</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {BUILT_FOR.map(persona => (
              <div key={persona.label} className="text-center p-6 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <persona.icon size={18} className="text-gray-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{persona.label}</h3>
                <p className="text-[11px] text-gray-400 leading-snug">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" className="py-24 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Roadmap</p>
            <h2 className="text-2xl font-bold text-gray-900">Where we're headed</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[88px] top-4 bottom-4 w-px bg-gray-200 hidden sm:block" />

            <div className="space-y-8">
              {ROADMAP.map((milestone, i) => (
                <div key={milestone.version} className="sm:grid sm:grid-cols-[80px_1fr] gap-6 items-start">
                  <div className="hidden sm:flex flex-col items-end gap-1 pt-1">
                    <span className={cn(
                      'text-xs font-bold',
                      milestone.status === 'shipped' ? 'text-gray-900' :
                        milestone.status === 'current' ? 'text-yellow-700' : 'text-gray-400'
                    )}>
                      {milestone.version}
                    </span>
                  </div>

                  <div className="relative sm:pl-6">
                    {/* Dot */}
                    <div className={cn(
                      'absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 -translate-x-1/2 hidden sm:block',
                      milestone.status === 'shipped' ? 'bg-gray-900 border-gray-900' :
                        milestone.status === 'current' ? 'bg-yellow-400 border-yellow-400' : 'bg-white border-gray-300'
                    )} />

                    <div className={cn(
                      'p-5 rounded-2xl border',
                      milestone.status === 'shipped' ? 'border-gray-200 bg-white' :
                        milestone.status === 'current' ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-100 bg-white opacity-60'
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider sm:hidden">{milestone.version} · </span>
                        <h3 className="text-sm font-bold text-gray-900">{milestone.title}</h3>
                        {milestone.status === 'shipped' && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Shipped</span>
                        )}
                        {milestone.status === 'current' && (
                          <span className="text-[9px] font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">In Progress</span>
                        )}
                        {milestone.status === 'planned' && (
                          <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Planned</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {milestone.items.map(item => (
                          <span key={item} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Ready to start building?
          </h2>
          <p className="text-gray-500 mb-8">
            Free forever for individual developers. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
          >
            Create your workspace
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-yellow-300 flex items-center justify-center">
              <span className="text-[10px] font-black text-gray-900">W</span>
            </div>
            <span className="text-sm font-bold text-gray-900">WIP</span>
            <span className="text-sm text-gray-400">· Made by Sai</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <a
              href="https://github.com/Saichu06/WIP---Work-In-Progress"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
            >
              <Github size={13} /> GitHub
            </a>
            <span>MIT License</span>
            <span>© 2026 WIP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
