import { FileText, BarChart3, TrendingUp, TrendingDown, Target, GitCompare } from 'lucide-react';
import type { DashboardStats } from '../../types';
import ScoreRing from '../ScoreRing';
import { cn } from '../../utils/cn';

interface DashboardPageProps {
  stats: DashboardStats;
}

export default function DashboardPage({ stats }: DashboardPageProps) {
  const statCards = [
    { label: 'CVs Subidos', value: stats.totalCVs, icon: FileText, color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20', iconColor: 'text-blue-400' },
    { label: 'Análisis Realizados', value: stats.totalAnalyses, icon: BarChart3, color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20', iconColor: 'text-purple-400' },
    { label: 'Comparaciones', value: stats.totalComparisons, icon: GitCompare, color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20', iconColor: 'text-cyan-400' },
    { label: 'Score Máximo', value: stats.highestScore ? `${stats.highestScore}%` : '-', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20', iconColor: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Resumen general de tu progreso con ATS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'rounded-2xl border bg-gradient-to-br p-5 transition-all hover:scale-[1.02]',
              card.color
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <card.icon className={cn('w-10 h-10 opacity-60', card.iconColor)} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Overview */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Score ATS Promedio
          </h3>
          <div className="flex flex-col items-center">
            <ScoreRing score={stats.averageAtsScore} size={160} strokeWidth={10} label="Promedio" />
            <div className="mt-6 w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Más alto
                </span>
                <span className="text-white font-semibold">{stats.highestScore || 0}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Más bajo
                </span>
                <span className="text-white font-semibold">{stats.lowestScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score History */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Historial de Puntuaciones
          </h3>
          {stats.scoreHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Sube tu primer CV para ver el historial</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-40">
                {stats.scoreHistory.slice(-12).map((entry, i) => {
                  const height = `${Math.max(8, entry.score)}%`;
                  const getBarColor = (s: number) => {
                    if (s >= 80) return 'bg-emerald-500';
                    if (s >= 60) return 'bg-amber-500';
                    if (s >= 40) return 'bg-orange-500';
                    return 'bg-red-500';
                  };
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] text-gray-500">{entry.score}%</span>
                      <div
                        className={cn('w-full rounded-t-lg transition-all', getBarColor(entry.score))}
                        style={{ height, minHeight: '8px', opacity: 0.8 }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Labels */}
              <div className="flex gap-2">
                {stats.scoreHistory.slice(-12).map((entry, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p className="text-[9px] text-gray-600 truncate">{entry.cvName.slice(0, 8)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Consejos para Mejorar tu Score ATS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { tip: 'Usa formato de una sola columna', desc: 'Los ATS tienen dificultades con layouts complejos.' },
            { tip: 'Incluye palabras clave de la oferta', desc: 'Personaliza tu CV para cada puesto.' },
            { tip: 'Usa verbos de acción', desc: 'Lideré, implementé, desarrollé, optimicé...' },
            { tip: 'Cuantifica tus logros', desc: 'Usa porcentajes, cifras y métricas concretas.' },
            { tip: 'Secciones claras y estándar', desc: 'Experiencia, Educación, Habilidades, etc.' },
            { tip: 'Evita imágenes y gráficos', desc: 'Los ATS no pueden leer contenido visual.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/30">
              <p className="text-sm font-medium text-white">{item.tip}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
