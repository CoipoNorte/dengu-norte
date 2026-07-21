import { 
  LayoutDashboard, Upload, BarChart3, GitCompare, Wand2, 
  Edit3, Search, Users, Brain, X 
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

interface MobileNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ currentPage, onNavigate, isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">Dengu Norte</h1>
              <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">ATS Optimizer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ page, label, icon: Icon }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => { onNavigate(page); onClose(); }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl text-sm font-medium px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-emerald-400')} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
