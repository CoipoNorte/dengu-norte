import { 
  LayoutDashboard, Upload, BarChart3, GitCompare, Wand2, 
  Edit3, Search, Users, ChevronLeft, ChevronRight, Brain
} from 'lucide-react';
import type { Page } from '../types';
import { cn } from '../utils/cn';

const navItems: { page: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'upload', label: 'Gestión de CVs', icon: Upload },
  { page: 'analysis', label: 'Análisis ATS', icon: BarChart3 },
  { page: 'compare', label: 'Comparar Oferta', icon: GitCompare },
  { page: 'generator', label: 'Generador CV', icon: Wand2 },
  { page: 'editor', label: 'Editor CV', icon: Edit3 },
  { page: 'search', label: 'Buscar Empleo', icon: Search },
  { page: 'community', label: 'Comunidad', icon: Users },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out',
        'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/50',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800/50 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white tracking-tight leading-none">Dengu Norte</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">ATS Optimizer</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ page, label, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              title={collapsed ? label : undefined}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-emerald-400')} />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-4 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}
