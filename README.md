# Plataforma de Apoyo Académico con IAG para PBL

**Plataforma de apoyo académico con Inteligencia Artificial Generativa (IAG) para actividades basadas en problemas (PBL) con retroalimentación trazable, oportuna y personalizada**

---

## Presentación General

### 1.1. Título

Plataforma de apoyo académico con IAG para PBL, orientada a potenciar la retroalimentación formativa, la autonomía del estudiante y la eficiencia docente, mediante respuestas sustentadas en fuentes del curso y con trazabilidad explícita.

### 1.2. Resumen Ejecutivo

Se propone una plataforma educativa que integra modelos de lenguaje con recuperación aumentada (RAG) para asistir procesos de aprendizaje basado en problemas (PBL). El sistema permite a estudiantes realizar consultas durante la resolución de problemas y recibir retroalimentación inmediata sustentada exclusivamente en documentos validados del curso (guías, papers, presentaciones, rúbricas). Las respuestas incluyen citas a los fragmentos utilizados, lo que favorece la trazabilidad, el pensamiento crítico y la alfabetización informacional.

Para el cuerpo docente, la plataforma entrega un panel analítico con métricas de uso (frecuencia de consultas, temas más demandados, latencia) y evidencia de patrones de aprendizaje que facilitan decisiones pedagógicas. Se incorporan instrumentos de evaluación (encuestas pre/post, rúbrica PBL) y un marco robusto de ética, privacidad y seguridad, coherente con los estándares institucionales.

### 1.3. Justificación

- **Necesidad pedagógica**: El PBL requiere retroalimentación formativa frecuente, específica y contextualizada. La limitada disponibilidad de tiempo docente en grupos numerosos restringe la oportunidad y la personalización del feedback.

- **Fortaleza de IAG + RAG**: La generación con recuperación de fuentes institucionales reduce alucinaciones y mejora la alineación curricular, garantizando respuestas explicables y auditables.

- **Impacto esperado**: Mejora en calidad y oportunidad del feedback, incremento de autonomía y autorregulación del estudiante, y eficiencia en tareas docentes repetitivas.

- **Pertinencia institucional**: Posibilita escalabilidad a múltiples asignaturas y carreras, coherente con políticas de calidad académica, ética de datos y transformación digital responsable.

### 1.4. Objetivo General

Diseñar, desarrollar y validar una plataforma con IAG y RAG para apoyar actividades PBL, que entregue retroalimentación formativa trazable, mejore la autonomía estudiantil y optimice la eficiencia docente, con evidencia empírica del impacto educativo.

### 1.5. Objetivos Específicos

1. Construir un repositorio curricular (por curso) con control docente de documentos, políticas de calidad y versionado.
2. Implementar un chat académico por curso que responda solo con base en dicho repositorio y cite fragmentos utilizados.
3. Diseñar un panel docente con métricas de uso, temas emergentes y latencia, preservando privacidad.
4. Definir e implementar instrumentos de evaluación (encuestas, rúbrica PBL) y un protocolo de validación de resultados.
5. Establecer un marco de gobernanza (ética, privacidad, seguridad, auditoría, integridad académica) aplicable a la plataforma.
6. Documentar KPIs y criterios de calidad pedagógica y técnica para la escalabilidad institucional.

---

## Características Principales

### Para Estudiantes
- Chat académico con retroalimentación inmediata basada en documentos del curso
- Acceso a cursos inscritos con materiales validados
- Historial de conversaciones y consultas
- Respuestas sustentadas en fuentes del curso (con citas)
- Guía socrática para resolución de problemas (metodología PBL)

### Para Docentes
- Gestión de cursos y estudiantes
- Carga y gestión de documentos del curso (PDF, DOCX, PPTX)
- Panel analítico con métricas de uso y actividad
- Visualización de preguntas frecuentes y temas emergentes
- Control sobre fuentes y políticas de calidad

