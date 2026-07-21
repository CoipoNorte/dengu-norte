import { useState, useMemo, useCallback } from 'react';
import { 
  User, Mail, Phone, Link, MapPin, FileText, Briefcase, GraduationCap, 
  Wrench, Award, Languages, Plus, Trash2, Save, Eye, CheckCircle2, 
  ChevronDown, ChevronUp, Calendar, Building, HelpCircle, Sparkles
} from 'lucide-react';
import type { CVDocument } from '../../types';
import { cn } from '../../utils/cn';
import { parseRawText, analyzeATS, extractKeywords } from '../../services/atsEngine';
import ScoreRing from '../ScoreRing';

// Types for form data
interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  portfolio: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface CVFormData {
  contact: ContactInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: { language: string; level: string }[];
}

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git',
  'Liderazgo', 'Comunicación', 'Trabajo en equipo', 'Resolución de problemas',
  'Gestión de proyectos', 'Scrum', 'Análisis de datos', 'Excel', 'PowerPoint',
  'Marketing Digital', 'SEO', 'Ventas', 'Atención al cliente', 'Negociación'
];

const LANGUAGE_LEVELS = ['Básico (A1-A2)', 'Intermedio (B1-B2)', 'Avanzado (C1)', 'Nativo (C2)'];

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const initialData: CVFormData = {
  contact: { fullName: '', email: '', phone: '', linkedin: '', location: '', portfolio: '' },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};

interface EditorPageProps {
  cvs: CVDocument[];
  onSaveCV: (fileName: string, rawText: string, fileSize: number) => Promise<CVDocument>;
}

