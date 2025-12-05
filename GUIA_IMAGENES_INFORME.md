# Guía de Imágenes para el Informe Técnico

## 📸 Imágenes Necesarias y Dónde Colocarlas

### Estructura de Carpetas Recomendada

Crea una carpeta `imagenes/` en la raíz del proyecto con las siguientes imágenes:

```
imagenes/
├── arquitectura/
│   ├── diagrama-arquitectura-completo.png
│   ├── flujo-autenticacion.png
│   ├── flujo-chat-ia.png
│   └── flujo-subida-archivos.png
├── interfaz/
│   ├── login.png
│   ├── registro.png
│   ├── panel-docente.png
│   ├── panel-estudiante.png
│   ├── chat-completo.png
│   ├── analiticas.png
│   └── modo-oscuro.png
├── base-datos/
│   ├── estructura-firestore.png
│   └── relaciones-colecciones.png
└── codigo/
    ├── ejemplo-api-request.png
    └── ejemplo-componente.png
```

---

## 🎯 Imágenes Específicas por Sección

### 1. SECCIÓN: Arquitectura del Sistema

#### Imagen 1: Diagrama de Arquitectura Completo
**Ubicación en LaTeX:** Después del diagrama TikZ existente (línea ~199)

**Qué capturar:**
- Un diagrama más detallado que muestre:
  - Frontend (React) con sus componentes principales
  - Backend (FastAPI) con sus servicios
  - Firebase Services (Firestore, Auth, Storage)
  - Flujos de comunicación entre capas
  - Dirección de las peticiones (HTTP, WebSocket, etc.)

**Alternativa:** Si ya tienes un diagrama mejor, reemplaza el TikZ con:
```latex
% COMENTARIO: Reemplazar el diagrama TikZ con esta imagen
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/arquitectura/diagrama-arquitectura-completo.png}
\caption{Arquitectura completa del sistema EduFlow mostrando las tres capas principales y sus interacciones}
\label{fig:arquitectura-completa}
\end{figure}
```

#### Imagen 2: Flujo de Autenticación
**Ubicación:** Después de la subsección "Flujo de Autenticación"

**Qué capturar:**
- Diagrama de flujo que muestre:
  - Usuario accede → Login → Firebase Auth → Firestore → Redirección
  - Incluir decisiones (¿email verificado? ¿rol existe?)
  - Mostrar los diferentes métodos (Email/Password, OAuth)

**Código LaTeX:**
```latex
% COMENTARIO: Agregar después de la enumeración del flujo de autenticación
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/arquitectura/flujo-autenticacion.png}
\caption{Flujo detallado del proceso de autenticación en EduFlow}
\label{fig:flujo-autenticacion}
\end{figure}
```

#### Imagen 3: Flujo de Chat con IA
**Ubicación:** Después de la subsección "Flujo de Chat con IA"

**Qué capturar:**
- Diagrama de secuencia que muestre:
  - Estudiante escribe → Frontend → Backend → OpenAI → Backend → Frontend → Firestore
  - Incluir pasos de procesamiento de archivos
  - Mostrar detección de mal uso

**Código LaTeX:**
```latex
% COMENTARIO: Agregar después de la enumeración del flujo de chat
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/arquitectura/flujo-chat-ia.png}
\caption{Flujo completo de una interacción con la IA, desde el mensaje del estudiante hasta la respuesta}
\label{fig:flujo-chat}
\end{figure}
```

---

### 2. SECCIÓN: Estructura de Base de Datos

#### Imagen 4: Estructura de Firestore
**Ubicación:** Después del esquema de Firestore (después del bloque verbatim)

**Qué capturar:**
- Captura de pantalla de Firebase Console mostrando:
  - La estructura de colecciones y subcolecciones
  - O un diagrama visual de la estructura jerárquica
  - Mostrar relaciones entre colecciones

**Código LaTeX:**
```latex
% COMENTARIO: Agregar después del esquema de Firestore
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/base-datos/estructura-firestore.png}
\caption{Estructura jerárquica de Firestore mostrando colecciones principales y subcolecciones}
\label{fig:estructura-firestore}
\end{figure}
```

#### Imagen 5: Relaciones entre Colecciones
**Ubicación:** Después de la imagen anterior

**Qué capturar:**
- Diagrama ER simplificado o diagrama de relaciones que muestre:
  - Cómo se relacionan users, courses, conversations, messages
  - Tipos de relaciones (1 a muchos, etc.)

**Código LaTeX:**
```latex
% COMENTARIO: Agregar después de la imagen de estructura
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/base-datos/relaciones-colecciones.png}
\caption{Diagrama de relaciones entre las principales colecciones de Firestore}
\label{fig:relaciones-colecciones}
\end{figure}
```