### Características Técnicas
- Autenticación por roles (docente, estudiante)
- Integración con OpenAI GPT-4o-mini para generación de respuestas
- Extracción de contenido de archivos del curso
- Detección de mal uso de IA
- Sistema de notificaciones
- Interfaz responsive con modo oscuro

---

## Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- FastAPI (Python) - API REST
- OpenAI GPT-4o-mini - Modelo de lenguaje
- Python-dotenv - Gestión de configuración
- PyPDF2, python-docx - Extracción de contenido

**Frontend:**
- React 19 + TypeScript - Framework UI
- Vite - Build tool
- Tailwind CSS - Estilos
- Firebase SDK - Autenticación, Firestore, Storage
- React Router - Navegación
- Zustand - Estado global

**Base de Datos:**
- Firebase Firestore - Base de datos NoSQL
- Firebase Storage - Almacenamiento de archivos
- Firebase Authentication - Autenticación de usuarios

### Estado Actual vs. Visión Futura

#### Implementado (MVP)
- Autenticación por roles
- Gestión de cursos y documentos
- Chat con IA usando contenido de archivos
- Panel docente básico con métricas
- Extracción de texto de PDFs y DOCX
- Sistema de notificaciones
- Interfaz de usuario completa

#### En Desarrollo / Planificado
- Sistema RAG completo con embeddings y búsqueda vectorial
- Citas explícitas a documentos/páginas en respuestas
- Sistema de versionado de documentos
- Instrumentos de evaluación (encuestas pre/post, rúbrica PBL)
- Sistema de auditoría completo
- Políticas de calidad de fuentes con metadatos
- Integración con LMS (Canvas/Moodle)
- Exportación de métricas en CSV/JSON

---

## Guía de Instalación

Esta guía te ayudará a instalar y configurar el proyecto en macOS.

## Requisitos Previos

Antes de comenzar, necesitas instalar las siguientes herramientas:

### 1. Homebrew (Gestor de paquetes para Mac)

Si no tienes Homebrew instalado, ejecuta en la terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Python 3.9 o superior

```bash
# Instalar Python usando Homebrew
brew install python@3.11

# Verificar la instalación
python3 --version
```

### 3. Node.js y npm

```bash
# Instalar Node.js (incluye npm)
brew install node

# Verificar la instalación
node --version
npm --version
```

**Nota:** Se recomienda usar Node.js versión 18 o superior.

### 4. Git (si no está instalado)

```bash
# Verificar si Git está instalado
git --version

# Si no está instalado:
brew install git
```

### 5. Cuenta de Firebase (para configuración)

**Nota importante:** Firebase no requiere instalación local. El paquete `firebase` se instalará automáticamente cuando ejecutes `npm install` en el frontend. Sin embargo, necesitas:

- Una cuenta de Google (para acceder a Firebase Console)
- Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Configurar los servicios necesarios (Authentication, Firestore, Storage)

Verás los detalles en el **Paso 3** de la instalación.

## Instalación del Proyecto

### Paso 1: Clonar el repositorio

```bash
# Si aún no has clonado el repositorio
git clone <url-del-repositorio>
cd pbl-inteligencia
```

### Paso 2: Configurar el Backend

1. **Navegar al directorio del backend:**
```bash
cd backend
```

2. **Crear un entorno virtual:**
```bash
python3 -m venv venv
```

3. **Activar el entorno virtual:**
```bash
# En macOS/Linux
source venv/bin/activate
```

4. **Instalar las dependencias:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

5. **Configurar variables de entorno:**

Crea un archivo `.env` en el directorio `backend/`:

```bash
# Desde el directorio backend/
touch .env
```

Edita el archivo `.env` y agrega:

```env
OPENAI_API_KEY=tu_clave_api_openai_aqui
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

**Importante:** Reemplaza `tu_clave_api_openai_aqui` con tu clave real de OpenAI.

### Paso 3: Configurar Firebase

**Nota:** Firebase se instalará automáticamente cuando ejecutes `npm install` en el frontend (ya está en las dependencias). Sin embargo, necesitas configurar un proyecto en Firebase Console primero.

1. **Crear un proyecto en Firebase Console:**

   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Haz clic en "Agregar proyecto" o "Add project"
   - Sigue los pasos para crear tu proyecto
   - Una vez creado, haz clic en el ícono de configuración y selecciona "Configuración del proyecto"

2. **Habilitar los servicios necesarios:**

   - **Authentication (Autenticación):**
     - Ve a "Authentication" en el menú lateral
     - Haz clic en "Comenzar" o "Get started"
     - Habilita el proveedor de autenticación que necesites (Email/Password, Google, etc.)

   - **Firestore Database:**
     - Ve a "Firestore Database" en el menú lateral
     - Haz clic en "Crear base de datos" o "Create database"
     - Selecciona modo de prueba (test mode) para desarrollo
     - Elige una ubicación para tu base de datos

   - **Storage:**
     - Ve a "Storage" en el menú lateral
     - Haz clic en "Comenzar" o "Get started"
     - Sigue los pasos de configuración inicial

3. **Obtener las credenciales de configuración:**

   - En "Configuración del proyecto" > "Tus aplicaciones"
   - Haz clic en el ícono de web (</>) para agregar una app web
   - Registra tu app con un nombre (ej: "PBL Inteligencia")
   - Copia las credenciales que se muestran (apiKey, authDomain, projectId, etc.)

### Paso 4: Configurar el Frontend

1. **Navegar al directorio del frontend:**
```bash
# Desde la raíz del proyecto
cd frontend
```

2. **Instalar las dependencias (incluye Firebase automáticamente):**
```bash
npm install
```

**Nota:** El paquete `firebase` se instalará automáticamente con este comando, ya que está listado en `package.json`. No necesitas instalarlo por separado.

3. **Configurar variables de entorno:**

Crea un archivo `.env` en el directorio `frontend/`:

```bash
# Desde el directorio frontend/
touch .env
```

Edita el archivo `.env` y agrega tu configuración de Firebase (las credenciales que copiaste en el paso anterior):

```env
VITE_FIREBASE_API_KEY=tu_api_key_de_firebase
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**Importante:** Reemplaza los valores con las credenciales reales que obtuviste de Firebase Console.

## Ejecutar el Proyecto

### Iniciar el Backend

1. **Navegar al directorio backend y activar el entorno virtual:**
```bash
cd backend
source venv/bin/activate
```

2. **Iniciar el servidor:**

**Importante:** Asegúrate de estar en el directorio `backend/` cuando ejecutes este comando.

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Nota:** El formato es `app.main:app` (con dos puntos `:`, no punto). Esto indica:
- `app.main` = el módulo (app/main.py)
- `app` = la variable FastAPI dentro de ese módulo

**Alternativa si tienes problemas:**
```bash
# Opción 1: Usar python -m
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Ejecutar directamente el archivo main.py
python app/main.py
```

El backend estará disponible en: `http://localhost:8000`

### Iniciar el Frontend

Abre una **nueva terminal** (mantén el backend corriendo):

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Verificar la Instalación

1. **Backend:** Visita `http://localhost:8000/docs` para ver la documentación interactiva de la API (Swagger UI).

2. **Frontend:** Abre tu navegador en `http://localhost:5173` y deberías ver la aplicación.

## Notas Importantes

### Variables de Entorno

- **Nunca** subas los archivos `.env` al repositorio (deben estar en `.gitignore`).
- Mantén tus claves API seguras y no las compartas.

### Solución de Problemas Comunes