export default function EditorPage({ cvs, onSaveCV }: EditorPageProps) {
  const [data, setData] = useState<CVFormData>(initialData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contact: true, summary: true, experience: true, education: true, skills: true, certifications: false, languages: false
  });
  const [newSkill, setNewSkill] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCv, setSelectedCv] = useState('');

  // Generate raw text from form data
  const generatedText = useMemo(() => {
    let text = '';
    const c = data.contact;

    // Contact
    if (c.fullName || c.email || c.phone) {
      text += '=== DATOS DE CONTACTO ===\n';
      if (c.fullName) text += c.fullName + '\n';
      const contactLine = [c.email, c.phone, c.linkedin, c.location].filter(Boolean).join(' | ');
      if (contactLine) text += contactLine + '\n';
      if (c.portfolio) text += c.portfolio + '\n';
      text += '\n';
    }

    // Summary
    if (data.summary) {
      text += '=== RESUMEN PROFESIONAL ===\n';
      text += data.summary + '\n\n';
    }

    // Experience
    if (data.experiences.length > 0) {
      text += '=== EXPERIENCIA LABORAL ===\n';
      data.experiences.forEach(exp => {
        const dateRange = exp.current ? `${exp.startDate} - Presente` : `${exp.startDate} - ${exp.endDate}`;
        text += `${exp.title} | ${exp.company} | ${dateRange}\n`;
        if (exp.description) text += exp.description + '\n';
        exp.achievements.forEach(a => {
          if (a.trim()) text += `- ${a}\n`;
        });
        text += '\n';
      });
    }

    // Education
    if (data.education.length > 0) {
      text += '=== EDUCACIÓN ===\n';
      data.education.forEach(edu => {
        const dateRange = edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.startDate;
        text += `${edu.degree} | ${edu.institution} | ${dateRange}\n`;
        if (edu.description) text += edu.description + '\n';
        text += '\n';
      });
    }

    // Skills
    if (data.skills.length > 0) {
      text += '=== HABILIDADES ===\n';
      text += data.skills.join(', ') + '\n\n';
    }

    // Certifications
    if (data.certifications.length > 0) {
      text += '=== CERTIFICACIONES ===\n';
      data.certifications.forEach(cert => {
        text += `${cert.name} | ${cert.issuer} | ${cert.date}\n`;
      });
      text += '\n';
    }

    // Languages
    if (data.languages.length > 0) {
      text += '=== IDIOMAS ===\n';
      data.languages.forEach(lang => {
        text += `${lang.language}: ${lang.level}\n`;
      });
    }

    return text;
  }, [data]);

  // Real-time analysis
  const liveAnalysis = useMemo(() => {
    if (!generatedText || generatedText.trim().length < 20) return null;
    const sections = parseRawText(generatedText);
    const keywords = extractKeywords(generatedText);
    const tempCv: CVDocument = {
      id: 'temp',
      name: 'temp',
      fileName: 'temp.txt',
      rawText: generatedText,
      uploadedAt: Date.now(),
      sections,
      keywords,
      fileSize: new Blob([generatedText]).size,
    };
    return analyzeATS(tempCv);
  }, [generatedText]);

  // Load existing CV into form
  const loadCV = useCallback((cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    if (!cv) {
      setData(initialData);
      return;
    }

    // Parse CV sections back into form (simplified)
    const s = cv.sections;
    
    // Extract contact info from first lines
    const contactLines = s.contactInfo.split('\n').filter(Boolean);
    const newContact: ContactInfo = {
      fullName: contactLines[0] || '',
      email: '',
      phone: '',
      linkedin: '',
      location: '',
      portfolio: ''
    };
    
    // Try to extract email and phone from contact section
    const emailMatch = s.contactInfo.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) newContact.email = emailMatch[0];
    const phoneMatch = s.contactInfo.match(/[\+]?[\d\s\-\(\)]{7,}/);
    if (phoneMatch) newContact.phone = phoneMatch[0].trim();
    if (s.contactInfo.toLowerCase().includes('linkedin')) {
      const linkedinMatch = s.contactInfo.match(/linkedin[^\s]*/i);
      if (linkedinMatch) newContact.linkedin = linkedinMatch[0];
    }

    setData({
      contact: newContact,
      summary: s.summary.trim(),
      experiences: [],
      education: [],
      skills: cv.keywords.slice(0, 15),
      certifications: [],
      languages: [],
    });
  }, [cvs]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // CRUD operations
  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: genId(), title: '', company: '', startDate: '', endDate: '', current: false, description: '', achievements: ['', '', '']
      }]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: genId(), degree: '', institution: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !data.skills.includes(skill.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addCertification = () => {
    setData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { id: genId(), name: '', issuer: '', date: '', url: '' }]
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const removeCertification = (id: string) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
  };

  const addLanguage = () => {
    setData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', level: LANGUAGE_LEVELS[1] }]
    }));
  };

  const handleSave = async () => {
    if (!generatedText.trim()) return;
    const name = data.contact.fullName || `CV ${new Date().toLocaleDateString('es')}`;
    await onSaveCV(`${name}.txt`, generatedText, new Blob([generatedText]).size);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Section header component
  const SectionHeader = ({ icon: Icon, title, section, count }: { icon: any; title: string; section: string; count?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        <span className="text-sm sm:text-base font-medium text-white">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">{count}</span>
        )}
      </div>
      {expandedSections[section] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
    </button>
  );

  // Input field component
  const InputField = ({ label, placeholder, value, onChange, icon: Icon, type = 'text', helper }: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void; icon?: any; type?: string; helper?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
        {label}
        {helper && (
          <span className="group relative">
            <HelpCircle className="w-3 h-3 text-gray-600 cursor-help" />
            <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 z-10">
              {helper}
            </span>
          </span>
        )}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors',
            Icon && 'pl-10'
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Editor de CV</h2>
          <p className="text-gray-400 text-sm mt-1">Crea tu CV paso a paso con ayuda inteligente</p>
        </div>
        <div className="flex items-center gap-3">
          {liveAnalysis && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700">
              <ScoreRing score={liveAnalysis.overallScore} size={36} strokeWidth={3} />
              <div>
                <p className="text-[10px] text-gray-500">ATS</p>
                <p className={cn('text-sm font-bold',
                  liveAnalysis.overallScore >= 80 ? 'text-emerald-400' :
                  liveAnalysis.overallScore >= 60 ? 'text-amber-400' :
                  liveAnalysis.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
                )}>{liveAnalysis.overallScore}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Load existing / Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCv}
          onChange={(e) => { setSelectedCv(e.target.value); loadCV(e.target.value); }}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="">Crear nuevo CV</option>
          {cvs.map(cv => (
            <option key={cv.id} value={cv.id}>Cargar: {cv.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="sm:inline">{showPreview ? 'Editar' : 'Vista previa'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={generatedText.trim().length < 50}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? '¡Guardado!' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Preview Mode */}
      {showPreview ? (
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Vista Previa del CV
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-950 rounded-xl p-4 sm:p-6 max-h-[600px] overflow-y-auto font-mono leading-relaxed border border-gray-800">
            {generatedText || 'Completa las secciones para generar tu CV...'}
          </pre>
        </div>
      ) : (
        /* Editor Form */
        <div className="space-y-3 sm:space-y-4">
          {/* Contact Information */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={User} title="Datos de Contacto" section="contact" />
            {expandedSections.contact && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Nombre completo"
                    placeholder="Juan García López"
                    value={data.contact.fullName}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, fullName: v } }))}
                    icon={User}
                    helper="Tu nombre tal como aparecerá en el CV"
                  />
                  <InputField
                    label="Email"
                    placeholder="juan@email.com"
                    value={data.contact.email}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, email: v } }))}
                    icon={Mail}
                    type="email"
                    helper="Email profesional preferiblemente"
                  />
                  <InputField
                    label="Teléfono"
                    placeholder="+34 600 000 000"
                    value={data.contact.phone}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, phone: v } }))}
                    icon={Phone}
                    helper="Incluye código de país"
                  />
                  <InputField
                    label="LinkedIn"
                    placeholder="linkedin.com/in/juangarcia"
                    value={data.contact.linkedin}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, linkedin: v } }))}
                    icon={Link}
                    helper="URL de tu perfil de LinkedIn"
                  />
                  <InputField
                    label="Ubicación"
                    placeholder="Madrid, España"
                    value={data.contact.location}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, location: v } }))}
                    icon={MapPin}
                  />
                  <InputField
                    label="Portfolio / Web (opcional)"
                    placeholder="https://miportfolio.com"
                    value={data.contact.portfolio}
                    onChange={(v) => setData(p => ({ ...p, contact: { ...p.contact, portfolio: v } }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Professional Summary */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={FileText} title="Resumen Profesional" section="summary" />
            {expandedSections.summary && (
              <div className="p-4 sm:p-5 border-t border-gray-800/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm text-gray-400">Tu resumen en 3-4 líneas</label>
                    <span className="text-xs text-gray-600">{data.summary.length}/400</span>
                  </div>
                  <textarea
                    value={data.summary}
                    onChange={(e) => setData(p => ({ ...p, summary: e.target.value }))}
                    placeholder="Profesional con X años de experiencia en [área]. Experto en [habilidades principales]. Destaco por [logro o cualidad]. Busco [objetivo profesional]."
                    rows={4}
                    maxLength={400}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                  <p className="text-xs text-gray-600">💡 Un buen resumen menciona años de experiencia, habilidades clave y un logro destacado.</p>
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={Briefcase} title="Experiencia Laboral" section="experience" count={data.experiences.length} />
            {expandedSections.experience && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                {data.experiences.map((exp, idx) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Experiencia {idx + 1}</span>
                      <button onClick={() => removeExperience(exp.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Puesto"
                        placeholder="Desarrollador Senior"
                        value={exp.title}
                        onChange={(v) => updateExperience(exp.id, 'title', v)}
                        icon={Briefcase}
                      />
                      <InputField
                        label="Empresa"
                        placeholder="Tech Company S.L."
                        value={exp.company}
                        onChange={(v) => updateExperience(exp.id, 'company', v)}
                        icon={Building}
                      />
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fecha inicio
                        </label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Fecha fin
                          <label className="flex items-center gap-1.5 text-xs ml-auto">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded border-gray-600"
                            />
                            <span className="text-emerald-400">Actual</span>
                          </label>
                        </label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm text-gray-400">Logros (usa verbos de acción: Lideré, Implementé, Desarrollé...)</label>
                      {exp.achievements.map((ach, achIdx) => (
                        <div key={achIdx} className="flex items-center gap-2">
                          <span className="text-gray-600 text-sm">•</span>
                          <input
                            type="text"
                            value={ach}
                            onChange={(e) => {
                              const newAch = [...exp.achievements];
                              newAch[achIdx] = e.target.value;
                              updateExperience(exp.id, 'achievements', newAch);
                            }}
                            placeholder={`Logro ${achIdx + 1}: Ej: "Aumenté ventas en 25%"`}
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => updateExperience(exp.id, 'achievements', [...exp.achievements, ''])}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        + Añadir logro
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Experiencia
                </button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={GraduationCap} title="Educación" section="education" count={data.education.length} />
            {expandedSections.education && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Formación {idx + 1}</span>
                      <button onClick={() => removeEducation(edu.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Título"
                        placeholder="Grado en Ingeniería Informática"
                        value={edu.degree}
                        onChange={(v) => updateEducation(edu.id, 'degree', v)}
                        icon={GraduationCap}
                      />
                      <InputField
                        label="Institución"
                        placeholder="Universidad Politécnica"
                        value={edu.institution}
                        onChange={(v) => updateEducation(edu.id, 'institution', v)}
                        icon={Building}
                      />
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm text-gray-400">Año inicio</label>
                        <input
                          type="number"
                          min="1950"
                          max="2030"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          placeholder="2018"
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm text-gray-400">Año fin</label>
                        <input
                          type="number"
                          min="1950"
                          max="2030"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          placeholder="2022"
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Educación
                </button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={Wrench} title="Habilidades" section="skills" count={data.skills.length} />
            {expandedSections.skills && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                {/* Added skills */}
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {/* Add new skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)}
                    placeholder="Escribe una habilidad..."
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => addSkill(newSkill)}
                    disabled={!newSkill.trim()}
                    className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">💡 Sugerencias (click para añadir):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_SUGGESTIONS.filter(s => !data.skills.includes(s)).slice(0, 12).map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 text-xs hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={Award} title="Certificaciones" section="certifications" count={data.certifications.length} />
            {expandedSections.certifications && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                {data.certifications.map((cert, idx) => (
                  <div key={cert.id} className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Certificación {idx + 1}</span>
                      <button onClick={() => removeCertification(cert.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        placeholder="Nombre del certificado"
                        className="px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                        placeholder="Emisor (Google, AWS...)"
                        className="px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <input
                        type="month"
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        className="px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addCertification}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Certificación
                </button>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
            <SectionHeader icon={Languages} title="Idiomas" section="languages" count={data.languages.length} />
            {expandedSections.languages && (
              <div className="p-4 sm:p-5 space-y-4 border-t border-gray-800/30">
                {data.languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => {
                        const newLangs = [...data.languages];
                        newLangs[idx] = { ...lang, language: e.target.value };
                        setData(p => ({ ...p, languages: newLangs }));
                      }}
                      placeholder="Idioma"
                      className="flex-1 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => {
                        const newLangs = [...data.languages];
                        newLangs[idx] = { ...lang, level: e.target.value };
                        setData(p => ({ ...p, languages: newLangs }));
                      }}
                      className="w-40 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      {LANGUAGE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setData(p => ({ ...p, languages: p.languages.filter((_, i) => i !== idx) }))}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Idioma
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