---

### 3. SECCIÓN: Componentes React

#### Imagen 6: Interfaz de Login
**Ubicación:** En la subsección de componentes de autenticación

**Qué capturar:**
- Pantallazo completo de la página de login mostrando:
  - Formulario de login/registro
  - Botones de OAuth (Google, Microsoft)
  - Diseño visual completo

**Código LaTeX:**
```latex
% COMENTARIO: Agregar en la sección de componentes de autenticación
\begin{figure}[H]
\centering
\includegraphics[width=0.85\textwidth]{imagenes/interfaz/login.png}
\caption{Interfaz de login y registro de EduFlow con opciones de autenticación}
\label{fig:interfaz-login}
\end{figure}
```

#### Imagen 7: Panel de Docente
**Ubicación:** En la subsección TeacherHome

**Qué capturar:**
- Pantallazo del panel principal del docente mostrando:
  - Sidebar con lista de cursos
  - Área principal con información del curso seleccionado
  - Secciones de estudiantes, archivos, analíticas

**Código LaTeX:**
```latex
% COMENTARIO: Agregar en la sección de TeacherHome
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/interfaz/panel-docente.png}
\caption{Panel principal del docente mostrando gestión de cursos, estudiantes y archivos}
\label{fig:panel-docente}
\end{figure}
```

#### Imagen 8: Panel de Estudiante
**Ubicación:** En la subsección StudentHome

**Qué capturar:**
- Pantallazo del panel principal del estudiante mostrando:
  - Lista de cursos inscritos
  - Header con notificaciones y configuración
  - Diseño de las tarjetas de cursos

**Código LaTeX:**
```latex
% COMENTARIO: Agregar en la sección de StudentHome
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/interfaz/panel-estudiante.png}
\caption{Panel principal del estudiante mostrando cursos inscritos y acceso al chat}
\label{fig:panel-estudiante}
\end{figure}
```

#### Imagen 9: Interfaz de Chat Completa
**Ubicación:** En la subsección ChatContainer

**Qué capturar:**
- Pantallazo completo del chat mostrando:
  - Sidebar con conversaciones
  - Área de mensajes con historial
  - Caja de entrada
  - Indicador de estado de IA
  - Botón de exportar

**Código LaTeX:**
```latex
% COMENTARIO: Agregar en la sección de ChatContainer
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{imagenes/interfaz/chat-completo.png}
\caption{Interfaz completa del chat con IA mostrando sidebar de conversaciones, mensajes y controles}
\label{fig:chat-completo}
\end{figure}
```

#### Imagen 10: Analíticas del Curso
**Ubicación:** En la sección de analíticas o en TeacherHome

**Qué capturar:**
- Pantallazo de la sección de analíticas mostrando:
  - Gráficos de actividad diaria
  - Gráfico de actividad por hora
  - Top estudiantes
  - Preguntas frecuentes
  - Tabla de estudiantes activos

**Código LaTeX:**
```latex
% COMENTARIO: Agregar en la sección de analíticas
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{imagenes/interfaz/analiticas.png}
\caption{Dashboard de analíticas del curso con gráficos y estadísticas detalladas}
\label{fig:analiticas}
\end{figure}
```

---

### 4. SECCIÓN: APIs y Endpoints

#### Imagen 11: Ejemplo de Request/Response de API
**Ubicación:** Después de la documentación del endpoint POST /api/chat/feedback

**Qué capturar:**
- Captura de Postman, Insomnia o similar mostrando:
  - Request completo con headers y body
  - Response exitoso con la estructura JSON
  - O captura de la documentación automática de FastAPI (Swagger)

**Código LaTeX:**
```latex
% COMENTARIO: Agregar después de la documentación del endpoint
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/codigo/ejemplo-api-request.png}
\caption{Ejemplo de petición y respuesta del endpoint /api/chat/feedback}
\label{fig:ejemplo-api}
\end{figure}
```

---

### 5. SECCIÓN: Optimizaciones

#### Imagen 12: Comparación de Rendimiento (Opcional)
**Ubicación:** En la sección de optimizaciones

**Qué capturar:**
- Gráfico comparativo mostrando:
  - Tiempo de respuesta antes/después de optimizaciones
  - Uso de tokens antes/después
  - O métricas de rendimiento

**Código LaTeX:**
```latex
% COMENTARIO: Opcional - Agregar si tienes métricas de rendimiento
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/optimizaciones/comparacion-rendimiento.png}
\caption{Comparación de rendimiento antes y después de las optimizaciones implementadas}
\label{fig:rendimiento}
\end{figure}
```

---

## 📋 Instrucciones Detalladas para Capturar Pantallazos

### Herramientas Recomendadas