#### Error: "python3: command not found"
```bash
# Asegúrate de que Python esté en tu PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Error: "node: command not found"
```bash
# Verifica que Node.js esté instalado
which node
# Si no está, reinstala:
brew reinstall node
```

#### Error al instalar dependencias de Python
```bash
# Asegúrate de estar usando pip del entorno virtual
which pip  # Debe apuntar a venv/bin/pip
# Si no, activa el entorno virtual nuevamente
source venv/bin/activate
```

#### Error de permisos en macOS
```bash
# Si tienes problemas de permisos con pip
pip install --user -r requirements.txt
```

#### Error: "Import string 'app.main.app' must be in format '<module>:<attribute>'"
Este error ocurre cuando el formato del import string es incorrecto o estás ejecutando desde el directorio equivocado.

**Solución:**
1. **Verifica que estés en el directorio correcto:**
```bash
# Debes estar en el directorio backend/
cd backend
pwd  # Debe mostrar: .../pbl-inteligencia/backend
```

2. **Verifica que el formato use dos puntos (:) no punto (.):**
```bash
# Correcto (con dos puntos)
uvicorn app.main:app --reload

# Incorrecto (con punto)
uvicorn app.main.app --reload
```

3. **Si el problema persiste, usa una de estas alternativas:**
```bash
# Opción 1: Usar python -m uvicorn
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Ejecutar directamente main.py
python app/main.py

# Opción 3: Verificar que el entorno virtual esté activado
source venv/bin/activate
which uvicorn  # Debe apuntar a venv/bin/uvicorn
```

#### Puerto ya en uso
```bash
# Si el puerto 8000 o 5173 están ocupados, puedes cambiarlos:
# Backend: modifica PORT en backend/.env
# Frontend: modifica vite.config.ts o usa: npm run dev -- --port 3000
```

## Comandos Útiles

### Backend
```bash
# Activar entorno virtual
source venv/bin/activate

# Desactivar entorno virtual
deactivate

# Ver dependencias instaladas
pip list

# Actualizar dependencias
pip install --upgrade -r requirements.txt
```

### Frontend
```bash
# Instalar nuevas dependencias
npm install <nombre-paquete>

# Construir para producción
npm run build

# Ejecutar linter
npm run lint

# Previsualizar build de producción
npm run preview
```

## Estructura del Proyecto

```
pbl-inteligencia/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── main.py      # Punto de entrada
│   │   ├── config.py    # Configuración
│   │   ├── models.py    # Modelos de datos
│   │   └── services/    # Servicios (OpenAI, Claude, etc.)
│   ├── venv/            # Entorno virtual (no subir a git)
│   ├── requirements.txt # Dependencias Python
│   └── .env             # Variables de entorno (no subir a git)
│
└── frontend/            # Aplicación React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── services/    # Servicios de API
    │   └── config/      # Configuración
    ├── package.json     # Dependencias Node.js
    └── .env             # Variables de entorno (no subir a git)
