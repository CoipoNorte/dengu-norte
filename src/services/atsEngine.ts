// ==========================================
// ATS Analysis Engine - Client-side CV analysis
// ==========================================

import type { CVDocument, CVSections, ATSAnalysis, ATSBreakdown, ATSIssue, JobComparison, OptimizedCV } from '../types';

// Common ATS keywords by category
const ATS_POWER_WORDS = [
  'managed', 'developed', 'implemented', 'designed', 'created', 'led',
  'achieved', 'improved', 'increased', 'decreased', 'reduced', 'optimized',
  'collaborated', 'coordinated', 'analyzed', 'delivered', 'executed',
  'established', 'generated', 'launched', 'maintained', 'negotiated',
  'organized', 'planned', 'produced', 'resolved', 'streamlined',
  'supervised', 'trained', 'transformed', 'gestioné', 'desarrollé',
  'implementé', 'diseñé', 'lideré', 'logré', 'mejoré', 'optimicé',
  'colaboré', 'coordiné', 'analicé', 'entregué', 'ejecuté',
];

const SECTION_HEADERS_EN = [
  'experience', 'work experience', 'professional experience', 'employment',
  'education', 'skills', 'technical skills', 'summary', 'profile',
  'professional summary', 'objective', 'certifications', 'certificates',
  'languages', 'projects', 'achievements', 'awards', 'references',
  'contact', 'volunteer',
];

const SECTION_HEADERS_ES = [
  'experiencia', 'experiencia laboral', 'experiencia profesional', 'empleo',
  'educación', 'formación', 'habilidades', 'competencias', 'resumen',
  'perfil', 'perfil profesional', 'objetivo', 'certificaciones',
  'idiomas', 'proyectos', 'logros', 'premios', 'referencias',
  'contacto', 'voluntariado', 'datos personales',
];

const ALL_SECTION_HEADERS = [...SECTION_HEADERS_EN, ...SECTION_HEADERS_ES];

// Generate unique ID
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ========== Text Extraction & Parsing ==========

export function parseRawText(text: string): CVSections {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const sections: CVSections = {
    contactInfo: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    certifications: '',
    languages: '',
    other: '',
  };

  let currentSection: keyof CVSections = 'contactInfo';

  for (const line of lines) {
    const lower = line.toLowerCase().replace(/[^a-záéíóúñü\s]/g, '').trim();

    if (lower.includes('experiencia') || lower.includes('experience') || lower.includes('employment') || lower.includes('empleo')) {
      currentSection = 'experience';
      continue;
    } else if (lower.includes('educación') || lower.includes('education') || lower.includes('formación') || lower.includes('academic')) {
      currentSection = 'education';
      continue;
    } else if (lower.includes('habilidad') || lower.includes('skill') || lower.includes('competencia') || lower.includes('technical')) {
      currentSection = 'skills';
      continue;
    } else if (lower.includes('resumen') || lower.includes('summary') || lower.includes('perfil') || lower.includes('profile') || lower.includes('objetivo') || lower.includes('objective')) {
      currentSection = 'summary';
      continue;
    } else if (lower.includes('certificación') || lower.includes('certification') || lower.includes('certificado') || lower.includes('certificate')) {
      currentSection = 'certifications';
      continue;
    } else if (lower.includes('idioma') || lower.includes('language')) {
      currentSection = 'languages';
      continue;
    } else if (lower.includes('contacto') || lower.includes('contact') || lower.includes('datos personales')) {
      currentSection = 'contactInfo';
      continue;
    }

    sections[currentSection] += line + '\n';
  }

  return sections;
}

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s\-\.\/\+\#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Extract multi-word phrases (bigrams)
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  // Deduplicate
  const unique = [...new Set([...words, ...bigrams])];
  return unique.filter(w => w.length > 2);
}

// ========== ATS Analysis ==========

