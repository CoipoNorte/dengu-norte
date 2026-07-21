import { useState } from 'react';
import { GitCompare, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { CVDocument, JobComparison } from '../../types';
import { cn } from '../../utils/cn';
import ScoreRing from '../ScoreRing';

interface ComparePageProps {
  cvs: CVDocument[];
  onCompare: (cvId: string, jobTitle: string, jobDescription: string) => Promise<JobComparison | null>;
}

export default function ComparePage({ cvs, onCompare }: ComparePageProps) {
  const [selectedCv, setSelectedCv] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [comparison, setComparison] = useState<JobComparison | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!selectedCv || !jobDescription.trim()) return;
    setLoading(true);
    const result = await onCompare(selectedCv, jobTitle || 'Sin título', jobDescription);
    setComparison(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Comparar con Oferta Laboral</h2>
        <p className="text-gray-400 mt-1">Mide la compatibilidad de tu CV con una oferta de trabajo específica</p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Selecciona un CV</label>
            <select
              value={selectedCv}
              onChange={(e) => setSelectedCv(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="">Selecciona un CV</option>
              {cvs.map(cv => (
                <option key={cv.id} value={cv.id}>{cv.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Título del puesto</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ej: Desarrollador Frontend Senior"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Descripción de la oferta laboral</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Pega aquí la descripción completa del puesto de trabajo..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!selectedCv || !jobDescription.trim() || loading}
        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <GitCompare className={cn('w-4 h-4', loading && 'animate-spin')} />
        {loading ? 'Comparando...' : 'Comparar'}
      </button>

      {/* Results */}
      {comparison && (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score */}
            <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6 flex flex-col items-center">
              <h3 className="text-sm text-gray-400 mb-4">Compatibilidad</h3>
              <ScoreRing score={comparison.matchScore} size={160} strokeWidth={10} label="Match" />
              <p className="mt-4 text-sm text-gray-400 text-center">
                {comparison.matchScore >= 70 ? '¡Alta compatibilidad!' :
                 comparison.matchScore >= 40 ? 'Compatibilidad moderada' :
                 'Baja compatibilidad'}
              </p>
            </div>

            {/* Keywords Match */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Análisis de Palabras Clave</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched */}
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Encontradas ({comparison.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.matchedKeywords.slice(0, 20).map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                        {kw}
                      </span>
                    ))}
                    {comparison.matchedKeywords.length === 0 && (
                      <p className="text-xs text-gray-600">Ninguna palabra clave coincide</p>
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Faltantes ({comparison.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.missingKeywords.slice(0, 20).map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {kw}
                      </span>
                    ))}
                    {comparison.missingKeywords.length === 0 && (
                      <p className="text-xs text-emerald-400">¡Todas las palabras clave están cubiertas!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📋 Recomendaciones</h3>
            <div className="space-y-3">
              {comparison.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30">
                  <ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