1. **Windows:**
   - `Win + Shift + S`: Herramienta de recorte
   - Snipping Tool
   - ShareX (gratis, muy potente)

2. **macOS:**
   - `Cmd + Shift + 4`: Captura de área seleccionada
   - `Cmd + Shift + 3`: Captura de pantalla completa
   - Captura (aplicación nativa)

3. **Navegador:**
   - Extensiones como "Awesome Screenshot"
   - DevTools: Captura de elementos específicos

### Configuración Recomendada

1. **Resolución:**
   - Captura en resolución nativa de tu pantalla
   - Si es 4K, considera reducir a 1920x1080 para mejor compatibilidad
   - O usa zoom del navegador al 100% o 125%

2. **Formato:**
   - Guarda como PNG (mejor calidad)
   - O JPG con alta calidad (90%+)
   - Evita formatos con pérdida si hay texto

3. **Tamaño:**
   - Optimiza imágenes grandes antes de incluir
   - Usa herramientas como TinyPNG o ImageOptim
   - Objetivo: < 500KB por imagen

### Preparación del Entorno para Capturas

1. **Antes de capturar:**
   - Cierra pestañas innecesarias
   - Desactiva extensiones que puedan distraer
   - Usa modo incógnito si es necesario
   - Asegúrate de tener datos de prueba cargados

2. **Datos de prueba recomendados:**
   - Al menos 2-3 cursos creados
   - Algunos estudiantes inscritos
   - Archivos subidos
   - Conversaciones de ejemplo
   - Datos en analíticas

---

## 🎨 Especificaciones por Imagen

### Imagen: Login
**Qué mostrar:**
- Formulario completo de login/registro
- Ambos modos (login y registro) si es posible, o dos capturas separadas
- Botones de OAuth visibles
- Logo de la universidad si está visible

**Ángulo:** Pantalla completa o área del formulario centrada

**Modo:** Claro (más legible para documentación)

---

### Imagen: Panel Docente
**Qué mostrar:**
- Sidebar con lista de cursos (al menos 2-3 cursos)
- Área principal con un curso seleccionado
- Sección de estudiantes con algunos estudiantes
- Sección de archivos con archivos subidos
- Botones de acción visibles

**Ángulo:** Pantalla completa o área principal

**Modo:** Claro

---

### Imagen: Panel Estudiante
**Qué mostrar:**
- Lista de cursos inscritos (2-3 cursos)
- Header completo con notificaciones
- Diseño de las tarjetas de cursos
- Estado "Activo" visible

**Ángulo:** Pantalla completa

**Modo:** Claro

---

### Imagen: Chat Completo
**Qué mostrar:**
- Sidebar con múltiples conversaciones
- Área de mensajes con historial de conversación
- Mensajes del usuario y de la IA visibles
- Caja de entrada
- Indicador de estado de IA
- Botón de exportar
- Archivos del curso (si están visibles)

**Ángulo:** Pantalla completa

**Modo:** Claro (más legible)

---

### Imagen: Analíticas
**Qué mostrar:**
- Resumen con las 4 métricas principales
- Al menos 2-3 gráficos visibles
- Tabla de estudiantes activos
- Preguntas frecuentes (si hay datos)
- Botón "Ver análisis completo" visible

**Ángulo:** Pantalla completa o scroll para mostrar todo

**Modo:** Claro

---

## 📝 Código LaTeX Completo con Comentarios

Aquí está el código LaTeX con todos los comentarios indicando dónde colocar cada imagen:

```latex
% ============================================
% SECCIÓN: ARQUITECTURA DEL SISTEMA
% ============================================

\subsection{Diagrama de Arquitectura}

% COMENTARIO: El diagrama TikZ actual está bien, pero puedes complementarlo
% o reemplazarlo con una imagen más detallada si la tienes.
% Si tienes un diagrama mejor, usa esto:

% \begin{figure}[H]
% \centering
% \includegraphics[width=0.9\textwidth]{imagenes/arquitectura/diagrama-arquitectura-completo.png}
% \caption{Arquitectura completa del sistema EduFlow}
% \label{fig:arquitectura-completa}
% \end{figure}

% COMENTARIO: Después del flujo de autenticación (después de la enumeración)
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/arquitectura/flujo-autenticacion.png}
\caption{Flujo detallado del proceso de autenticación}
\label{fig:flujo-autenticacion}
\end{figure}

% COMENTARIO: Después del flujo de chat con IA
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/arquitectura/flujo-chat-ia.png}
\caption{Flujo completo de interacción con la IA}
\label{fig:flujo-chat}
\end{figure}

% ============================================
% SECCIÓN: ESTRUCTURA DE BASE DE DATOS
% ============================================

% COMENTARIO: Después del esquema de Firestore (después del bloque verbatim)
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/base-datos/estructura-firestore.png}
\caption{Estructura jerárquica de Firestore}
\label{fig:estructura-firestore}
\end{figure}

% COMENTARIO: Diagrama de relaciones (opcional pero recomendado)
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/base-datos/relaciones-colecciones.png}
\caption{Relaciones entre colecciones principales}
\label{fig:relaciones-colecciones}
\end{figure}

% ============================================
% SECCIÓN: COMPONENTES REACT
% ============================================

\subsubsection{Login}

% COMENTARIO: Agregar imagen de la interfaz de login
\begin{figure}[H]
\centering
\includegraphics[width=0.85\textwidth]{imagenes/interfaz/login.png}
\caption{Interfaz de login y registro de EduFlow}
\label{fig:interfaz-login}
\end{figure}

\subsubsection{TeacherHome}

% COMENTARIO: Agregar imagen del panel de docente
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/interfaz/panel-docente.png}
\caption{Panel principal del docente con gestión de cursos}
\label{fig:panel-docente}
\end{figure}

\subsubsection{StudentHome}

% COMENTARIO: Agregar imagen del panel de estudiante
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/interfaz/panel-estudiante.png}
\caption{Panel principal del estudiante con cursos inscritos}
\label{fig:panel-estudiante}
\end{figure}

\subsubsection{ChatContainer}

% COMENTARIO: Agregar imagen del chat completo
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{imagenes/interfaz/chat-completo.png}
\caption{Interfaz completa del chat con IA}
\label{fig:chat-completo}
\end{figure}

% COMENTARIO: Agregar imagen de analíticas (puede ir en sección de analíticas o aquí)
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{imagenes/interfaz/analiticas.png}
\caption{Dashboard de analíticas con gráficos y estadísticas}
\label{fig:analiticas}
\end{figure}

% ============================================
% SECCIÓN: APIs Y ENDPOINTS
% ============================================

% COMENTARIO: Después de la documentación del endpoint POST /api/chat/feedback
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/codigo/ejemplo-api-request.png}
\caption{Ejemplo de petición y respuesta del endpoint /api/chat/feedback}
\label{fig:ejemplo-api}
\end{figure}

% COMENTARIO: Opcional - Documentación automática de FastAPI (Swagger UI)
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{imagenes/codigo/swagger-docs.png}
\caption{Documentación automática de la API generada por FastAPI}
\label{fig:swagger}
\end{figure}
```

---

## ✅ Checklist de Imágenes

Marca las imágenes que ya tienes o necesitas capturar:

### Arquitectura
- [ ] Diagrama de arquitectura completo (o mantener TikZ)
- [ ] Flujo de autenticación
- [ ] Flujo de chat con IA
- [ ] Flujo de subida de archivos (opcional)

### Base de Datos
- [ ] Estructura de Firestore (Firebase Console)
- [ ] Diagrama de relaciones (opcional)

### Interfaz
- [ ] Login/Registro
- [ ] Panel de Docente
- [ ] Panel de Estudiante
- [ ] Chat completo
- [ ] Analíticas
- [ ] Modo oscuro (opcional, para mostrar la característica)

### Código/APIs
- [ ] Ejemplo de request/response de API
- [ ] Swagger UI de FastAPI (opcional pero muy útil)

---

## 💡 Consejos Adicionales

1. **Anotaciones:** Si es necesario, usa herramientas como Annotate (Chrome) para agregar flechas o círculos destacando elementos importantes.

2. **Consistencia:** Usa el mismo modo (claro u oscuro) para todas las capturas, a menos que quieras mostrar específicamente el modo oscuro.

3. **Datos de prueba:** Asegúrate de tener datos realistas pero no personales en las capturas.

4. **Privacidad:** Bloquea o difumina cualquier información sensible (emails reales, nombres reales, etc.).

5. **Calidad:** Las imágenes deben ser nítidas y legibles. Si hay texto, debe ser claramente visible.

---

## 📦 Estructura Final de Archivos

Después de capturar, tu estructura debería ser:

```
proyecto/
├── INFORME_TECNICO.tex
├── imagenes/
│   ├── arquitectura/
│   │   ├── flujo-autenticacion.png
│   │   └── flujo-chat-ia.png
│   ├── base-datos/
│   │   └── estructura-firestore.png
│   ├── interfaz/
│   │   ├── login.png
│   │   ├── panel-docente.png
│   │   ├── panel-estudiante.png
│   │   ├── chat-completo.png
│   │   └── analiticas.png
│   └── codigo/
│       └── ejemplo-api-request.png
```

---

¿Necesitas ayuda con alguna captura específica o quieres que te ayude a modificar el archivo LaTeX directamente con los comentarios?

