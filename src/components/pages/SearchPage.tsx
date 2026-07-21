import { useState } from 'react';
import { Search, Briefcase, MapPin, Star, TrendingUp } from 'lucide-react';
import type { CVDocument, JobListing } from '../../types';
import { searchJobs } from '../../services/atsEngine';
import { cn } from '../../utils/cn';

interface SearchPageProps {
  cvs: CVDocument[];
}

export default function SearchPage({ cvs }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [selectedCv, setSelectedCv] = useState('');
  const [results, setResults] = useState<JobListing[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const cv = cvs.find(c => c.id === selectedCv);
    const keywords = cv ? cv.keywords : [];
    const jobs = searchJobs(keywords, query);
    setResults(jobs);
    setSearched(true);
  };

  const getMatchColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Búsqueda de Empleo</h2>
        <p className="text-gray-400 mt-1">Encuentra ofertas laborales compatibles con tu perfil</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedCv}
          onChange={(e) => setSelectedCv(e.target.value)}
          className="sm:w-64 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="">Usar mi CV (opcional)</option>
          {cvs.map(cv => (
            <option key={cv.id} value={cv.id}>{cv.name}</option>
          ))}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por puesto, tecnología o palabra clave..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Buscar
        </button>
      </div>

      {/* Results */}
      {!searched ? (
        <div className="text-center py-16 text-gray-600">
          <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Busca ofertas laborales</p>
          <p className="text-sm mt-1">Selecciona tu CV para ver el porcentaje de compatibilidad</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No se encontraron resultados</p>
          <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{results.length} ofertas encontradas</p>
          {results.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-gray-800/50 bg-gray-900/30 hover:bg-gray-900/50 p-6 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                    {selectedCv && job.matchScore !== undefined && (
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1',
                        getMatchColor(job.matchScore)
                      )}>
                        <TrendingUp className="w-3 h-3" />
                        {job.matchScore}% match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Remoto / Híbrido
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-400 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.keywords.slice(0, 6).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCv && job.matchScore !== undefined && (
                  <div className="shrink-0 text-center">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center',
                      job.matchScore >= 70 ? 'bg-emerald-500/10' :
                      job.matchScore >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
                    )}>
                      <Star className={cn('w-8 h-8',
                        job.matchScore >= 70 ? 'text-emerald-400' :
                        job.matchScore >= 40 ? 'text-amber-400' : 'text-red-400'
                      )} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="text-center py-8">
            <p className="text-sm text-gray-600">
              💡 Estas son ofertas simuladas basadas en tu perfil.
              <br />Para ofertas reales, visita plataformas como LinkedIn, InfoJobs o Indeed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