export function analyzeATS(cv: CVDocument): ATSAnalysis {
  const text = cv.rawText;
  const sections = cv.sections;
  const issues: ATSIssue[] = [];
  const recommendations: string[] = [];

  // 1. Formatting Score (0-100)
  let formattingScore = 80;

  // Check for special characters that ATS can't read
  const specialChars = (text.match(/[│┃┆┇┊┋║═╔╗╚╝╠╣╦╩╬★☆●◆◇▪▫♦♣♠♥✓✗✘→←↑↓⇒⇐⇑⇓]/g) || []).length;
  if (specialChars > 0) {
    formattingScore -= Math.min(30, specialChars * 5);
    issues.push({
      type: 'error',
      category: 'Formato',
      message: `Se detectaron ${specialChars} caracteres especiales que los ATS no pueden leer.`,
      suggestion: 'Reemplaza viñetas decorativas por guiones (-) o puntos simples (•).',
    });
  }

  // Check for tables (indicated by multiple tabs)
  const tabCount = (text.match(/\t/g) || []).length;
  if (tabCount > 10) {
    formattingScore -= 15;
    issues.push({
      type: 'warning',
      category: 'Formato',
      message: 'El CV parece contener tablas o columnas múltiples.',
      suggestion: 'Usa un formato de una sola columna para mejor compatibilidad ATS.',
    });
  }

  // Check text length
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 100) {
    formattingScore -= 20;
    issues.push({
      type: 'warning',
      category: 'Contenido',
      message: 'El CV tiene muy poco contenido.',
      suggestion: 'Agrega más detalles sobre tu experiencia, habilidades y logros.',
    });
  }

  // 2. Keywords Score (0-100)
  let keywordsScore = 50;
  const textLower = text.toLowerCase();
  const foundPowerWords = ATS_POWER_WORDS.filter(w => textLower.includes(w));
  keywordsScore = Math.min(100, 30 + foundPowerWords.length * 5);

  if (foundPowerWords.length < 5) {
    issues.push({
      type: 'warning',
      category: 'Palabras Clave',
      message: `Solo se encontraron ${foundPowerWords.length} verbos de acción.`,
      suggestion: 'Usa más verbos de acción como: lideré, implementé, desarrollé, optimicé, gestioné.',
    });
    recommendations.push('Añade más verbos de acción al describir tu experiencia laboral.');
  }

  // Check for numbers/metrics
  const numbers = (text.match(/\d+%|\d+\+|\$\d+|\d+\.\d+/g) || []).length;
  if (numbers < 3) {
    keywordsScore -= 10;
    issues.push({
      type: 'info',
      category: 'Métricas',
      message: 'Pocas métricas cuantificables detectadas.',
      suggestion: 'Incluye logros con números: "Aumenté ventas en 25%", "Gestioné equipo de 10 personas".',
    });
    recommendations.push('Cuantifica tus logros con porcentajes, montos y cifras específicas.');
  }

  // 3. Structure Score (0-100)
  let structureScore = 30;
  const foundSections: string[] = [];

  for (const header of ALL_SECTION_HEADERS) {
    if (textLower.includes(header)) {
      foundSections.push(header);
      structureScore += 8;
    }
  }

  structureScore = Math.min(100, structureScore);

  if (!sections.experience.trim()) {
    issues.push({
      type: 'error',
      category: 'Estructura',
      message: 'No se detectó una sección de Experiencia Laboral.',
      suggestion: 'Agrega una sección clara de "Experiencia Laboral" o "Work Experience".',
    });
    recommendations.push('Añade una sección de Experiencia Laboral con títulos claros.');
  }

  if (!sections.education.trim()) {
    issues.push({
      type: 'warning',
      category: 'Estructura',
      message: 'No se detectó una sección de Educación.',
      suggestion: 'Incluye tu formación académica.',
    });
  }

  if (!sections.skills.trim()) {
    issues.push({
      type: 'warning',
      category: 'Estructura',
      message: 'No se detectó una sección de Habilidades.',
      suggestion: 'Agrega una sección de "Habilidades" o "Skills" con palabras clave relevantes.',
    });
    recommendations.push('Incluye una sección de Habilidades técnicas y blandas.');
  }

  if (!sections.summary.trim()) {
    issues.push({
      type: 'info',
      category: 'Estructura',
      message: 'No se detectó un Resumen Profesional.',
      suggestion: 'Un resumen breve (3-4 líneas) al inicio mejora la compatibilidad ATS.',
    });
  }

  // 4. Readability Score (0-100)
  let readabilityScore = 70;

  // Check line lengths
  const lines = text.split('\n');
  const longLines = lines.filter(l => l.length > 120).length;
  if (longLines > 5) {
    readabilityScore -= 15;
    issues.push({
      type: 'info',
      category: 'Legibilidad',
      message: 'Algunas líneas son demasiado largas.',
      suggestion: 'Mantén las líneas cortas y usa viñetas para facilitar la lectura.',
    });
  }

  // Check for email and phone
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /[\+]?[\d\s\-\(\)]{7,}/.test(text);

  if (!hasEmail) {
    readabilityScore -= 10;
    issues.push({
      type: 'error',
      category: 'Contacto',
      message: 'No se detectó un email de contacto.',
      suggestion: 'Incluye tu dirección de correo electrónico.',
    });
  }

  if (!hasPhone) {
    readabilityScore -= 5;
    issues.push({
      type: 'warning',
      category: 'Contacto',
      message: 'No se detectó un número de teléfono.',
      suggestion: 'Incluye un número de teléfono de contacto.',
    });
  }

  // 5. Completeness Score (0-100)
  let completenessScore = 0;
  if (sections.contactInfo.trim()) completenessScore += 15;
  if (sections.summary.trim()) completenessScore += 15;
  if (sections.experience.trim()) completenessScore += 25;
  if (sections.education.trim()) completenessScore += 15;
  if (sections.skills.trim()) completenessScore += 15;
  if (sections.certifications.trim()) completenessScore += 5;
  if (sections.languages.trim()) completenessScore += 5;
  if (hasEmail) completenessScore += 3;
  if (hasPhone) completenessScore += 2;

  const breakdown: ATSBreakdown = {
    formatting: Math.max(0, Math.min(100, formattingScore)),
    keywords: Math.max(0, Math.min(100, keywordsScore)),
    structure: Math.max(0, Math.min(100, structureScore)),
    readability: Math.max(0, Math.min(100, readabilityScore)),
    completeness: Math.max(0, Math.min(100, completenessScore)),
  };

  const overallScore = Math.round(
    (breakdown.formatting * 0.15) +
    (breakdown.keywords * 0.25) +
    (breakdown.structure * 0.25) +
    (breakdown.readability * 0.15) +
    (breakdown.completeness * 0.20)
  );

  if (overallScore >= 80) {
    recommendations.push('¡Tu CV tiene buena compatibilidad ATS! Sigue refinando los detalles.');
  } else if (overallScore >= 60) {
    recommendations.push('Tu CV necesita mejoras moderadas para pasar filtros ATS.');
  } else {
    recommendations.push('Tu CV necesita mejoras significativas. Revisa las sugerencias detalladas.');
  }

  return {
    id: genId(),
    cvId: cv.id,
    overallScore,
    breakdown,
    issues,
    recommendations,
    analyzedAt: Date.now(),
  };
}

