import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Trash2, Clock, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CVDocument } from '../../types';
import { cn } from '../../utils/cn';

interface UploadPageProps {
  cvs: CVDocument[];
  onUpload: (fileName: string, rawText: string, fileSize: number) => Promise<CVDocument>;
  onDelete: (id: string) => Promise<void>;
  onNavigateAnalysis: (cvId: string) => void;
}

export default function UploadPage({ cvs, onUpload, onDelete, onNavigateAnalysis }: UploadPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteName, setPasteName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSuccess(null);

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      setError('Formato no soportado. Usa PDF, DOC, DOCX o TXT.');
      return;
    }

    setUploading(true);

    try {
      let text = '';

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        // For PDF/DOC/DOCX, we extract what we can client-side
        // For a real app you'd use pdf.js or mammoth.js
        // Here we'll try to read as text and inform user
        try {
          const arrayBuffer = await file.arrayBuffer();
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const rawText = decoder.decode(arrayBuffer);
          // Extract readable text (filter out binary garbage)
          text = rawText
            .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t áéíóúñüÁÉÍÓÚÑÜ¿¡]/g, ' ')
            .replace(/\s{3,}/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          if (text.length < 50) {
            setError('No se pudo extraer texto del archivo. Para mejores resultados, copia y pega el contenido de tu CV directamente.');
            setPasteMode(true);
            setUploading(false);
            return;
          }
        } catch {
          setError('Error al leer el archivo. Intenta con formato TXT o pega el contenido directamente.');
          setPasteMode(true);
          setUploading(false);
          return;
        }
      }

      if (text.trim().length < 20) {
        setError('El archivo parece estar vacío o no contiene texto legible.');
        setUploading(false);
        return;
      }

      await onUpload(file.name, text, file.size);
      setSuccess(`"${file.name}" subido y analizado exitosamente.`);
    } catch (err) {
      setError('Error al procesar el archivo.');
      console.error(err);
    }

    setUploading(false);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handlePasteSubmit = useCallback(async () => {
    if (!pasteText.trim() || pasteText.trim().length < 20) {
      setError('El texto es demasiado corto. Pega el contenido completo de tu CV.');
      return;
    }
    setUploading(true);
    setError(null);
    const name = pasteName.trim() || `CV-${new Date().toLocaleDateString('es')}`;
    await onUpload(`${name}.txt`, pasteText, new Blob([pasteText]).size);
    setSuccess(`"${name}" subido y analizado exitosamente.`);
    setPasteText('');
    setPasteName('');
    setPasteMode(false);
    setUploading(false);
  }, [pasteText, pasteName, onUpload]);

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('es', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Gestión de CVs</h2>
        <p className="text-gray-400 mt-1">Sube y administra tus currículums</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-400">✕</button>
        </div>
      )}

      {/* Upload Zone / Paste Mode */}
      {!pasteMode ? (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
            dragActive
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-gray-700 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-900/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
              dragActive ? 'bg-emerald-500/20' : 'bg-gray-800'
            )}>
              <Upload className={cn('w-8 h-8', dragActive ? 'text-emerald-400' : 'text-gray-500')} />
            </div>
            <div>
              <p className="text-white font-medium">
                {uploading ? 'Procesando...' : 'Arrastra tu CV aquí o haz click para seleccionar'}
              </p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, TXT — Máx. 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6 space-y-4">
          <h3 className="text-white font-medium">📋 Pegar Contenido del CV</h3>
          <input
            type="text"
            placeholder="Nombre del CV (ej: Mi CV Profesional)"
            value={pasteName}
            onChange={(e) => setPasteName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          <textarea
            placeholder="Pega aquí el contenido completo de tu CV..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none font-mono"
          />
          <div className="flex gap-3">
            <button
              onClick={handlePasteSubmit}
              disabled={uploading || pasteText.trim().length < 20}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Procesando...' : 'Subir CV'}
            </button>
            <button
              onClick={() => setPasteMode(false)}
              className="px-6 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Toggle paste mode */}
      {!pasteMode && (
        <button
          onClick={() => setPasteMode(true)}
          className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
        >
          ¿No puedes subir el archivo? Pega el contenido directamente →
        </button>
      )}

      {/* CV List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          CVs Subidos ({cvs.length})
        </h3>

        {cvs.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay CVs subidos aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-800/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{cv.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(cv.uploadedAt)}
                    </span>
                    <span>{formatSize(cv.fileSize)}</span>
                    <span>{cv.rawText.split(/\s+/).length} palabras</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {cv.atsScore != null && (
                    <div className="text-right">
                      <p className={cn('text-xl font-bold', getScoreColor(cv.atsScore))}>
                        {cv.atsScore}%
                      </p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">ATS</p>
                    </div>
                  )}
                  <button
                    onClick={() => onNavigateAnalysis(cv.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Ver análisis"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este CV y todos sus análisis?')) {
                        onDelete(cv.id);
                      }
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
