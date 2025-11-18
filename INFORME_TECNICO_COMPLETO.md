# 📋 INFORME TÉCNICO COMPLETO - PBL CLASSROOM
## Plataforma Educativa Impulsada por IA para Aprendizaje Basado en Problemas

---

## 📑 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Diseño y UI/UX](#diseño-y-uiux)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Base de Datos](#base-de-datos)
8. [Servicios Backend](#servicios-backend)
9. [Servicios Frontend](#servicios-frontend)
10. [Componentes React](#componentes-react)
11. [Optimizaciones y Mejoras](#optimizaciones-y-mejoras)
12. [Configuraciones](#configuraciones)
13. [Estructura de Archivos](#estructura-de-archivos)
14. [Bugs Corregidos](#bugs-corregidos)
15. [Próximas Mejoras](#próximas-mejoras)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Descripción del Proyecto
**PBL Classroom** es una plataforma educativa web desarrollada para la Universidad Autónoma de Chile que utiliza Inteligencia Artificial para facilitar el Aprendizaje Basado en Problemas (PBL). La plataforma permite a docentes crear cursos, subir materiales educativos y monitorear el progreso de los estudiantes, mientras que los estudiantes pueden interactuar con un asistente de IA especializado que les guía en su proceso de aprendizaje.

### 1.2 Objetivos Cumplidos
- ✅ Sistema de autenticación completo con múltiples proveedores
- ✅ Interfaz de chat con IA para asistencia educativa
- ✅ Gestión de cursos y materiales educativos
- ✅ Sistema de analíticas y estadísticas
- ✅ Notificaciones en tiempo real
- ✅ Diseño responsive y accesible
- ✅ Modo oscuro/claro
- ✅ Exportación de conversaciones
- ✅ Sistema de tutoriales interactivos
- ✅ PWA (Progressive Web App)

### 1.3 Tecnologías Principales
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI (Python), OpenAI API
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Hosting**: Firebase Hosting (preparado)

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Arquitectura General
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + TypeScript + Tailwind CSS + Vite                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │ Student Home │  │ Teacher Home │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  ChatContainer  │                        │
│                  └────────┬────────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        BACKEND                               │
│  FastAPI + Python + OpenAI                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ OpenAI       │  │ File         │  │ Misuse       │     │
│  │ Service      │  │ Service      │  │ Detection    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    FIREBASE SERVICES                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Firestore    │  │ Auth         │  │ Storage      │     │
│  │ (Database)   │  │ (OAuth)      │  │ (Files)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos
1. **Usuario** → Interactúa con la interfaz React
2. **Frontend** → Realiza peticiones a servicios Firebase y API Backend
3. **Backend** → Procesa con IA y devuelve respuestas
4. **Firebase** → Almacena datos, maneja autenticación y archivos
5. **Frontend** → Actualiza UI en tiempo real con Firestore listeners

---

## 3. STACK TECNOLÓGICO

### 3.1 Frontend

#### Framework y Librerías Core
- **React 19.1.1**: Framework principal de UI
- **TypeScript 5.9.3**: Tipado estático
- **Vite 7.1.7**: Build tool y dev server
- **React Router DOM 7.9.5**: Enrutamiento

#### Estilos y UI
- **Tailwind CSS 4.1.16**: Framework de utilidades CSS
- **Lucide React 0.552.0**: Iconos
- **Recharts 3.4.1**: Gráficos y visualizaciones
- **@headlessui/react 2.2.9**: Componentes accesibles

#### Estado y Datos
- **Firebase 12.5.0**: SDK completo (Auth, Firestore, Storage)
- **Axios 1.13.2**: Cliente HTTP
- **Zustand 5.0.8**: Gestión de estado global

#### Utilidades
- **date-fns 4.1.0**: Manipulación de fechas
- **jsPDF 3.0.3**: Generación de PDFs
- **react-markdown 10.1.0**: Renderizado de Markdown
- **remark-gfm 4.0.1**: Soporte para GitHub Flavored Markdown

#### PWA
- **workbox-window 7.3.0**: Service Worker para PWA

### 3.2 Backend

#### Framework
- **FastAPI 0.115.5**: Framework web asíncrono
- **Uvicorn 0.32.1**: Servidor ASGI

#### IA y Procesamiento
- **OpenAI 2.8.1+**: Integración con GPT
- **Anthropic 0.39.0**: Integración con Claude (preparado)

#### Procesamiento de Archivos
- **PyPDF2 3.0.1**: Extracción de texto de PDFs
- **python-docx 1.1.0**: Procesamiento de documentos Word

#### Utilidades
- **httpx 0.28.1**: Cliente HTTP asíncrono
- **pydantic 2.10.3**: Validación de datos
- **python-dotenv 1.0.1**: Variables de entorno

### 3.3 Base de Datos y Servicios
- **Firebase Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Authentication**: Autenticación (Email/Password, Google, Microsoft)
- **Firebase Storage**: Almacenamiento de archivos

---

## 4. FUNCIONALIDADES IMPLEMENTADAS

### 4.1 Autenticación y Autorización

#### 4.1.1 Registro e Inicio de Sesión
- ✅ Registro con email y contraseña
- ✅ Inicio de sesión con email y contraseña
- ✅ Verificación de email obligatoria
- ✅ Reenvío de email de verificación
- ✅ Detección automática de rol basada en dominio de email:
  - `@uautonoma.cl` → Docente
  - `@cloud.uautonoma.cl` → Estudiante
- ✅ Selección manual de rol si no se puede detectar

#### 4.1.2 OAuth (Inicio de Sesión Social)
- ✅ Inicio de sesión con Google
- ✅ Inicio de sesión con Microsoft
- ✅ Modal de selección de rol después de OAuth
- ✅ Detección automática de rol desde email en OAuth
- ✅ Manejo de errores de OAuth (popup bloqueado, cancelado, etc.)

#### 4.1.3 Recuperación de Contraseña
- ✅ Solicitud de restablecimiento de contraseña
- ✅ Envío de email con link de restablecimiento
- ✅ Página de acción personalizada (`action.html`)
- ✅ Modal de restablecimiento de contraseña
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Confirmación de contraseña
- ✅ Mostrar/ocultar contraseña

#### 4.1.4 Protección de Rutas
- ✅ Componente `ProtectedRoute` que verifica autenticación
- ✅ Verificación de rol (teacher/student)
- ✅ Redirección automática según rol
- ✅ Verificación de email para usuarios con contraseña

### 4.2 Gestión de Cursos

#### 4.2.1 Para Docentes
- ✅ Crear nuevos cursos
- ✅ Editar información de cursos (título, descripción)
- ✅ Eliminar cursos
- ✅ Ver lista de todos sus cursos
- ✅ Configurar límite de páginas por archivo (`maxPagesPerFile`)
- ✅ Gestionar estudiantes del curso
- ✅ Agregar estudiantes por email
- ✅ Ver lista de estudiantes inscritos
- ✅ Eliminar estudiantes del curso

#### 4.2.2 Para Estudiantes
- ✅ Ver lista de cursos en los que está inscrito
- ✅ Acceder a cursos activos
- ✅ Ver información del curso

### 4.3 Gestión de Archivos

#### 4.3.1 Subida de Archivos (Docentes)
- ✅ Subida de múltiples archivos
- ✅ Soporte para PDF, DOCX, DOC
- ✅ Validación de tipo de archivo
- ✅ Validación de tamaño de archivo
- ✅ Progreso de subida
- ✅ Vista previa de archivos subidos
- ✅ Eliminación de archivos
- ✅ Almacenamiento en Firebase Storage

#### 4.3.2 Visualización de Archivos (Estudiantes)
- ✅ Lista de archivos del curso
- ✅ Vista expandible/colapsable
- ✅ Información de archivos (nombre, tipo, tamaño)

### 4.4 Sistema de Chat con IA

#### 4.4.1 Conversaciones
- ✅ Crear nuevas conversaciones
- ✅ Lista de conversaciones del usuario
- ✅ Búsqueda de conversaciones
- ✅ Eliminar conversaciones
- ✅ Renombrar conversaciones
- ✅ Ordenamiento por fecha de última actividad
- ✅ Indicador de conversación activa

#### 4.4.2 Mensajes
- ✅ Envío de mensajes de texto
- ✅ Respuestas de IA con contexto del curso
- ✅ Historial de conversación
- ✅ Renderizado de Markdown en mensajes
- ✅ Soporte para código, listas, enlaces
- ✅ Timestamps en mensajes
- ✅ Indicador de escritura (typing indicator)
- ✅ Scroll automático a nuevos mensajes

#### 4.4.3 Funcionalidades Avanzadas del Chat
- ✅ Copiar mensajes al portapapeles
- ✅ Botón de copiar en cada mensaje
- ✅ Limpieza de Markdown al copiar
- ✅ Sugerencias de preguntas frecuentes
- ✅ Preguntas sugeridas al iniciar conversación
- ✅ Click en sugerencias para enviar pregunta

#### 4.4.4 Contexto del Curso
- ✅ La IA tiene acceso a los archivos del curso
- ✅ Verificación de relevancia de archivos con el curso
- ✅ Mensaje de error si archivos no son relevantes
- ✅ Límite configurable de páginas por archivo
- ✅ Optimización de contenido enviado a la IA

### 4.5 Analíticas y Estadísticas

#### 4.5.1 Analíticas del Curso (Docentes)
- ✅ Estadísticas generales:
  - Total de conversaciones
  - Total de mensajes
  - Estudiantes activos
  - Promedio de mensajes por conversación
- ✅ Gráfico de actividad diaria (últimos 30 días):
  - Mensajes por día
  - Estudiantes activos por día
- ✅ Gráfico de actividad por hora del día
- ✅ Top 5 estudiantes más activos (gráfico de barras horizontal)
- ✅ Distribución de conversaciones por estudiante (gráfico de pastel)
- ✅ Tabla de actividad de estudiantes:
  - Email del estudiante
  - Número de conversaciones
  - Total de mensajes
  - Última actividad
- ✅ Preguntas más frecuentes:
  - Lista de preguntas más repetidas (más de 5 veces)
  - Gráfico de barras de frecuencia
  - Fecha de última vez preguntada
- ✅ Vista expandible/colapsable de analíticas completas

#### 4.5.2 Estadísticas Personales (Estudiantes)
- ✅ Total de mensajes enviados
- ✅ Total de conversaciones creadas
- ✅ Promedio de mensajes por conversación
- ✅ Tiempo total estimado en la plataforma
- ✅ Gráfico de mensajes por día
- ✅ Gráfico de conversaciones por día
- ✅ Gráfico de actividad por hora del día
- ✅ Top temas más consultados

### 4.6 Notificaciones

#### 4.6.1 Sistema de Notificaciones
- ✅ Panel de notificaciones deslizable
- ✅ Contador de notificaciones no leídas
- ✅ Notificaciones en tiempo real
- ✅ Marcar notificaciones como leídas
- ✅ Eliminar notificaciones
- ✅ Tipos de notificaciones:
  - Alertas de mal uso de IA (para docentes)
  - Notificaciones del sistema

### 4.7 Exportación de Datos

#### 4.7.1 Exportación de Conversaciones
- ✅ Exportar a PDF:
  - Formato profesional
  - Información del curso
  - Fechas formateadas
  - Limpieza de Markdown
  - Identificación correcta de roles (Docente/Estudiante)
- ✅ Exportar a texto plano:
  - Formato legible
  - Separadores claros
  - Información completa
- ✅ Botón de exportar en el header del chat
- ✅ Nombres de archivo descriptivos con fecha

### 4.8 Configuración y Perfil

#### 4.8.1 Configuración de Usuario
- ✅ Modal de configuración
- ✅ Editar nombre y apellido
- ✅ Ver correo electrónico (no editable)
- ✅ Cambiar modo oscuro/claro
- ✅ Botón de modo oscuro/claro en el header (luna/sol)
- ✅ Guardar cambios con confirmación
- ✅ Cierre automático del modal al guardar

#### 4.8.2 Tutorial Interactivo
- ✅ Tutorial de bienvenida para nuevos usuarios
- ✅ Contenido diferente para estudiantes y docentes
- ✅ Navegación paso a paso
- ✅ Barra de progreso
- ✅ Botones de anterior/siguiente
- ✅ Opción de saltar tutorial
- ✅ Marcar tutorial como visto
- ✅ Reabrir tutorial desde configuración
- ✅ Inicio siempre en la primera página

### 4.9 Diseño y Experiencia de Usuario

#### 4.9.1 Tema Visual
- ✅ Paleta de colores de la Universidad Autónoma de Chile:
  - Rojo institucional (`#dc2626`)
  - Grises profesionales
- ✅ Modo oscuro completo
- ✅ Modo claro
- ✅ Toggle de modo en el header
- ✅ Persistencia de preferencia de tema
- ✅ Transiciones suaves entre modos

#### 4.9.2 Responsive Design
- ✅ Diseño adaptativo para móviles
- ✅ Diseño para tablets
- ✅ Diseño para desktop
- ✅ Sidebar colapsable en móviles
- ✅ Menú hamburguesa en móviles
- ✅ Overlay para sidebar en móviles
- ✅ Tamaños de fuente adaptativos
- ✅ Espaciado responsive

#### 4.9.3 Accesibilidad
- ✅ Navegación por teclado
- ✅ Etiquetas ARIA donde corresponde
- ✅ Contraste adecuado en ambos modos
- ✅ Focus visible en elementos interactivos
- ✅ Textos legibles en todos los modos

### 4.10 Progressive Web App (PWA)

#### 4.10.1 Configuración PWA
- ✅ Manifest.json configurado
- ✅ Iconos para PWA (192x192, 512x512)
- ✅ Iconos maskable
- ✅ Meta tags para iOS
- ✅ Tema color configurado
- ✅ Nombre y descripción de la app
- ✅ Modo standalone

### 4.11 Optimizaciones de Rendimiento

#### 4.11.1 Optimizaciones de IA
- ✅ Límite de archivos procesados (máximo 3)
- ✅ Límite de caracteres por archivo (8000)
- ✅ Límite de páginas por archivo (configurable, default 10)
- ✅ Reducción de tokens enviados a la IA (800 max)
- ✅ Reducción de historial de conversación (últimos 5 mensajes)
- ✅ Timeout de API aumentado a 120 segundos
- ✅ Verificación de relevancia de archivos antes de procesar

#### 4.11.2 Optimizaciones Frontend
- ✅ Lazy loading de componentes
- ✅ Debounce en búsqueda
- ✅ Paginación en listas grandes
- ✅ Memoización de componentes
- ✅ Optimización de re-renders

---

## 5. DISEÑO Y UI/UX

### 5.1 Paleta de Colores

#### Colores Principales
- **Rojo Institucional**: `#dc2626` (uach-red-600)
- **Gris Oscuro**: `#1e293b` (slate-800)
- **Gris Claro**: `#f1f5f9` (slate-100)

#### Gradientes
- Fondo principal: `from-slate-50 via-red-50 to-slate-100`
- Botones: `from-red-600 to-slate-700`
- Cards: `from-slate-50 to-red-50/30`

### 5.2 Componentes de Diseño

#### 5.2.1 Cards y Contenedores
- Bordes redondeados (xl, 2xl, 3xl)
- Sombras suaves y profundas
- Backdrop blur para efectos de vidrio
- Bordes sutiles con transparencia

#### 5.2.2 Botones
- Gradientes en botones principales
- Estados hover con transiciones
- Estados disabled con opacidad
- Iconos integrados
- Tamaños responsive

#### 5.2.3 Inputs
- Iconos a la izquierda
- Placeholders descriptivos
- Estados de focus con anillos de color
- Validación visual
- Botones de acción integrados (mostrar/ocultar contraseña)

#### 5.2.4 Modales
- Overlay con backdrop blur
- Animaciones de entrada (fade-in, slide-up)
- Botón de cerrar (X)
- Cierre con tecla Escape
- Prevención de scroll del body cuando está abierto

### 5.3 Animaciones

#### 5.3.1 Transiciones
- Fade in/out
- Slide up/down
- Scale in/out
- Shake (para errores)

#### 5.3.2 Efectos Especiales
- Spinner de carga
- Typing indicator con puntos animados
- Pulse en elementos destacados
- Hover effects suaves

---

## 6. AUTENTICACIÓN Y SEGURIDAD

### 6.1 Firebase Authentication

#### 6.1.1 Proveedores Configurados
- **Email/Password**: Autenticación tradicional
- **Google OAuth**: Inicio de sesión con Google
- **Microsoft OAuth**: Inicio de sesión con Microsoft

#### 6.1.2 Flujos de Autenticación

**Registro con Email/Password:**
1. Usuario ingresa email, contraseña, nombre, apellido
2. Sistema detecta rol automáticamente o permite selección manual
3. Se crea cuenta en Firebase Auth
4. Se envía email de verificación
5. Se crea documento en Firestore con información del usuario
6. Usuario debe verificar email antes de acceder

**Inicio de Sesión con Email/Password:**
1. Usuario ingresa credenciales
2. Firebase valida credenciales
3. Se verifica que el email esté verificado
4. Se obtiene información del usuario desde Firestore
5. Se redirige según rol

**OAuth (Google/Microsoft):**
1. Usuario hace clic en botón OAuth
2. Se abre popup de autenticación
3. Usuario autoriza en el proveedor
4. Firebase crea/autentica usuario
5. Si es usuario nuevo, se muestra modal de selección de rol
6. Se guarda rol en Firestore
7. Se redirige según rol

**Restablecimiento de Contraseña:**
1. Usuario solicita restablecimiento
2. Firebase envía email con link
3. Usuario hace clic en link
4. Se muestra modal de nueva contraseña
5. Usuario ingresa nueva contraseña
6. Se confirma y actualiza contraseña

### 6.2 Seguridad

#### 6.2.1 Validaciones
- ✅ Contraseña mínimo 6 caracteres
- ✅ Validación de formato de email
- ✅ Verificación de email obligatoria
- ✅ Validación de roles
- ✅ Verificación de permisos por curso

#### 6.2.2 Protección de Rutas
- ✅ Rutas protegidas requieren autenticación
- ✅ Verificación de rol para rutas específicas
- ✅ Redirección automática si no autorizado
- ✅ Verificación de email para usuarios con contraseña

#### 6.2.3 Detección de Mal Uso
- ✅ Sistema de detección de mal uso de IA
- ✅ Alertas para docentes cuando se detecta mal uso
- ✅ Análisis de respuestas del estudiante
- ✅ Notificaciones en tiempo real

---

## 7. BASE DE DATOS

### 7.1 Estructura de Firestore

#### 7.1.1 Colección: `users`
```typescript
{
  uid: string;
  email: string;
  role: "teacher" | "student";
  firstName: string;
  lastName: string;
  displayName: string;
  emailVerified: boolean;
  hasSeenTutorial: boolean;
  createdAt: Timestamp;
}
```

#### 7.1.2 Colección: `courses`
```typescript
{
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: Date;
  maxPagesPerFile: number; // Configurable, default 10
  // Subcolección: enrollments
  enrollments: {
    studentId: string;
    studentEmail: string;
    enrolledAt: Date;
    status: "active" | "inactive";
  }[]
  // Subcolección: files
  files: {
    id: string;
    name: string;
    type: "pdf" | "docx" | "doc";
    url: string;
    size: number;
    uploadedAt: Date;
    courseId: string;
  }[]
  // Subcolección: conversations
  conversations: {
    id: string;
    userId: string;
    userRole: "teacher" | "student";
    title: string;
    createdAt: Date;
    lastMessageAt: Date;
    messageCount: number;
    status: "active" | "archived";
    tags?: string[];
    sharedWith?: string[];
    teacherComments?: TeacherComment[];
    // Subcolección: messages
    messages: {
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
      metadata?: {
        tokens?: number;
        sourcesUsed?: string[];
      };
    }[]
  }[]
}
```

#### 7.1.3 Colección: `notifications`
```typescript
{
  id: string;
  userId: string;
  type: "misuse_alert" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  courseId?: string;
  conversationId?: string;
}
```

### 7.2 Reglas de Seguridad (Firestore)

#### Reglas Implementadas (Conceptuales)
- Usuarios solo pueden leer/escribir sus propios datos
- Docentes pueden leer/escribir sus cursos
- Estudiantes solo pueden leer cursos en los que están inscritos
- Mensajes solo accesibles por el creador y el docente del curso

---

## 8. SERVICIOS BACKEND

### 8.1 OpenAI Service (`openai_service.py`)

#### Funcionalidades
- ✅ Generación de respuestas educativas con contexto
- ✅ Integración con archivos del curso
- ✅ Verificación de relevancia de contenido
- ✅ Detección de mal uso de IA
- ✅ Optimización de tokens y velocidad
- ✅ Manejo de errores robusto

#### Métodos Principales
```python
async def generate_feedback(
    request: FeedbackRequest,
    course_files: List[dict] = None,
    course_title: str = "",
    max_pages_per_file: int = 10
) -> FeedbackResponse

async def _check_content_relevance(
    file_contents: str,
    course_title: str
) -> bool
```

#### Optimizaciones
- Máximo 3 archivos procesados
- Máximo 8000 caracteres por archivo
- Máximo 10 páginas por archivo (configurable)
- Últimos 5 mensajes del historial
- Máximo 800 tokens de respuesta

### 8.2 File Service (`file_service.py`)

#### Funcionalidades
- ✅ Extracción de texto de PDFs
- ✅ Extracción de texto de documentos Word
- ✅ Extracción de texto desde URLs
- ✅ Límite de páginas por archivo
- ✅ Límite de caracteres totales
- ✅ Manejo de errores de archivos corruptos

#### Métodos Principales
```python
async def extract_text_from_files(
    files: List[dict],
    max_files: int = 3,
    max_chars: int = 8000,
    max_pages_per_file: int = 10
) -> str

async def extract_text_from_url(
    url: str,
    file_type: str,
    max_pages: int = 10,
    max_length: int = 50000
) -> str
```

### 8.3 Misuse Detection (`misuse_detection.py`)

#### Funcionalidades
- ✅ Detección de respuestas que parecen generadas por IA
- ✅ Análisis de patrones sospechosos
- ✅ Generación de alertas para docentes
- ✅ Razones de detección

### 8.4 API Endpoints (`main.py`)

#### Endpoints Disponibles
- `GET /`: Información de la API
- `GET /health`: Health check
- `POST /feedback`: Generar respuesta de IA
  - Requiere autenticación (token Firebase)
  - Recibe: mensaje, historial, archivos, configuración
  - Devuelve: respuesta, feedback, tokens usados, sugerencias

---

## 9. SERVICIOS FRONTEND

### 9.1 Auth Service (`authService.ts`)

#### Funciones Principales
```typescript
// Registro y Login
register(email, password, role, firstName, lastName)
login(email, password)
logout()

// OAuth
signInWithGoogle()
signInWithMicrosoft()

// Verificación
sendEmailVerification()
verifyEmailWithCode(oobCode)
resendVerificationEmail()

// Restablecimiento
sendPasswordReset(email)
resetPasswordWithCode(oobCode, newPassword)

// Usuario
getCurrentUserWithRole(user)
updateUserRole(uid, role)
detectRoleFromEmail(email)
markTutorialAsSeen(userId)
```

### 9.2 Courses Service (`coursesService.ts`)

#### Funciones Principales
```typescript
// Cursos
createCourse(title, description, teacherId, teacherName)
getCourseById(courseId)
getCoursesByTeacher(teacherId)
getCoursesByStudent(studentId)
updateCourse(courseId, updates)
deleteCourse(courseId)

// Estudiantes
enrollStudent(courseId, studentEmail)
getEnrolledStudents(courseId)
removeStudent(courseId, studentId)
```

### 9.3 Files Service (`filesService.ts`)

#### Funciones Principales
```typescript
uploadFile(courseId, file)
getCourseFiles(courseId)
deleteFile(courseId, fileId)
```

### 9.4 Conversations Service (`conversationsService.ts`)

#### Funciones Principales
```typescript
createConversation(courseId, userId, userRole, firstMessage)
getUserConversations(courseId, userId)
getConversationById(courseId, conversationId)
updateConversationTitle(courseId, conversationId, newTitle)
deleteConversation(courseId, conversationId)
updateLastActivity(courseId, conversationId)
incrementMessageCount(courseId, conversationId)
searchConversations(courseId, userId, query)
```

### 9.5 Messages Service (`messagesService.ts`)

#### Funciones Principales
```typescript
saveMessage(courseId, conversationId, role, content, metadata)
getMessages(courseId, conversationId)
subscribeToMessages(courseId, conversationId, callback)
```

### 9.6 Analytics Service (`analyticsService.ts`)

#### Funciones Principales
```typescript
getCourseStats(courseId)
getStudentActivity(courseId)
getFrequentQuestions(courseId)
getRecentActivity(courseId, days)
getDailyStats(courseId, days)
getActivityByHour(courseId)
```

### 9.7 Personal Stats Service (`personalStatsService.ts`)

#### Funciones Principales
```typescript
getPersonalStats(userId, courseId?)
```

### 9.8 Export Service (`exportService.ts`)

#### Funciones Principales
```typescript
exportToPDF(conversation, messages, courseTitle)
exportToText(conversation, messages, courseTitle)
```

### 9.9 Notifications Service (`notificationsService.ts`)

#### Funciones Principales
```typescript
getNotifications(userId)
markAsRead(notificationId)
deleteNotification(notificationId)
getUnreadCount(userId)
subscribeToNotifications(userId, callback)
```

### 9.10 API Service (`apiService.ts`)

#### Funciones Principales
```typescript
healthCheck()
getFeedback(request)
```

---

## 10. COMPONENTES REACT

### 10.1 Componentes de Autenticación

#### Login (`components/auth/Login.tsx`)
- Formulario de login/registro
- Validación de campos
- Manejo de errores
- Modales de verificación de email
- Modales de restablecimiento de contraseña
- Integración OAuth
- Modal de selección de rol
- Términos y condiciones
- Política de privacidad

### 10.2 Componentes de Chat

#### ChatContainer (`components/chat/ChatContainer.tsx`)
- Contenedor principal del chat
- Gestión de conversaciones
- Integración con IA
- Manejo de archivos del curso
- Exportación de conversaciones
- Indicador de escritura
- Responsive design

#### ConversationSidebar (`components/chat/ConversationSidebar.tsx`)
- Lista de conversaciones
- Búsqueda de conversaciones
- Crear nueva conversación
- Eliminar conversaciones
- Renombrar conversaciones
- Filtros y ordenamiento
- Responsive con overlay

#### MessageList (`components/chat/MessageList.tsx`)
- Lista de mensajes
- Renderizado de Markdown
- Sugerencias de preguntas
- Estado vacío con ejemplos
- Scroll automático

#### MessageBubble (`components/chat/MessageBubble.tsx`)
- Burbuja de mensaje
- Estilos diferentes para usuario/IA
- Botón de copiar
- Renderizado de Markdown
- Timestamps

#### InputBox (`components/chat/InputBox.tsx`)
- Input de mensaje
- Botón de enviar
- Estado de carga
- Validación
- Responsive

#### ExportButton (`components/chat/ExportButton.tsx`)
- Botón de exportar
- Menú desplegable (PDF/Texto)
- Estados de carga
- Manejo de errores

### 10.3 Componentes de Estudiante

#### StudentHome (`components/student/StudentHome.tsx`)
- Vista principal del estudiante
- Lista de cursos
- Acceso rápido al chat
- Panel de notificaciones
- Configuración
- Estadísticas personales
- Tutorial

#### PersonalStats (`components/student/PersonalStats.tsx`)
- Gráficos de actividad personal
- Estadísticas de uso
- Visualizaciones con Recharts

### 10.4 Componentes de Docente

#### TeacherHome (`components/teacher/TeacherHome.tsx`)
- Vista principal del docente
- Gestión de cursos
- Pestañas: Cursos, Archivos, Estudiantes, Analíticas
- Crear/editar/eliminar cursos
- Subir archivos
- Gestionar estudiantes
- Ver analíticas

#### Analytics (`components/teacher/Analytics.tsx`)
- Dashboard de analíticas
- Gráficos interactivos
- Estadísticas del curso
- Tabla de estudiantes
- Preguntas frecuentes
- Vista expandible/colapsable

#### FileUpload (`components/teacher/FileUpload.tsx`)
- Componente de subida de archivos
- Drag and drop
- Progreso de subida
- Validación de archivos

#### FileList (`components/teacher/FileList.tsx`)
- Lista de archivos
- Información de archivos
- Eliminación de archivos

### 10.5 Componentes Comunes

#### SettingsModal (`components/common/SettingsModal.tsx`)
- Modal de configuración
- Edición de perfil
- Cambio de tema (removido, ahora en header)
- Acceso al tutorial
- Guardar cambios

#### OnboardingTutorial (`components/common/OnboardingTutorial.tsx`)
- Tutorial interactivo
- Pasos guiados
- Contenido por rol
- Navegación
- Persistencia

#### NotificationsPanel (`components/common/NotificationsPanel.tsx`)
- Panel lateral de notificaciones
- Lista de notificaciones
- Marcar como leídas
- Eliminar notificaciones
- Contador de no leídas

#### ProtectedRoute (`components/ProtectedRoute.tsx`)
- Protección de rutas
- Verificación de autenticación
- Verificación de rol
- Redirección automática

---

## 11. OPTIMIZACIONES Y MEJORAS

### 11.1 Optimizaciones de Rendimiento

#### Backend
- ✅ Límite de archivos procesados simultáneamente
- ✅ Límite de caracteres por archivo
- ✅ Límite de páginas por archivo (configurable)
- ✅ Reducción de tokens enviados a la IA
- ✅ Historial de conversación reducido
- ✅ Timeout de API optimizado
- ✅ Verificación rápida de relevancia de archivos

#### Frontend
- ✅ Lazy loading de componentes pesados
- ✅ Debounce en búsqueda (300ms)
- ✅ Memoización de componentes
- ✅ Optimización de re-renders
- ✅ Paginación en listas grandes
- ✅ Virtualización de listas (preparado)

### 11.2 Optimizaciones de Experiencia

#### UX
- ✅ Indicador de escritura de IA
- ✅ Sugerencias de preguntas
- ✅ Copiar mensajes fácilmente
- ✅ Exportación de conversaciones
- ✅ Búsqueda en conversaciones
- ✅ Filtros y ordenamiento

#### UI
- ✅ Diseño responsive completo
- ✅ Modo oscuro/claro
- ✅ Animaciones suaves
- ✅ Feedback visual en todas las acciones
- ✅ Estados de carga claros
- ✅ Mensajes de error descriptivos

---

## 12. CONFIGURACIONES

### 12.1 Firebase

#### Configuración Requerida
- ✅ Proyecto Firebase creado
- ✅ Firestore Database habilitado
- ✅ Authentication habilitado
- ✅ Storage habilitado
- ✅ Google OAuth configurado
- ✅ Microsoft OAuth configurado
- ✅ Dominios autorizados configurados

#### Archivos de Configuración
- `frontend/src/config/firebase.ts`: Configuración del SDK

### 12.2 Variables de Entorno

#### Backend (`.env`)
```
OPENAI_API_KEY=tu_api_key
FRONTEND_URL=http://localhost:5173
```

#### Frontend
- Configuración en `firebase.ts`
- No requiere variables de entorno adicionales

### 12.3 Tailwind CSS

#### Configuración Personalizada
- Paleta de colores de la universidad
- Colores personalizados: `uach-red`, `uach-gray`
- Animaciones personalizadas
- Configuración en `tailwind.config.js`

---

## 13. ESTRUCTURA DE ARCHIVOS

### 13.1 Frontend

```
frontend/
├── public/
│   ├── action.html          # Página de acción para reset de contraseña
│   ├── manifest.json        # Manifest de PWA
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── logos/
│   │       └── ua-logo.png  # Logo de la universidad
│   ├── components/
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ConversationSidebar.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── InputBox.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageList.tsx
│   │   ├── common/
│   │   │   ├── NotificationsPanel.tsx
│   │   │   ├── OnboardingTutorial.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── student/
│   │   │   ├── PersonalStats.tsx
│   │   │   └── StudentHome.tsx
│   │   ├── teacher/
│   │   │   ├── Analytics.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── TeacherHome.tsx
│   │   └── ProtectedRoute.tsx
│   ├── config/
│   │   └── firebase.ts
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   ├── alertsService.ts
│   │   ├── analyticsService.ts
│   │   ├── apiService.ts
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── commentsService.ts
│   │   ├── conversationsService.ts
│   │   ├── coursesService.ts
│   │   ├── exportService.ts
│   │   ├── filesService.ts
│   │   ├── firebaseService.ts
│   │   ├── messagesService.ts
│   │   ├── notificationsService.ts
│   │   ├── personalStatsService.ts
│   │   ├── remindersService.ts
│   │   ├── shareService.ts
│   │   ├── studentsService.ts
│   │   └── tagsService.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

### 13.2 Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py           # Configuración y variables de entorno
│   ├── main.py             # FastAPI app y endpoints
│   ├── models.py           # Modelos Pydantic
│   └── services/
│       ├── __init__.py
│       ├── openai_service.py      # Servicio de OpenAI
│       ├── file_service.py        # Procesamiento de archivos
│       ├── misuse_detection.py    # Detección de mal uso
│       └── claude_service.py      # Servicio de Claude (preparado)
├── requirements.txt
└── venv/
```

---

## 14. BUGS CORREGIDOS

### 14.1 Bugs de Funcionalidad

1. **Error al buscar conversaciones**
   - **Problema**: `limit` no estaba importado de Firestore
   - **Solución**: Agregado import de `limit`

2. **No se podía crear nueva conversación**
   - **Problema**: Se seleccionaba automáticamente la conversación más reciente
   - **Solución**: Implementado flag `isNewConversation` para controlar la selección

3. **Indicador de escritura no se ocultaba**
   - **Problema**: `setIsLoading(false)` no se ejecutaba en todos los casos
   - **Solución**: Agregado en bloques `finally` para garantizar ejecución

4. **Error de bloqueo de peticiones**
   - **Problema**: Ad blockers bloqueaban peticiones a Firestore
   - **Solución**: Mensajes de error específicos para detectar y alertar al usuario

5. **Rol incorrecto después de login**
   - **Problema**: El rol no se actualizaba inmediatamente después de seleccionarlo
   - **Solución**: Forzar recarga completa de página después de actualizar rol

6. **Email no se verificaba automáticamente**
   - **Problema**: El link de verificación no logueaba automáticamente
   - **Solución**: Implementado `verifyEmailWithCode` y redirección automática

7. **Texto ilegible en tutorial**
   - **Problema**: Colores de texto con bajo contraste
   - **Solución**: Ajustados colores para mejor legibilidad en ambos modos

8. **Tutorial iniciaba en última página**
   - **Problema**: El tutorial recordaba la última página vista
   - **Solución**: Reset a página 0 cuando se abre el tutorial

9. **Error al exportar PDF/Texto**
   - **Problema**: `ReferenceError: es is not defined` en date-fns
   - **Solución**: Removido locale no definido de format

10. **Rol incorrecto en exportación**
    - **Problema**: Todos los usuarios aparecían como "ESTUDIANTE"
    - **Solución**: Usar `conversation.userRole` para determinar rol correcto

### 14.2 Bugs de Diseño

1. **Enlace "Olvidé mi contraseña" mal posicionado**
   - **Problema**: Estaba dentro del contenedor relativo del input
   - **Solución**: Movido fuera del contenedor relativo

2. **Página de acción de Firebase fea**
   - **Problema**: Firebase mostraba su página predeterminada
   - **Solución**: Creada página personalizada `action.html` y documentación

---

## 15. PRÓXIMAS MEJORAS

### 15.1 Funcionalidades Pendientes (TODOs)

1. **Filtros y ordenamiento avanzado en conversaciones**
   - Filtros por fecha, etiquetas, estado
   - Ordenamiento múltiple
   - Búsqueda avanzada con múltiples criterios

2. **Sistema de comentarios del docente**
   - Comentarios en conversaciones
   - Feedback privado/público
   - Notificaciones de comentarios

3. **Gráficos temporales en analíticas**
   - Gráficos de tendencias
   - Comparativas temporales
   - Exportación de gráficos

4. **Sistema de etiquetas/categorías**
   - Etiquetar conversaciones
   - Filtrar por etiquetas
   - Gestión de etiquetas

5. **Compartir conversaciones**
   - Compartir entre usuarios
   - Permisos de acceso
   - Notificaciones de compartido

6. **Modo de lectura/estudio**
   - Vista optimizada para lectura
   - Resaltado de texto
   - Notas personales

7. **Sistema de recordatorios**
   - Recordatorios programados
   - Notificaciones push
   - Calendario de actividades

8. **Mejoras de rendimiento**
   - Virtualización de listas
   - Paginación avanzada
   - Caché de datos

9. **Mejoras de accesibilidad**
   - Navegación completa por teclado
   - Screen reader optimizado
   - Contraste mejorado

---

## 16. CONFIGURACIONES ADICIONALES

### 16.1 Firebase Console

#### Dominios Autorizados
- `localhost` (desarrollo)
- Dominio de producción (cuando esté disponible)

#### Proveedores OAuth
- Google: Configurado con Client ID y Secret
- Microsoft: Configurado con Client ID y Secret

#### Templates de Email
- Email de verificación personalizado
- Email de restablecimiento de contraseña

### 16.2 PWA

#### Manifest (`manifest.json`)
- Nombre: "PBL Classroom"
- Short name: "PBL Classroom"
- Theme color: `#dc2626`
- Background color: `#f3f4f6`
- Display: `standalone`
- Iconos: 192x192, 512x512, maskable

### 16.3 Tailwind CSS

#### Colores Personalizados
```javascript
colors: {
  'uach-red': {
    50: '#fef2f2',
    100: '#fee2e2',
    // ... hasta 900
  },
  'uach-gray': {
    // ... escala completa
  }
}
```

---

## 17. MÉTRICAS Y ESTADÍSTICAS

### 17.1 Código

- **Componentes React**: 20+
- **Servicios Frontend**: 15+
- **Servicios Backend**: 4
- **Líneas de código TypeScript**: ~15,000+
- **Líneas de código Python**: ~2,000+
- **Tipos TypeScript**: 20+

### 17.2 Funcionalidades

- **Endpoints API**: 3
- **Colecciones Firestore**: 4 principales + subcolecciones
- **Modales**: 6+
- **Gráficos**: 5 tipos diferentes
- **Formularios**: 10+

---

## 18. DOCUMENTACIÓN ADICIONAL

### 18.1 Archivos de Documentación

1. **CONFIGURACION_OAUTH.md**
   - Instrucciones para configurar OAuth en Firebase
   - Pasos para Google y Microsoft
   - Configuración de dominios autorizados

2. **CONFIGURACION_PAGINA_ACCION.md**
   - Configuración de página de acción personalizada
   - Solución para página fea de Firebase
   - Instrucciones de dominio autorizado

### 18.2 Comentarios en Código

- Código comentado en español
- Documentación de funciones principales
- Explicaciones de lógica compleja
- Notas de optimización

---

## 19. TESTING Y CALIDAD

### 19.1 Validaciones Implementadas

- ✅ Validación de formularios
- ✅ Validación de tipos de archivo
- ✅ Validación de tamaños
- ✅ Validación de roles
- ✅ Validación de permisos
- ✅ Manejo de errores en todas las operaciones

### 19.2 Manejo de Errores

- ✅ Try-catch en operaciones asíncronas
- ✅ Mensajes de error descriptivos
- ✅ Logging de errores en consola
- ✅ Feedback visual de errores
- ✅ Recuperación de errores cuando es posible

---

## 20. DEPLOYMENT Y PRODUCCIÓN

### 20.1 Preparación para Producción

- ✅ Variables de entorno configuradas
- ✅ Build de producción optimizado
- ✅ PWA configurado
- ✅ Manifest.json listo
- ✅ Service Worker preparado

### 20.2 Consideraciones de Deployment

- **Frontend**: Puede desplegarse en Firebase Hosting, Vercel, Netlify
- **Backend**: Requiere servidor con Python 3.9+
- **Firebase**: Configuración en Firebase Console necesaria
- **Dominios**: Deben estar autorizados en Firebase

---

## 21. CONCLUSIÓN

### 21.1 Estado Actual del Proyecto

El proyecto **PBL Classroom** está en un estado avanzado de desarrollo con todas las funcionalidades principales implementadas y funcionando. La plataforma ofrece:

- ✅ Sistema de autenticación completo y seguro
- ✅ Interfaz de chat con IA funcional y optimizada
- ✅ Gestión completa de cursos y materiales
- ✅ Analíticas avanzadas con visualizaciones
- ✅ Diseño profesional y responsive
- ✅ Experiencia de usuario pulida
- ✅ Optimizaciones de rendimiento
- ✅ PWA funcional

### 21.2 Próximos Pasos Recomendados

1. Configurar dominio de producción en Firebase
2. Desplegar backend en servidor de producción
3. Desplegar frontend en hosting
4. Realizar pruebas de carga
5. Implementar funcionalidades pendientes según prioridad
6. Documentación de usuario final
7. Capacitación de usuarios

---

**Fecha del Informe**: Enero 2025
**Versión del Proyecto**: 1.0.0
**Estado**: Funcional y en producción (desarrollo)