```

## Soporte

Si encuentras problemas durante la instalación:

1. Verifica que todas las herramientas estén correctamente instaladas.
2. Asegúrate de que las versiones de Python y Node.js sean compatibles.
3. Revisa que los archivos `.env` estén correctamente configurados.
4. Consulta los logs de error en la terminal para más detalles.

---

## Ética, Privacidad y Seguridad

### Principios Éticos

- **Finalidad educativa**: La IAG complementa, no reemplaza, la labor docente.
- **Transparencia**: El sistema informa claramente qué hace y qué no hace.
- **No daño**: Límites temáticos; bloqueo de respuestas fuera del currículo.
- **Equidad**: Accesibilidad, lenguaje claro, mitigación de sesgos.

### Privacidad y Protección de Datos

- **Consentimiento informado**: Los usuarios son informados sobre el uso de datos.
- **Anonimización**: Los registros de interacción se anonimizan/pseudonimizan.
- **Minimización**: Solo se recolecta lo estrictamente necesario.
- **Retención**: Política explícita de retención y eliminación de datos.

### Seguridad de la Información

- **Cifrado**: TLS 1.2+ en tránsito, hashing robusto de contraseñas.
- **Control de acceso**: Segregación por roles y cursos.
- **Auditoría**: Registro de eventos críticos (subida/borrado de documentos).
- **Gestión de vulnerabilidades**: Parches regulares y revisión de dependencias.

### Integridad Académica

- **Respuestas respaldadas**: Todas las respuestas deben estar sustentadas en documentos del curso.
- **Rechazo de consultas fuera del alcance**: El sistema rechaza consultas que requieran información fuera del repositorio.
- **Trazabilidad**: Registro completo para auditorías pedagógicas.

---

## Evaluación e Indicadores (KPIs)

### KPIs Técnicos

- **Oportunidad del feedback (KPI-T)**: Tiempo desde envío de consulta a entrega de respuesta útil.
  - Meta: media ≤ 2 s; 95p ≤ 3 s
- **Disponibilidad**: 99,5% mensual
- **Usabilidad**: SUS ≥ 80 (promedio post-uso)
- **Accesibilidad**: Conformidad WCAG 2.1 AA

### KPIs Pedagógicos

- **Utilidad percibida (KPI-U)**: Promedio de ítems Likert (1–5) sobre claridad, aplicabilidad, ayuda para mejorar.
  - Meta: ≥ 4,0
- **Desempeño en PBL (KPI-R)**: Puntaje de rúbrica PBL
  - Meta: +10% vs. control o pretest
- **Autonomía/autorregulación (KPI-A)**: Subescalas SRL/autoeficacia
  - Meta: +10% pre-post
- **Eficiencia docente (KPI-D)**: Reducción de horas/semana en corrección/retroalimentación manual
  - Meta: −30%

### Instrumentos de Evaluación

- **Encuesta de percepción**: 15 ítems Likert (1–5) sobre oportunidad, utilidad, claridad, confianza, etc.
- **Rúbrica PBL**: Evaluación de comprensión del problema, uso de evidencias, diseño de soluciones, etc.
- **Bitácora docente**: Registro semanal de horas de corrección y observaciones cualitativas.
- **Focus groups**: Entrevistas con docentes y estudiantes sobre utilidad y mejoras.

---

## Referencias y Documentación

### Marco Teórico

- **PBL (Aprendizaje Basado en Problemas)**: Metodología que promueve el desarrollo de competencias complejas mediante la resolución de situaciones auténticas.
- **IAG (Inteligencia Artificial Generativa)**: Modelos de lenguaje que permiten sintetizar, explicar y generar texto.
- **RAG (Recuperación Aumentada)**: Combina búsqueda semántica sobre un índice de documentos y generación condicionada.

### Flujos Críticos

1. **Subida e indexación de documentos**: Verificación → Extracción → Chunking → Embeddings → Almacenamiento
2. **Consulta y respuesta con citas**: Embedding de consulta → Recuperación top-k → Construcción de contexto → Generación condicionada
3. **Panel analítico**: Visualización de uso, temas recurrentes, métricas de latencia

---

## Contribución

Este es un proyecto de innovación educativa. Para contribuir:

1. Revisa el estado actual vs. visión futura para identificar áreas de desarrollo
2. Sigue las mejores prácticas de código y documentación
3. Asegúrate de cumplir con los principios de ética, privacidad y seguridad
4. Documenta cambios y mejoras

---

## Contacto

**Rocio Povea Diaz**

- Email: povea_@outlook.com
- LinkedIn: [povea-diaz](https://www.linkedin.com/in/povea-diaz/)

---

## Licencia

Copyright (c) 2024 Rocio Povea Diaz

Todos los derechos reservados.

Este proyecto y su código fuente están protegidos por derechos de autor. Se prohíbe la reproducción, distribución o uso sin el permiso explícito del autor.

---

Para más información sobre el proyecto, consulta el documento completo de diseño y especificaciones técnicas.

