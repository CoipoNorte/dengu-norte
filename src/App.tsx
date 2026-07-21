import { Upload, Target } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tighter">Dengu Norte</div>
              <div className="text-xs text-gray-500 -mt-1">ATS Optimizer</div>
            </div>
          </div>
          <button className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium">Iniciar sesión</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold tracking-tighter mb-4">Sube tu CV</h1>
          <p className="text-2xl text-gray-600">Analiza el porcentaje de compatibilidad ATS</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 hover:border-black transition-colors rounded-3xl p-20 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-4xl font-semibold mb-3">Arrastra tu CV aquí</h3>
          <p className="text-xl text-gray-600 mb-10">PDF, DOCX o DOC • Máximo 10MB</p>
          
          <button 
            onClick={() => alert('¡Funcionalidad lista para implementar!')}
            className="px-12 py-4 bg-black text-white text-xl font-medium rounded-2xl hover:bg-gray-900"
          >
            Seleccionar archivo
          </button>
          
          <p className="mt-8 text-sm text-gray-500">Procesamiento 100% local</p>
        </div>
      </div>
    </div>
  )
}
