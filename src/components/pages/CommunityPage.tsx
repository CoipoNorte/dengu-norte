import { FileText, Download, BookOpen, Lightbulb, CheckCircle2, ExternalLink } from 'lucide-react';

const tips = [
  {
    title: 'Formato de una sola columna',
    category: 'Formato',
    content: 'Los ATS leen documentos de arriba a abajo. Las columnas múltiples confunden a la mayoría de los sistemas. Usa siempre un diseño de una sola columna.',
    icon: '📄',
  },
  {
    title: 'Encabezados estándar',
    category: 'Estructura',
    content: 'Usa nombres de sección reconocibles: "Experiencia Laboral", "Educación", "Habilidades". Evita creatividad en los nombres de sección.',
    icon: '📋',
  },
  {
    title: 'Palabras clave de la oferta',
    category: 'Keywords',
    content: 'Lee cuidadosamente la descripción del puesto y asegúrate de incluir las palabras clave exactas que usan. Los ATS buscan coincidencias textuales.',
    icon: '🔑',
  },
  {
    title: 'Cuantifica tus logros',
    category: 'Contenido',
    content: 'En vez de "Mejoré las ventas", escribe "Aumenté las ventas en un 35% en 6 meses". Los números llaman la atención tanto de ATS como de reclutadores.',
    icon: '📊',
  },
  {
    title: 'Evita tablas e imágenes',
    category: 'Formato',
    content: 'Los ATS no pueden interpretar imágenes, gráficos ni tablas. Todo el contenido importante debe ser texto plano.',
    icon: '🚫',
  },
  {
    title: 'Formato de archivo',
    category: 'Técnico',
    content: 'DOCX y PDF son los formatos más seguros. Algunos ATS antiguos tienen problemas con PDFs complejos. Si puedes, ofrece ambas opciones.',
    icon: '💾',
  },
  {
    title: 'LinkedIn consistente',
    category: 'Contacto',
    content: 'Asegúrate de que tu perfil de LinkedIn coincida con la información de tu CV. Los reclutadores verificarán ambos.',
    icon: '🔗',
  },
  {
    title: 'Verbos de acción',
    category: 'Contenido',
    content: 'Comienza cada punto de experiencia con un verbo fuerte: Lideré, Implementé, Desarrollé, Optimicé, Gestioné, Analicé.',
    icon: '💪',
  },
];