// ========== Job Comparison ==========

export function compareWithJob(cv: CVDocument, jobTitle: string, jobDescription: string): JobComparison {
  const cvText = cv.rawText.toLowerCase();
  const jobText = jobDescription.toLowerCase();

  // Extract job keywords
  const jobWords = jobText
    .replace(/[^a-záéíóúñü0-9\s\-\.\+\#\/]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will',
    'are', 'was', 'were', 'been', 'being', 'has', 'had', 'does', 'did',
    'could', 'would', 'should', 'shall', 'may', 'might', 'must', 'need',
    'about', 'above', 'after', 'again', 'also', 'than', 'then', 'they',
    'them', 'their', 'there', 'these', 'those', 'through', 'under',
    'para', 'como', 'con', 'por', 'que', 'del', 'los', 'las', 'una',
    'uno', 'sus', 'más', 'pero', 'ese', 'esa', 'esto', 'esta',
    'entre', 'sobre', 'todo', 'todos', 'cada', 'donde', 'cuando',
  ]);

  // Count word frequency in job description
  const wordFreq: Record<string, number> = {};
  for (const w of jobWords) {
    if (!stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Sort by frequency and take top keywords
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);

  const matchedKeywords = topKeywords.filter(kw => cvText.includes(kw));
  const missingKeywords = topKeywords.filter(kw => !cvText.includes(kw));

  const matchScore = topKeywords.length > 0
    ? Math.round((matchedKeywords.length / topKeywords.length) * 100)
    : 0;

  const recommendations: string[] = [];

  if (missingKeywords.length > 0) {
    recommendations.push(`Añade estas palabras clave a tu CV: ${missingKeywords.slice(0, 10).join(', ')}`);
  }

  if (matchScore < 40) {
    recommendations.push('Tu CV tiene baja compatibilidad con esta oferta. Considera personalizar tu CV para este puesto.');
  } else if (matchScore < 70) {
    recommendations.push('Buena base, pero puedes mejorar añadiendo las palabras clave faltantes en tu experiencia y habilidades.');
  } else {
    recommendations.push('¡Excelente compatibilidad! Tu CV está bien alineado con esta oferta.');
  }

  recommendations.push('Asegúrate de que las palabras clave aparezcan en contexto relevante, no solo listadas.');

  return {
    id: genId(),
    cvId: cv.id,
    jobTitle,
    jobDescription,
    matchScore,
    matchedKeywords,
    missingKeywords,
    recommendations,
    comparedAt: Date.now(),
  };
}

// ========== CV Optimizer ==========

export function generateOptimizedCV(cv: CVDocument, analysis: ATSAnalysis): OptimizedCV {
  let optimizedText = '';
  const improvements: string[] = [];
  const s = cv.sections;

  // Build optimized CV structure
  optimizedText += '=== DATOS DE CONTACTO ===\n';
  if (s.contactInfo.trim()) {
    optimizedText += s.contactInfo.trim() + '\n';
  } else {
    optimizedText += '[Añade: Nombre completo, Email, Teléfono, LinkedIn, Ciudad]\n';
    improvements.push('Se añadió placeholder para datos de contacto');
  }
  optimizedText += '\n';

  // Professional Summary
  optimizedText += '=== RESUMEN PROFESIONAL ===\n';
  if (s.summary.trim()) {
    optimizedText += s.summary.trim() + '\n';
  } else {
    // Generate a basic summary from the CV content
    const experienceWords = s.experience.split(/\s+/).slice(0, 20).join(' ');
    optimizedText += `Profesional con experiencia en ${experienceWords}... [Personaliza este resumen con tus principales logros y habilidades]\n`;
    improvements.push('Se generó un resumen profesional sugerido');
  }
  optimizedText += '\n';

  // Skills
  optimizedText += '=== HABILIDADES ===\n';
  if (s.skills.trim()) {
    optimizedText += s.skills.trim() + '\n';
  } else {
    const cvKeywords = cv.keywords.slice(0, 15).join(', ');
    optimizedText += `${cvKeywords}\n[Añade más habilidades técnicas y blandas relevantes]\n`;
    improvements.push('Se extrajeron habilidades del contenido del CV');
  }
  optimizedText += '\n';

  // Experience
  optimizedText += '=== EXPERIENCIA LABORAL ===\n';
  if (s.experience.trim()) {
    // Enhance experience with action verbs
    let enhancedExp = s.experience.trim();
    // Suggest improvements for lines that don't start with action verbs
    const expLines = enhancedExp.split('\n');
    const enhancedLines = expLines.map(line => {
      if (line.trim() && line.trim().length > 10 && !line.includes(':') && !line.match(/^\d/)) {
        const startsWithVerb = ATS_POWER_WORDS.some(v => line.toLowerCase().trim().startsWith(v));
        if (!startsWithVerb && !line.match(/^[A-Z].*\|/) && !line.match(/^[A-Z].*\d{4}/)) {
          return `- ${line.trim()}`;
        }
      }
      return line;
    });
    optimizedText += enhancedLines.join('\n') + '\n';
    improvements.push('Se formatearon las descripciones de experiencia con viñetas');
  } else {
    optimizedText += '[Añade tu experiencia laboral con verbos de acción y métricas]\n';
    improvements.push('Se añadió placeholder para experiencia laboral');
  }
  optimizedText += '\n';

  // Education
  optimizedText += '=== EDUCACIÓN ===\n';
  if (s.education.trim()) {
    optimizedText += s.education.trim() + '\n';
  } else {
    optimizedText += '[Añade tu formación académica: Título, Institución, Año]\n';
    improvements.push('Se añadió placeholder para educación');
  }
  optimizedText += '\n';

  // Certifications
  if (s.certifications.trim()) {
    optimizedText += '=== CERTIFICACIONES ===\n';
    optimizedText += s.certifications.trim() + '\n\n';
  }

  // Languages
  if (s.languages.trim()) {
    optimizedText += '=== IDIOMAS ===\n';
    optimizedText += s.languages.trim() + '\n\n';
  }

  // Other
  if (s.other.trim()) {
    optimizedText += '=== INFORMACIÓN ADICIONAL ===\n';
    optimizedText += s.other.trim() + '\n\n';
  }

  // Calculate improved score
  const newScore = Math.min(100, analysis.overallScore + Math.min(25, improvements.length * 5 + 10));

  improvements.push('Formato de una sola columna optimizado para ATS');
  improvements.push('Secciones claramente etiquetadas con encabezados estándar');
  improvements.push('Eliminación de caracteres especiales incompatibles');

  return {
    id: genId(),
    originalCvId: cv.id,
    optimizedText,
    improvements,
    newScore,
    createdAt: Date.now(),
  };
}

// ========== Job Search Simulation ==========

export function searchJobs(cvKeywords: string[], query: string): import('../types').JobListing[] {
  // Simulated job listings based on keywords
  const jobTemplates = [
    { title: 'Desarrollador Frontend Senior', company: 'TechCorp', desc: 'Buscamos desarrollador con experiencia en React, TypeScript y CSS. Responsable de crear interfaces de usuario modernas y accesibles.' },
    { title: 'Full Stack Developer', company: 'InnovateTech', desc: 'Desarrollador full stack con conocimientos en Node.js, React, bases de datos SQL y NoSQL. Experiencia en metodologías ágiles.' },
    { title: 'Analista de Datos', company: 'DataFlow', desc: 'Analista con experiencia en Python, SQL, visualización de datos y machine learning. Capacidad analítica y comunicación efectiva.' },
    { title: 'Project Manager', company: 'ConsultPro', desc: 'Gestión de proyectos tecnológicos, Scrum, liderazgo de equipos multidisciplinarios. PMP o certificación equivalente deseable.' },
    { title: 'Diseñador UX/UI', company: 'DesignHub', desc: 'Diseñador con experiencia en Figma, investigación de usuarios, prototipado y diseño de sistemas. Portfolio requerido.' },
    { title: 'DevOps Engineer', company: 'CloudScale', desc: 'Ingeniero DevOps con experiencia en AWS, Docker, Kubernetes, CI/CD. Automatización de infraestructura y monitoreo.' },
    { title: 'Marketing Digital', company: 'GrowthCo', desc: 'Especialista en marketing digital, SEO, SEM, redes sociales, email marketing y analítica web. Google Analytics certificado.' },
    { title: 'Ingeniero de Software', company: 'CodeFactory', desc: 'Desarrollo de software empresarial, Java, Spring Boot, microservicios, arquitectura de software, testing.' },
    { title: 'Administrador de Sistemas', company: 'NetSecure', desc: 'Administración de servidores Linux/Windows, redes, seguridad informática, virtualización, backup y recuperación.' },
    { title: 'Product Manager', company: 'StartupX', desc: 'Gestión de producto digital, definición de roadmap, análisis de métricas, coordinación con equipos de desarrollo y diseño.' },
    { title: 'Contador Senior', company: 'FinanceGroup', desc: 'Contabilidad general, estados financieros, impuestos, auditoría, normativa fiscal, SAP, Excel avanzado.' },
    { title: 'Recursos Humanos', company: 'PeopleCo', desc: 'Reclutamiento, selección de personal, nómina, desarrollo organizacional, capacitación, clima laboral.' },
  ];

  const queryLower = query.toLowerCase();

  return jobTemplates
    .filter(j => {
      const combined = `${j.title} ${j.desc}`.toLowerCase();
      return queryLower.split(/\s+/).some(q => combined.includes(q)) || !query;
    })
    .map(j => {
      const jobWords = `${j.title} ${j.desc}`.toLowerCase().split(/\s+/);
      const matched = cvKeywords.filter(kw => jobWords.some(jw => jw.includes(kw) || kw.includes(jw)));
      const score = Math.min(100, Math.round((matched.length / Math.max(cvKeywords.length, 1)) * 100 * 2));

      return {
        id: genId(),
        title: j.title,
        company: j.company,
        description: j.desc,
        keywords: jobWords.filter(w => w.length > 3).slice(0, 10),
        matchScore: Math.min(98, Math.max(15, score)),
      };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
