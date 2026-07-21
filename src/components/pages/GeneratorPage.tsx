import { useState } from 'react';
import { Wand2, Download, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import type { CVDocument, OptimizedCV } from '../../types';
import { cn } from '../../utils/cn';
import ScoreRing from '../ScoreRing';

interface GeneratorPageProps {
  cvs: CVDocument[];
  onOptimize: (cvId: string) => Promise<OptimizedCV | null>;
}

export default function GeneratorPage({ cvs, onOptimize }: GeneratorPageProps) {
  const [selected, setSelected] = useState('');
  const [optimized, setOptimized] = useState<OptimizedCV | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!selected) return;
    setLoading(true);
    const result = await onOptimize(selected);
    setOptimized(result);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!optimized) return;
    await navigator.clipboard.writeText(optimized.optimizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!optimized) return;
    const blob = new Blob([optimized.optimizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cv = cvs.find(c => c.id === optimized.originalCvId);
    a.download = `${cv?.name || 'CV'}_optimizado_ATS.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const originalCv = cvs.find(c => c.id === selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Generador de CV ATS</h2>
        <p className="text-gray-400 mt-1">Genera una versión optimizada de tu CV para sistemas ATS</p>
      </div>

      {/* CV Selector */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setOptimized(null); }}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="">Selecciona un CV para optimizar</option>
          {cvs.map(cv => (
            <option key={cv.id} value={cv.id}>
              {cv.name} {cv.atsScore ? `(Score actual: ${cv.atsScore}%)` : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handleOptimize}
          disabled={!selected || loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Wand2 className={cn('w-4 h-4', loading && 'animate-spin')} />
          {loading ? 'Generando...' : 'Generar CV Optimizado'}
        </button>
      </div>

      {/* No CV selected */}
      {!optimized && !loading && (
        <div className="text-center py-16 text-gray-600">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Selecciona un CV para generar la versión optimizada</p>
          <p className="text-sm mt-1">El generador reorganiza y mejora tu CV para máxima compatibilidad ATS</p>
        </div>
      )}

      {/* Results */}
      {optimized && (
        <div className="space-y-6">
          {/* Score Comparison */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Comparación de Scores</h3>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <ScoreRing score={originalCv?.atsScore || 0} size={120} strokeWidth={8} label="Original" />
                <p className="text-sm text-gray-400 mt-2">Score Original</p>
              </div>
              <div className="text-emerald-400 text-2xl">→</div>
              <div className="text-center">
                <ScoreRing score={optimized.newScore} size={120} strokeWidth={8} label="Optimizado" />
                <p className="text-sm text-gray-400 mt-2">Score Optimizado</p>
              </div>
              <div className="ml-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-3xl font-bold text-emerald-400">
                  +{optimized.newScore - (originalCv?.atsScore || 0)}%
                </p>
                <p className="text-xs text-emerald-400/70">Mejora</p>
              </div>
            </div>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Mejoras Aplicadas ({optimized.improvements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {optimized.improvements.map((imp, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-sm text-gray-300">{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optimized CV Text */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">CV Optimizado</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-950 rounded-xl p-6 max-h-[600px] overflow-y-auto font-mono leading-relaxed border border-gray-800">
              {optimized.optimizedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