const templates = [
  {
    name: 'CV Profesional Genérico',
    description: 'Plantilla versátil para cualquier industria',
    content: `=== DATOS DE CONTACTO ===
[Tu Nombre Completo]
[email@ejemplo.com] | [+34 600 000 000] | [LinkedIn URL]
[Ciudad, País]

=== RESUMEN PROFESIONAL ===
Profesional con [X] años de experiencia en [industria/campo]. Especializado en [habilidades principales]. Demostrada capacidad para [logro principal]. Buscando contribuir en [tipo de rol/empresa].

=== EXPERIENCIA LABORAL ===

[Título del Puesto] | [Empresa] | [Mes Año] - Presente
- Lideré [proyecto/equipo] que resultó en [resultado cuantificable]
- Implementé [solución] que mejoró [métrica] en [X%]
- Gestioné [responsabilidad] para [resultado]
- Colaboré con [equipos/departamentos] para [objetivo]

[Título del Puesto] | [Empresa] | [Mes Año] - [Mes Año]
- Desarrollé [proyecto] que generó [resultado]
- Optimicé [proceso] reduciendo [métrica] en [X%]
- Capacité a [número] personas en [tema]

=== EDUCACIÓN ===
[Título] | [Universidad/Institución] | [Año]
[Certificaciones relevantes]

=== HABILIDADES ===
Técnicas: [Habilidad 1, Habilidad 2, Habilidad 3, Habilidad 4]
Blandas: [Liderazgo, Comunicación, Trabajo en equipo, Resolución de problemas]
Herramientas: [Herramienta 1, Herramienta 2, Herramienta 3]

=== IDIOMAS ===
Español: Nativo
Inglés: [Nivel]
[Otros idiomas]`,
  },
  {
    name: 'CV Tecnología / IT',
    description: 'Optimizado para roles técnicos y de desarrollo',
    content: `=== DATOS DE CONTACTO ===
[Tu Nombre Completo]
[email@ejemplo.com] | [+34 600 000 000] | [LinkedIn URL] | [GitHub URL]
[Ciudad, País]

=== RESUMEN PROFESIONAL ===
Ingeniero de Software / Desarrollador con [X] años de experiencia en desarrollo de aplicaciones web/móviles. Stack principal: [React, Node.js, Python, etc.]. Experiencia en metodologías ágiles (Scrum/Kanban). Apasionado por crear soluciones escalables y eficientes.

=== HABILIDADES TÉCNICAS ===
Lenguajes: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, Django, Spring Boot
Bases de Datos: PostgreSQL, MongoDB, Redis
DevOps: Docker, Kubernetes, AWS, CI/CD
Herramientas: Git, Jira, Figma, VS Code

=== EXPERIENCIA LABORAL ===

[Título] | [Empresa] | [Mes Año] - Presente
- Desarrollé aplicación web con React y Node.js que sirve a [X] usuarios activos
- Implementé pipeline CI/CD que redujo el tiempo de deploy en 60%
- Optimicé consultas de base de datos mejorando el rendimiento en 40%
- Lideré equipo de [X] desarrolladores usando metodología Scrum

[Título] | [Empresa] | [Mes Año] - [Mes Año]
- Construí API RESTful que procesa [X] requests/día
- Migré sistema legado a arquitectura de microservicios
- Implementé tests automatizados alcanzando 85% de cobertura

=== EDUCACIÓN ===
[Título en Ingeniería/Informática] | [Universidad] | [Año]

=== CERTIFICACIONES ===
AWS Certified Developer | [Año]
[Otras certificaciones relevantes]

=== IDIOMAS ===
Español: Nativo
Inglés: Avanzado (C1)`,
  },
  {
    name: 'CV Marketing Digital',
    description: 'Para roles de marketing, comunicación y digital',
    content: `=== DATOS DE CONTACTO ===
[Tu Nombre Completo]
[email@ejemplo.com] | [+34 600 000 000] | [LinkedIn URL] | [Portfolio URL]
[Ciudad, País]

=== RESUMEN PROFESIONAL ===
Especialista en Marketing Digital con [X] años de experiencia en estrategias de adquisición y retención. Experto en SEO, SEM, redes sociales y email marketing. Historial comprobado de incrementar tráfico web y conversiones.

=== EXPERIENCIA LABORAL ===

[Título] | [Empresa] | [Mes Año] - Presente
- Gestioné presupuesto de publicidad digital de [€X] con ROI de [X%]
- Aumenté tráfico orgánico en 150% mediante estrategia SEO
- Lideré campañas de email marketing con tasa de apertura del 35%
- Incrementé seguidores en redes sociales en 200% en [X] meses

[Título] | [Empresa] | [Mes Año] - [Mes Año]
- Diseñé y ejecuté estrategia de contenidos para [X] plataformas
- Optimicé landing pages aumentando conversiones en 45%
- Analicé métricas con Google Analytics para toma de decisiones

=== HABILIDADES ===
SEO/SEM: Google Ads, SEMrush, Ahrefs, Google Search Console
Redes Sociales: Meta Business Suite, Hootsuite, Buffer
Email Marketing: Mailchimp, HubSpot, ActiveCampaign
Analítica: Google Analytics 4, Data Studio, Tag Manager
Diseño: Canva, Adobe Creative Suite, Figma
CMS: WordPress, Shopify

=== EDUCACIÓN ===
[Título] | [Universidad] | [Año]

=== CERTIFICACIONES ===
Google Analytics Certified | [Año]
Google Ads Certified | [Año]
HubSpot Inbound Marketing | [Año]

=== IDIOMAS ===
Español: Nativo
Inglés: Avanzado`,
  },
];

export default function CommunityPage() {
  const handleDownloadTemplate = (template: typeof templates[0]) => {
    const blob = new Blob([template.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTemplate = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Comunidad & Recursos</h2>
        <p className="text-gray-400 mt-1">Consejos, plantillas y mejores prácticas para optimizar tu CV</p>
      </div>

      {/* Tips Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Consejos para CV ATS-Friendly
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-800/50 bg-gray-900/30 p-5 hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{tip.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px] uppercase tracking-wider">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Plantillas Optimizadas para ATS
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {templates.map((template, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-800/50 bg-gray-900/30 p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{template.name}</h4>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </div>
              </div>
              <pre className="flex-1 text-[10px] text-gray-600 bg-gray-950 rounded-xl p-3 mb-4 overflow-hidden max-h-36 font-mono leading-relaxed">
                {template.content.slice(0, 300)}...
              </pre>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
                <button
                  onClick={() => handleCopyTemplate(template.content)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Copiar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          Recursos Adicionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'LinkedIn', url: 'https://linkedin.com', desc: 'Red profesional #1' },
            { name: 'InfoJobs', url: 'https://infojobs.net', desc: 'Portal de empleo España' },
            { name: 'Indeed', url: 'https://indeed.com', desc: 'Buscador de empleo global' },
            { name: 'Glassdoor', url: 'https://glassdoor.com', desc: 'Reviews de empresas' },
          ].map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800/30 hover:border-purple-500/30 transition-colors group"
            >
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              <div>
                <p className="text-sm text-white font-medium">{resource.name}</p>
                <p className="text-xs text-gray-500">{resource.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <p className="text-sm text-emerald-400">
            🔒 100% Privado — Todos tus datos permanecen en tu navegador
          </p>
        </div>
      </div>
    </div>
  );
}
