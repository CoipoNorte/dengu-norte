# 🧠 Dengu Norte - ATS Optimizer

<p align="center">
  <img src="public/favicon.png" alt="Dengu Norte Logo" width="120" />
</p>

<p align="center">
  <strong>Plataforma web profesional para optimizar currículums contra sistemas ATS</strong>
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#demo">Demo</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#uso">Uso</a> •
  <a href="#tecnologías">Tecnologías</a>
</p>

---

## 🎯 ¿Qué es Dengu Norte?

Dengu Norte es una herramienta **100% cliente** (sin backend) que ayuda a las personas a optimizar sus CVs para sistemas ATS (Applicant Tracking Systems). Todo el procesamiento ocurre en tu navegador, garantizando **total privacidad** de tus datos.

## ✨ Características

### 📄 Gestión de CVs
- Subir CV en formatos **PDF, DOCX, DOC o TXT**
- Almacenamiento local persistente con **IndexedDB**
- Visualización y eliminación de CVs

### 📊 Análisis ATS
- Cálculo automático de **porcentaje de compatibilidad ATS**
- Desglose en 5 categorías: Formato, Keywords, Estructura, Legibilidad, Completitud
- Detección de problemas con sugerencias de mejora

### 🔄 Comparación con Ofertas
- Ingreso de descripción de puesto de trabajo
- Cálculo de **% de compatibilidad** entre CV y oferta
- Identificación de palabras clave faltantes

### ✨ Generador de CV ATS
- Genera una **versión optimizada** del CV original
- Aplica mejores prácticas para sistemas ATS
- Descarga del CV optimizado

### ✏️ Editor de CV Inteligente
- Editor estructurado por secciones (Contacto, Experiencia, Educación, etc.)
- **Score ATS en tiempo real** mientras editas
- Sugerencias y ayudas contextuales
- Selectores de fecha y autocompletado

### 🔍 Búsqueda de Empleo
- Búsqueda de ofertas simuladas
- Matching entre CV y ofertas

### 📈 Dashboard
- Estadísticas generales
- Historial de puntuaciones
- Progreso del usuario

### 📚 Comunidad
- Consejos y mejores prácticas
- Plantillas optimizadas descargables

---

## 🚀 Demo

🔗 **[Ver Demo en Vivo](https://tuusuario.github.io/dengu-norte/)**

---

## 💻 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/dengu-norte.git

# Entrar al directorio
cd dengu-norte

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📦 Despliegue

### GitHub Pages

```bash
# Build y deploy a gh-pages
npm run deploy
```

Esto ejecutará el build y publicará automáticamente en la rama `gh-pages`.

### Configuración del repositorio

1. Ve a **Settings** > **Pages** en tu repositorio de GitHub
2. En **Source**, selecciona la rama `gh-pages`
3. Guarda los cambios

Tu sitio estará disponible en: `https://tuusuario.github.io/dengu-norte/`

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 19 + TypeScript |
| **Build Tool** | Vite |
| **Estilos** | Tailwind CSS 4 |
| **Almacenamiento** | IndexedDB (idb) |
| **Iconos** | Lucide React |
| **Animaciones** | Framer Motion |
| **Despliegue** | GitHub Pages |

---

## 📁 Estructura del Proyecto

```
dengu-norte/
├── public/
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── Sidebar.tsx      # Navegación lateral
│   │   ├── MobileNav.tsx    # Navegación móvil
│   │   └── ScoreRing.tsx    # Componente de score circular
│   ├── hooks/
│   │   └── useDatabase.ts   # Hook de IndexedDB
│   ├── services/
│   │   ├── indexedDB.ts     # Operaciones de base de datos
│   │   └── atsEngine.ts     # Motor de análisis ATS
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── utils/
│   │   └── cn.ts            # Utilidad de clases
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔒 Privacidad

- ✅ **100% Cliente**: Todo el procesamiento ocurre en tu navegador
- ✅ **Sin Backend**: No hay servidor que reciba tus datos
- ✅ **Sin Cuentas**: No requiere registro ni login
- ✅ **Datos Locales**: Todo se almacena en IndexedDB de tu navegador
- ✅ **Sin Tracking**: No hay analytics ni cookies de terceros

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Creado con ❤️ para ayudar a más personas a conseguir el trabajo de sus sueños.

---

<p align="center">
  <sub>⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub</sub>
</p>
