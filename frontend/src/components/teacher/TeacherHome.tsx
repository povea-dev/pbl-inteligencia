import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/coursesService';
import { filesService } from '../../services/filesService';
import { studentsService, Student } from '../../services/studentsService';
import { Course, CourseFile, AppUser } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SettingsModal } from '../common/SettingsModal';
import { OnboardingTutorial } from '../common/OnboardingTutorial';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { Analytics } from './Analytics';
import { markTutorialAsSeen } from '../../services/authService';
import { 
  LogOut, 
  BookOpen, 
  Plus, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  X,
  User,
  GraduationCap,
  Zap,
  Users,
  Mail,
  AlertCircle,
  Loader2,
  Trash2,
  Settings,
  Circle,
  Moon,
  Sun
} from 'lucide-react';

interface TeacherHomeProps {
  user: AppUser;
  onLogout: () => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser>(user);
  
  // Modal de crear curso
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  
  // Agregar estudiante
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await coursesService.getCoursesByTeacher(user.uid);
      setCourses(coursesData);
      
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  // Mostrar tutorial si es la primera vez
  useEffect(() => {
    if (!currentUser.hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [currentUser.hasSeenTutorial]);

  const handleTutorialClose = async () => {
    setShowTutorial(false);
    try {
      await markTutorialAsSeen(currentUser.uid);
      setCurrentUser({ ...currentUser, hasSeenTutorial: true });
    } catch (error) {
      console.error('Error marcando tutorial como visto:', error);
    }
  };

  const loadFiles = useCallback(async () => {
    if (!selectedCourse) {
      setFiles([]);
      return;
    }
    
    try {
      const filesData = await filesService.getCourseFiles(selectedCourse.id);
      setFiles(filesData);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setFiles([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const loadStudents = useCallback(async () => {
    if (!selectedCourse) {
      console.log('[TeacherHome] loadStudents: No hay curso seleccionado');
      return;
    }
    
    console.log('[TeacherHome] loadStudents: Cargando estudiantes para curso:', {
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title
    });
    
    try {
      const studentsData = await studentsService.getCourseStudents(selectedCourse.id);
      console.log('[TeacherHome] loadStudents: Estudiantes cargados:', {
        cantidad: studentsData.length,
        estudiantes: studentsData.map(s => ({
          id: s.id,
          email: s.email,
          displayName: s.displayName
        }))
      });
      setStudents(studentsData);
    } catch (error) {
      console.error('[TeacherHome] Error cargando estudiantes:', error);
      setStudents([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleRemoveStudent = async (enrollmentId: string, studentName: string) => {
    if (!selectedCourse) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${studentName} del curso "${selectedCourse.title}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;
    
    setRemovingStudentId(enrollmentId);
    
    try {
      console.log('[TeacherHome] Eliminando estudiante:', {
        courseId: selectedCourse.id,
        enrollmentId,
        studentName
      });
      
      await studentsService.removeStudentFromCourse(selectedCourse.id, enrollmentId);
      
      console.log('[TeacherHome] Estudiante eliminado exitosamente');
      
      // Recargar la lista de estudiantes
      await loadStudents();
      
      // Mostrar mensaje de éxito
      alert(`${studentName} ha sido eliminado del curso exitosamente`);
      
    } catch (error: any) {
      console.error('[TeacherHome] Error eliminando estudiante:', error);
      alert(`Error al eliminar estudiante: ${error.message || 'Error desconocido'}`);
    } finally {
      setRemovingStudentId(null);
    }
  };

  const handleAddStudent = async () => {
    console.log('[TeacherHome] handleAddStudent llamado');
    console.log('[TeacherHome] Estado actual:', {
      hasSelectedCourse: !!selectedCourse,
      selectedCourseId: selectedCourse?.id,
      selectedCourseTitle: selectedCourse?.title,
      studentEmail: studentEmail,
      studentEmailTrimmed: studentEmail.trim(),
      hasEmail: !!studentEmail.trim()
    });
    
    if (!selectedCourse) {
      console.error('[TeacherHome] ERROR: No hay curso seleccionado');
      setStudentError('Por favor, selecciona un curso primero');
      return;
    }
    
    if (!studentEmail.trim()) {
      console.error('[TeacherHome] ERROR: No hay email ingresado');
      setStudentError('Por favor, ingresa el email del estudiante');
      return;
    }
    
    console.log('[TeacherHome] Iniciando proceso de agregar estudiante...');
    setAddingStudent(true);
    setStudentError(null);
    
    try {
      const emailToAdd = studentEmail.trim();
      console.log('[TeacherHome] Intentando agregar estudiante:', {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        studentEmail: emailToAdd
      });
      
      // Obtener nombre del docente para la notificación
      const teacherFullName = user.displayName || 
        (user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.email || 'Profesor');
      
      await studentsService.addStudentToCourse(selectedCourse.id, emailToAdd, teacherFullName);
      
      console.log('[TeacherHome] Estudiante agregado exitosamente');
      
      // Mostrar mensaje de éxito temporalmente
      setStudentError(null);
      setStudentEmail('');
      
      // Recargar la lista de estudiantes
      await loadStudents();
      
      // Mostrar mensaje de éxito (podríamos usar un toast aquí)
      alert(`Estudiante ${emailToAdd} agregado exitosamente al curso`);
      
    } catch (error: any) {
      console.error('[TeacherHome] Error agregando estudiante:', error);
      console.error('[TeacherHome] Stack trace:', error.stack);
      
      let errorMessage = 'Error al agregar estudiante';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Error de Firebase: ${error.code}`;
      }
      
      setStudentError(errorMessage);
      
      // Mostrar error más detallado en consola
      if (errorMessage.includes('No se encontró')) {
        console.error('[TeacherHome] El estudiante no existe en la base de datos. Asegúrate de que:');
        console.error('  1. El estudiante haya iniciado sesión al menos una vez');
        console.error('  2. El email sea exactamente el mismo que usó para registrarse');
        console.error('  3. El estudiante tenga el rol "student" en su perfil');
      } else if (errorMessage.includes('ya está inscrito')) {
        console.warn('[TeacherHome] El estudiante ya está inscrito en este curso');
      } else {
        console.error('[TeacherHome] Error desconocido:', {
          error,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      }
      
      // Mostrar alerta con el error
      alert(`Error al agregar estudiante: ${errorMessage}`);
    } finally {
      setAddingStudent(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      alert('El título del curso es obligatorio');
      return;
    }

    try {
      // Obtener nombre completo del docente
      const teacherFullName = user.displayName || 
        (user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.email || 'Profesor');
      
      const newCourse = await coursesService.createCourse(
        newCourseTitle.trim(),
        newCourseDescription.trim(),
        user.uid,
        teacherFullName
      );
      
      // Recargar cursos
      const updatedCourses = await coursesService.getCoursesByTeacher(user.uid);
      setCourses(updatedCourses);
      
      // Seleccionar el curso recién creado (buscar por ID)
      const createdCourse = updatedCourses.find(c => c.id === newCourse.id);
      if (createdCourse) {
        setSelectedCourse(createdCourse);
      } else if (updatedCourses.length > 0) {
        // Si no se encuentra, seleccionar el primero
        setSelectedCourse(updatedCourses[0]);
      }
      
      setShowCreateModal(false);
      setNewCourseTitle('');
      setNewCourseDescription('');
    } catch (error) {
      console.error('Error creando curso:', error);
      alert('Error al crear el curso. Por favor, intenta nuevamente.');
    }
  };

  const handleFileUploaded = (file: CourseFile) => {
    setFiles([...files, file]);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedCourse) return;
    
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      await filesService.deleteFile(selectedCourse.id, fileId, file.url);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const handleGoToChat = () => {
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.id}/chat`);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el curso "${courseTitle}"?\n\nEsta acción no se puede deshacer y eliminará:\n- Todas las conversaciones\n- Todos los mensajes\n- Todos los archivos\n- Todas las inscripciones de estudiantes`)) {
      return;
    }

    try {
      await coursesService.deleteCourse(courseId);
      
      // Si el curso eliminado era el seleccionado, limpiar selección
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
      
      // Recargar cursos
      await loadCourses();
      
      // Si no hay cursos, selectedCourse ya será null
      if (courses.length === 1) {
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error('Error eliminando curso:', error);
      alert('Error al eliminar el curso. Por favor, intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-red-50 to-slate-100'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4 ${
            darkMode 
              ? 'border-red-800 border-t-red-400' 
              : 'border-red-200 border-t-red-600'
          }`}></div>
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-red-50 to-slate-100'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-lg border-b shadow-sm sticky top-0 z-40 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 via-orange-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 group flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400/0 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <span className="truncate">Panel de Docente</span>
                  <GraduationCap className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </h1>
                <p className={`text-sm mt-0.5 flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <User className="w-3 h-3" />
                  <span className="font-medium">
                    {user.displayName || (user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.email || 'Profesor')}
                  </span>
                  <Circle className={`w-1 h-1 fill-current ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    darkMode 
                      ? 'bg-red-900/50 text-red-300 border border-red-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Profesor
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onLogout}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Configuración */}
      <SettingsModal
        user={currentUser}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUserUpdate={setCurrentUser}
        onShowTutorial={() => setShowTutorial(true)}
      />

      {/* Tutorial de Bienvenida */}
      <OnboardingTutorial
        role="teacher"
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {courses.length === 0 ? (
          // Sin cursos - Mostrar crear
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border shadow-sm ${
              darkMode 
                ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-700/50' 
                : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200/50'
            }`}>
              <BookOpen className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              No tienes cursos creados
            </h2>
            <p className={`mb-8 max-w-md mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Crea tu primer curso para comenzar a compartir contenido con tus estudiantes
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-slate-700 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Crear curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar - Lista de cursos */}
            <div className="lg:col-span-1">
              <div className={`backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-5 sticky top-20 sm:top-24 ${
                darkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="mb-4 sm:mb-5">
                  <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 mb-3 sm:mb-4 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    <BookOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    Mis cursos
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-slate-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Plus className="w-5 h-5" />
                    Crear nuevo curso
                  </button>
                </div>
                
                <div className="space-y-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={`group relative w-full rounded-xl transition-all ${
                        selectedCourse?.id === course.id
                          ? darkMode
                            ? 'bg-gradient-to-r from-red-900/30 to-slate-900/30 border-2 border-red-500 shadow-md shadow-red-500/20'
                            : 'bg-gradient-to-r from-red-50 to-slate-50 border-2 border-red-500 shadow-md shadow-red-500/20'
                          : darkMode
                            ? 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent hover:border-slate-600'
                            : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedCourse(course);
                        }}
                        className="w-full text-left p-4 pr-12"
                      >
                        <p className={`font-semibold text-sm mb-1 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>{course.title}</p>
                        <p className={`text-xs line-clamp-2 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {course.description || 'Sin descripción'}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteCourse(course.id, course.title);
                        }}
                        className={`absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 rounded-lg transition-all ${
                          darkMode 
                            ? 'hover:bg-red-900/30 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {selectedCourse ? (
                <div className="space-y-6">
                  {/* Header del curso */}
                  <div className={`backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 ${
                    darkMode 
                      ? 'bg-slate-800/80 border-slate-700/50' 
                      : 'bg-white/80 border-slate-200/50'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-1 sm:mb-2 truncate ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedCourse.title}
                        </h2>
                        <p className={`text-sm sm:text-base truncate ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {selectedCourse.description || 'Sin descripción'}
                        </p>
                      </div>
                      <button
                        onClick={handleGoToChat}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-slate-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Ir al chatbot
                      </button>
                    </div>
                  </div>

                  {/* Dashboard del curso - Mostrar todo por defecto */}
                  <div className="space-y-6">
                    {/* Analíticas - Resumen y Preguntas Frecuentes */}
                    <Analytics courseId={selectedCourse.id} />

                    {/* Estudiantes del curso */}
                    <div className={`backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 ${
                      darkMode 
                        ? 'bg-slate-800/80 border-slate-700/50' 
                        : 'bg-white/80 border-slate-200/50'
                    }`}>
                      <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Users className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        Estudiantes del curso
                      </h3>
                      
                      <div className="space-y-4 sm:space-y-6">
                        {/* Agregar estudiante */}
                        <div>
                          <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Agregar estudiante
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="flex-1 relative">
                              <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${
                                darkMode ? 'text-slate-500' : 'text-slate-400'
                              }`} />
                              <input
                                type="email"
                                value={studentEmail}
                                onChange={(e) => {
                                  setStudentEmail(e.target.value);
                                  setStudentError(null);
                                }}
                                placeholder="correo@ejemplo.com"
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all ${
                                  darkMode
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                                disabled={addingStudent}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !addingStudent) {
                                    handleAddStudent();
                                  }
                                }}
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                console.log('[TeacherHome] Botón "Agregar" clickeado', e);
                                console.log('[TeacherHome] Estado antes de llamar handleAddStudent:', {
                                  selectedCourse: !!selectedCourse,
                                  studentEmail: studentEmail,
                                  addingStudent: addingStudent
                                });
                                handleAddStudent();
                              }}
                              disabled={addingStudent || !studentEmail.trim()}
                              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-slate-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-red-700 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                            >
                              {addingStudent ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Agregando...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-5 h-5" />
                                  Agregar
                                </>
                              )}
                            </button>
                          </div>
                          {studentError && (
                            <div className={`mt-3 border-2 rounded-xl p-3 flex items-start gap-3 ${
                              darkMode
                                ? 'bg-red-900/20 border-red-800'
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                darkMode ? 'text-red-400' : 'text-red-600'
                              }`} />
                              <div className="flex-1">
                                <p className={`text-sm font-medium mb-2 ${
                                  darkMode ? 'text-red-300' : 'text-red-800'
                                }`}>{studentError}</p>
                                {studentError.includes('No se encontró') && (
                                  <p className={`text-xs ${
                                    darkMode ? 'text-red-400' : 'text-red-700'
                                  }`}>
                                    💡 Abre la consola del navegador (F12) para ver la lista de estudiantes disponibles.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Lista de estudiantes */}
                        <div>
                          <h4 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Estudiantes inscritos ({students.length})
                          </h4>
                          {students.length === 0 ? (
                            <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                              darkMode
                                ? 'bg-slate-700/30 border-slate-600'
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                              <Users className={`w-12 h-12 mx-auto mb-3 ${
                                darkMode ? 'text-slate-500' : 'text-slate-400'
                              }`} />
                              <p className={`font-medium mb-1 ${
                                darkMode ? 'text-slate-300' : 'text-slate-700'
                              }`}>No hay estudiantes inscritos</p>
                              <p className={`text-sm ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>Agrega estudiantes usando su correo electrónico</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {students.map((student) => (
                                <div
                                  key={student.id}
                                  className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                                    darkMode
                                      ? 'bg-slate-700/50 border-slate-600 hover:border-red-600/50 hover:shadow-md'
                                      : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                                      darkMode
                                        ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-700'
                                        : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200'
                                    }`}>
                                      <User className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-semibold ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                      }`}>
                                        {student.displayName || student.email}
                                      </p>
                                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {student.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Inscrito {student.enrolledAt.toLocaleDateString()}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveStudent(student.id, student.displayName || student.email)}
                                      disabled={removingStudentId === student.id}
                                      className={`p-2 rounded-lg transition-all ${
                                        darkMode
                                          ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                                          : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      title="Eliminar estudiante del curso"
                                    >
                                      {removingStudentId === student.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Archivos del curso */}
                    <div className={`backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 ${
                      darkMode 
                        ? 'bg-slate-800/80 border-slate-700/50' 
                        : 'bg-white/80 border-slate-200/50'
                    }`}>
                      <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        Archivos del curso
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Configuración de procesamiento de archivos */}
                        <div className={`p-4 rounded-xl border-2 ${
                          darkMode 
                            ? 'bg-slate-700/50 border-slate-600' 
                            : 'bg-red-50/50 border-red-200'
                        }`}>
                          <h4 className={`text-base font-semibold mb-3 flex items-center gap-2 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            <FileText className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                            Configuración de procesamiento
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                Máximo de páginas por archivo PDF
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="50"
                                value={selectedCourse.maxPagesPerFile || 10}
                                onChange={async (e) => {
                                  const value = parseInt(e.target.value) || 10;
                                  if (value >= 5 && value <= 50) {
                                    try {
                                      await coursesService.updateCourse(selectedCourse.id, {
                                        maxPagesPerFile: value
                                      });
                                      setSelectedCourse({ ...selectedCourse, maxPagesPerFile: value });
                                    } catch (error) {
                                      console.error('Error actualizando configuración:', error);
                                      alert('Error al actualizar la configuración');
                                    }
                                  }
                                }}
                                className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                  darkMode
                                    ? 'bg-slate-700 border-slate-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                } focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600`}
                              />
                              <p className={`text-xs mt-2 flex items-start gap-2 ${
                                darkMode ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                                }`} />
                                <span>
                                  <strong>Nota:</strong> Más páginas = respuestas más completas pero más lentas. 
                                  Recomendado: 10-15 páginas para equilibrio entre velocidad y contenido. 
                                  Más de 20 páginas puede hacer que la IA tarde más de 1 minuto en responder.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Subir archivos
                          </h4>
                          <FileUpload
                            courseId={selectedCourse.id}
                            userId={user.uid}
                            teacherName={user.displayName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email || 'Profesor')}
                            onFileUploaded={handleFileUploaded}
                          />
                        </div>

                        <div>
                          <h4 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Archivos subidos ({files.length})
                          </h4>
                          <FileList
                            files={files}
                            onDelete={handleDeleteFile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-lg p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-4 border border-red-200/50">
                    <BookOpen className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Selecciona un curso
                  </h3>
                  <p className="text-slate-600">
                    Haz clic en un curso del panel lateral para ver su información, archivos y analíticas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Curso */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 animate-fade-in-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" />
                Crear nuevo curso
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título del curso *
                </label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                  placeholder="Ej: Algoritmos Avanzados"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all resize-none"
                  placeholder="Describe el curso..."
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-white font-semibold text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl hover:from-red-600 hover:to-slate-800 font-semibold shadow-lg shadow-red-500/25 transition-all"
              >
                Crear curso
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};