import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import type { Page } from './types';
import { useDatabase } from './hooks/useDatabase';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardPage from './components/pages/DashboardPage';
import UploadPage from './components/pages/UploadPage';
import AnalysisPage from './components/pages/AnalysisPage';
import ComparePage from './components/pages/ComparePage';
import GeneratorPage from './components/pages/GeneratorPage';
import EditorPage from './components/pages/EditorPage';
import SearchPage from './components/pages/SearchPage';
import CommunityPage from './components/pages/CommunityPage';
import { cn } from './utils/cn';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedCvForAnalysis, setSelectedCvForAnalysis] = useState<string | undefined>();

  const db = useDatabase();

  const handleNavigateAnalysis = useCallback((cvId: string) => {
    setSelectedCvForAnalysis(cvId);
    setCurrentPage('analysis');
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    if (page !== 'analysis') setSelectedCvForAnalysis(undefined);
  }, []);

  const stats = db.getStats();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage stats={stats} />;
      case 'upload':
        return (
          <UploadPage
            cvs={db.cvs}
            onUpload={db.uploadCV}
            onDelete={db.deleteCV}
            onNavigateAnalysis={handleNavigateAnalysis}
          />
        );
      case 'analysis':
        return (
          <AnalysisPage
            cvs={db.cvs}
            selectedCvId={selectedCvForAnalysis}
            onRunAnalysis={db.runAnalysis}
          />
        );
      case 'compare':
        return (
          <ComparePage
            cvs={db.cvs}
            onCompare={db.runComparison}
          />
        );
      case 'generator':
        return (
          <GeneratorPage
            cvs={db.cvs}
            onOptimize={db.optimizeCV}
          />
        );
      case 'editor':
        return (
          <EditorPage
            cvs={db.cvs}
            onSaveCV={db.uploadCV}
          />
        );
      case 'search':
        return <SearchPage cvs={db.cvs} />;
      case 'community':
        return <CommunityPage />;
      default:
        return <DashboardPage stats={stats} />;
    }
  };

  const pageTitle: Record<Page, string> = {
    dashboard: 'Dashboard',
    upload: 'Gestión de CVs',
    analysis: 'Análisis ATS',
    compare: 'Comparar Oferta',
    generator: 'Generador CV',
    editor: 'Editor CV',
    search: 'Búsqueda de Empleo',
    community: 'Comunidad',
  };

  // Only show loading on initial app load
  if (db.loading && !db.initialLoadDone) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-[68px]'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                {pageTitle[currentPage]}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">100% Privado</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
