import { useState, useEffect, useRef } from 'react';
import { BarChart3, AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { CVDocument, ATSAnalysis } from '../../types';
import { cn } from '../../utils/cn';
import ScoreRing from '../ScoreRing';
import { analyzeATS } from '../../services/atsEngine';

interface AnalysisPageProps {
  cvs: CVDocument[];
  selectedCvId?: string;
  onRunAnalysis: (cvId: string) => Promise<ATSAnalysis | null>;
}

export default function AnalysisPage({ cvs, selectedCvId, onRunAnalysis }: AnalysisPageProps) {
  const [selected, setSelected] = useState<string>(selectedCvId || '');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const hasAutoAnalyzed = useRef<string | null>(null);

  // Auto-analyze when selectedCvId is provided (only once per CV)
  useEffect(() => {
    if (selectedCvId && selectedCvId !== hasAutoAnalyzed.current && cvs.length > 0) {
      const cv = cvs.find(c => c.id === selectedCvId);
      if (cv) {
        hasAutoAnalyzed.current = selectedCvId;
        setSelected(selectedCvId);
        // Run analysis synchronously from local data
        const localAnalysis = analyzeATS(cv);
        setAnalysis(localAnalysis);
      }
    }
  }, [selectedCvId, cvs]);

  const handleAnalyze = async () => {
    if (!selected) return;
    setLoading(true);

    const cv = cvs.find(c => c.id === selected);
    if (cv) {
      // Run analysis locally first for instant feedback
      const localAnalysis = analyzeATS(cv);
      setAnalysis(localAnalysis);
      // Also save to DB (fire and forget, no await to prevent re-render issues)
      onRunAnalysis(selected).catch(console.error);
    }

    setLoading(false);
  };

  const handleSelectChange = (cvId: string) => {
    setSelected(cvId);
    setAnalysis(null);
    hasAutoAnalyzed.current = null;
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default: return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getIssueBg = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500/20 bg-red-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const breakdownItems = analysis ? [
    { label: 'Formato', score: analysis.breakdown.formatting, desc: 'Compatibilidad del formato' },
    { label: 'Keywords', score: analysis.breakdown.keywords, desc: 'Verbos de acción' },
    { label: 'Estructura', score: analysis.breakdown.structure, desc: 'Organización del CV' },
    { label: 'Legibilidad', score: analysis.breakdown.readability, desc: 'Claridad de lectura' },
    { label: 'Completitud', score: analysis.breakdown.completeness, desc: 'Info esencial' },
  ] : [];

  const getBarColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Análisis ATS</h2>
        <p className="text-gray-400 text-sm sm:text-base mt-1">Analiza la compatibilidad de tu CV con sistemas ATS</p>
      </div>

      {/* CV Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selected}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="">Selecciona un CV</option>
          {cvs.map(cv => (
            <option key={cv.id} value={cv.id}>{cv.name} {cv.atsScore ? `(${cv.atsScore}%)` : ''}</option>
          ))}
        </select>
        <button
          onClick={handleAnalyze}
          disabled={!selected || loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          {loading ? 'Analizando...' : 'Analizar'}
        </button>
      </div>

      {/* No CV selected */}
      {!analysis && !loading && (
        <div className="text-center py-12 sm:py-16 text-gray-600">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-20" />
          <p className="text-base sm:text-lg">Selecciona un CV para analizar</p>
          <p className="text-xs sm:text-sm mt-1">El análisis es instantáneo y 100% privado</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 sm:space-y-6">
          {/* Score + Breakdown - Responsive Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Overall Score - Centered on mobile */}
            <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score Ring */}
                <div className="flex flex-col items-center shrink-0">
                  <ScoreRing score={analysis.overallScore} size={140} strokeWidth={10} label="Score ATS" />
                  <p className="mt-3 text-xs sm:text-sm text-gray-400 text-center max-w-[200px]">
                    {analysis.overallScore >= 80 && '¡Excelente compatibilidad!'}
                    {analysis.overallScore >= 60 && analysis.overallScore < 80 && 'Buen inicio, mejora posible'}
                    {analysis.overallScore >= 40 && analysis.overallScore < 60 && 'Necesita mejoras'}
                    {analysis.overallScore < 40 && 'Baja compatibilidad'}
                  </p>
                </div>

                {/* Breakdown - Horizontal on desktop, vertical on mobile */}
                <div className="flex-1 w-full min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Desglose</h3>
                  <div className="space-y-3">
                    {breakdownItems.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs sm:text-sm text-gray-300">{item.label}</span>
                          <span className={cn('text-xs sm:text-sm font-semibold', getTextColor(item.score))}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-700', getBarColor(item.score))}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues - Collapsible */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-4 sm:p-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-base sm:text-lg font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Problemas ({analysis.issues.length})
              </span>
              {showDetails ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-2 sm:space-y-3">
                {analysis.issues.length === 0 ? (
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs sm:text-sm text-emerald-400">¡No se encontraron problemas!</p>
                  </div>
                ) : (
                  analysis.issues.map((issue, i) => (
                    <div key={i} className={cn('p-3 sm:p-4 rounded-xl border', getIssueBg(issue.type))}>
                      <div className="flex items-start gap-2 sm:gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded mb-1">
                            {issue.category}
                          </span>
                          <p className="text-xs sm:text-sm text-gray-200 break-words">{issue.message}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 break-words">💡 {issue.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              Recomendaciones
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs flex items-center justify-center shrink-0 font-medium">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-300 break-words">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
