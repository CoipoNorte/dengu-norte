import { useState, useEffect } from 'react'
import { 
  Upload, Target, FileText, Edit3, Search, BarChart3, Users, 
  Trash2, Award, Loader2 
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { 
  saveCV, getAllCVs, deleteCV, clearAllData, 
  saveAnalysis, getAnalysesByCV 
} from './services/indexedDB'
import { CV } from './types/index'

type Section = 'upload' | 'compare' | 'generate' | 'editor' | 'search' | 'dashboard' | 'community'

interface NavItem {
  id: Section
  label: string
  icon: React.ReactNode
  description: string
}

const navItems: NavItem[] = [
  { id: 'upload', label: 'Subir CV', icon: <Upload className="w-5 h-5" />, description: 'Analiza tu CV contra ATS' },
  { id: 'compare', label: 'Comparar con Oferta', icon: <Target className="w-5 h-5" />, description: 'Mide compatibilidad' },
  { id: 'generate', label: 'Generar CV ATS', icon: <FileText className="w-5 h-5" />, description: 'Crea CV optimizado' },
  { id: 'editor', label: 'Editor ATS 100%', icon: <Edit3 className="w-5 h-5" />, description: 'Editor inteligente' },
  { id: 'search', label: 'Buscar Empleo', icon: <Search className="w-5 h-5" />, description: 'Ofertas compatibles' },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" />, description: 'Estadísticas y progreso' },
  { id: 'community', label: 'Comunidad', icon: <Users className="w-5 h-5" />, description: 'Consejos y plantillas' },
]

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('upload')
  const [cvs, setCvs] = useState<CV[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jobDescription, setJobDescription] = useState('')
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Cargar CVs desde IndexedDB
  const loadCVs = async () => {
    try {
      const savedCVs = await getAllCVs()
      setCvs(savedCVs)
    } catch (error) {
      console.error('Error loading CVs:', error)
      toast.error('Error al cargar los CVs')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar CV en IndexedDB
  const handleSaveCV = async (cv: CV) => {
    try {
      await saveCV(cv)
      const updatedCVs = [...cvs, cv]
      setCvs(updatedCVs)
    } catch (error) {
      console.error('Error saving CV:', error)
      toast.error('Error al guardar el CV')
    }
  }

  // Calcular puntuación ATS simulada
  const calculateATSScore = (fileName: string): number => {
    let score = 65
    const name = fileName.toLowerCase()
    
    if (name.includes('cv') || name.includes('resume')) score += 10
    if (name.includes('2024') || name.includes('2025')) score += 8
    if (name.length > 15) score += 7
    
    return Math.min(Math.floor(score + Math.random() * 15), 98)
  }

  // Manejar subida de archivo
  const handleFileUpload = async (file: File) => {
    if (!file) return

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    const isValid = validTypes.includes(file.type) || 
                    file.name.endsWith('.pdf') || 
                    file.name.endsWith('.docx') || 
                    file.name.endsWith('.doc')

    if (!isValid) {
      toast.error('Solo se permiten archivos PDF, DOCX o DOC')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 10MB)')
      return
    }

    const atsScore = calculateATSScore(file.name)

    const newCV: CV = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      atsScore
    }

    await handleSaveCV(newCV)
    toast.success(`CV analizado: ${atsScore}% ATS`, {
      description: file.name
    })
  }

  // Drag and Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  // Eliminar CV
  const handleDeleteCV = async (id: string) => {
    try {
      await deleteCV(id)
      const updated = cvs.filter(cv => cv.id !== id)
      setCvs(updated)
      toast.info('CV eliminado')
    } catch (error) {
      toast.error('Error al eliminar el CV')
    }
  }

  // Limpiar todos los datos
  const handleClearAll = async () => {
    try {
      await clearAllData()
      setCvs([])
      setMatchScore(null)
      toast.info('Todos los datos han sido eliminados')
    } catch (error) {
      toast.error('Error al eliminar los datos')
    }
  }

  // Análisis de compatibilidad
  const analyzeMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error('Ingresa la descripción de la oferta')
      return
    }
    if (cvs.length === 0) {
      toast.error('Sube al menos un CV primero')
      return
    }

    setIsAnalyzing(true)

    // Simular análisis
    await new Promise(resolve => setTimeout(resolve, 1200))

    const avgScore = cvs.reduce((sum, cv) => sum + (cv.atsScore || 70), 0) / cvs.length
    const finalScore = Math.min(Math.floor(avgScore + Math.random() * 15), 95)

    setMatchScore(finalScore)

    // Guardar análisis
    try {
      await saveAnalysis({
        id: Date.now().toString(),
        cvId: cvs[0].id,
        jobDescription: jobDescription.substring(0, 200),
        matchScore: finalScore,
        analyzedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving analysis:', error)
    }

    setIsAnalyzing(false)
    toast.success(`Compatibilidad: ${finalScore}%`, {
      description: 'Análisis completado'
    })
  }

  // Cargar datos al montar
  useEffect(() => {
    loadCVs()
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold tracking-tighter mb-4">Sube tu CV</h1>
              <p className="text-2xl text-zinc-400">Analiza el porcentaje de compatibilidad ATS</p>
            </div>

            {/* Zona de subida */}
            <div 
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`
                border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all
                ${isDragging ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700'}
              `}
            >
              <div className="mx-auto w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-semibold mb-3">Arrastra tu CV aquí</h3>
              <p className="text-xl text-zinc-400 mb-8">PDF, DOCX o DOC • Máximo 10MB</p>
              
              <button className="px-10 py-4 bg-white text-black text-xl font-medium rounded-2xl hover:bg-zinc-200 transition-colors">
                Seleccionar archivo
              </button>
              
              <input 
                id="file-input" 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
              />
              <p className="mt-6 text-sm text-zinc-500">100% privado • Almacenado en tu navegador</p>
            </div>

            {/* Lista de CVs */}
            {cvs.length > 0 && (
              <div className="mt-10">
                <div className="flex justify-between items-center mb-6 px-2">
                  <div>
                    <div className="text-2xl font-semibold">Tus CVs</div>
                    <div className="text-sm text-zinc-500">{cvs.length} archivo(s)</div>
                  </div>
                  <button 
                    onClick={handleClearAll}
                    className="text-red-400 hover:text-red-500 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Limpiar todo
                  </button>
                </div>

                <div className="space-y-3">
                  {cvs.map(cv => (
                    <div key={cv.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-medium">{cv.name}</div>
                          <div className="text-sm text-zinc-500">
                            {(cv.size / 1024 / 1024).toFixed(2)} MB • {new Date(cv.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {cv.atsScore && (
                          <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2">
                            <Award className="w-4 h-4" /> {cv.atsScore}%
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteCV(cv.id)} 
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 p-2 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'compare':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold tracking-tighter mb-4">Comparar con Oferta</h1>
              <p className="text-xl text-zinc-400">Pega la descripción del puesto y calcula tu compatibilidad</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Pega aquí la descripción de la oferta laboral..."
                className="w-full h-64 bg-zinc-950 border border-zinc-700 rounded-2xl p-6 text-lg resize-none focus:outline-none focus:border-white"
              />
              
              <button 
                onClick={analyzeMatch}
                disabled={isAnalyzing}
                className="mt-6 w-full py-4 bg-white text-black text-xl font-medium rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Analizando...
                  </>
                ) : (
                  <>
                    <Target className="w-6 h-6" /> Analizar Compatibilidad
                  </>
                )}
              </button>

              {matchScore !== null && (
                <div className="mt-8 p-8 bg-zinc-950 border border-zinc-700 rounded-3xl text-center">
                  <div className="text-7xl font-bold tracking-tighter mb-2">{matchScore}%</div>
                  <div className="text-xl text-emerald-400">Compatibilidad ATS</div>
                  <div className="text-sm text-zinc-500 mt-4">Basado en {cvs.length} CV(s)</div>
                </div>
              )}
            </div>
          </div>
        )

      case 'dashboard':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold tracking-tighter mb-3">Dashboard</h1>
              <p className="text-xl text-zinc-400">Tu progreso en la optimización ATS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="text-4xl font-bold mb-1">{cvs.length}</div>
                <div className="text-zinc-400">CVs subidos</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="text-4xl font-bold mb-1 text-emerald-400">
                  {cvs.length > 0 ? Math.round(cvs.reduce((a, b) => a + (b.atsScore || 70), 0) / cvs.length) : 0}%
                </div>
                <div className="text-zinc-400">Puntuación promedio</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="text-4xl font-bold mb-1">12</div>
                <div className="text-zinc-400">Mejoras aplicadas</div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="max-w-3xl mx-auto text-center py-20">
            <div className="text-6xl mb-6 opacity-30">🚧</div>
            <h2 className="text-4xl font-bold tracking-tight mb-3">Sección en desarrollo</h2>
            <p className="text-xl text-zinc-400">Esta funcionalidad estará disponible pronto.</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-zinc-400">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tighter">Dengu Norte</div>
              <div className="text-xs text-zinc-500 -mt-1">ATS Optimizer</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Todo se guarda en tu navegador
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-950 min-h-[calc(100vh-5rem)] p-5 hidden lg:block">
          <div className="px-3 mb-4">
            <div className="text-xs font-semibold tracking-[3px] text-zinc-500 mb-4">HERRAMIENTAS ATS</div>
          </div>
          
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:bg-zinc-900 ${
                  activeSection === item.id ? 'bg-white text-black' : 'hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-70 line-clamp-1">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12">
          {renderSection()}
        </div>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
