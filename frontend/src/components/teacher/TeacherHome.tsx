import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/coursesService';
import { filesService } from '../../services/filesService';
import { studentsService, Student } from '../../services/studentsService';
import { Course, CourseFile, AppUser } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SettingsModal } from '../common/SettingsModal';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { Analytics } from './Analytics';
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
  Brain,
  Users,
  Mail,
  AlertCircle,
  Loader2,
  Trash2,
  Settings,
  Circle
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
  const [currentUser, setCurrentUser] = useState<AppUser>(user);
  
  // Modal de crear curso
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  
  // Agregar estudiante
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

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
    if (!selectedCourse) return;
    
    try {
      const studentsData = await studentsService.getCourseStudents(selectedCourse.id);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    }
  }, [selectedCourse]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async () => {
    if (!selectedCourse || !studentEmail.trim()) return;
    
    setAddingStudent(true);
    setStudentError(null);
    
    try {
      await studentsService.addStudentToCourse(selectedCourse.id, studentEmail.trim());
      setStudentEmail('');
      await loadStudents();
    } catch (error: any) {
      setStudentError(error.message || 'Error al agregar estudiante');
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
          : 'bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4 ${
            darkMode 
              ? 'border-emerald-800 border-t-emerald-400' 
              : 'border-emerald-200 border-t-emerald-600'
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
        : 'bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-lg border-b shadow-sm sticky top-0 z-40 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Panel de Docente
                  <GraduationCap className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
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
                      ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Profesor
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={onLogout}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
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
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          // Sin cursos - Mostrar crear
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border shadow-sm ${
              darkMode 
                ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700/50' 
                : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200/50'
            }`}>
              <BookOpen className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              No tienes cursos creados
            </h2>
            <p className={`mb-8 max-w-md mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Crea tu primer curso para comenzar a compartir contenido con tus estudiantes
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Crear curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Lista de cursos */}
            <div className="lg:col-span-1">
              <div className={`backdrop-blur-lg rounded-2xl border shadow-lg p-5 sticky top-24 ${
                darkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="mb-5">
                  <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    Mis cursos
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-105"
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
                            ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
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
                  <div className={`backdrop-blur-lg rounded-2xl border shadow-lg p-6 ${
                    darkMode 
                      ? 'bg-slate-800/80 border-slate-700/50' 
                      : 'bg-white/80 border-slate-200/50'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h2 className={`text-2xl font-bold mb-2 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedCourse.title}
                        </h2>
                        <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                          {selectedCourse.description || 'Sin descripción'}
                        </p>
                      </div>
                      <button
                        onClick={handleGoToChat}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-105 whitespace-nowrap"
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
                    <div className={`backdrop-blur-lg rounded-2xl border shadow-lg p-6 ${
                      darkMode 
                        ? 'bg-slate-800/80 border-slate-700/50' 
                        : 'bg-white/80 border-slate-200/50'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Users className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        Estudiantes del curso
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Agregar estudiante */}
                        <div>
                          <h4 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Agregar estudiante
                          </h4>
                          <div className="flex gap-3">
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
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
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
                              onClick={handleAddStudent}
                              disabled={addingStudent || !studentEmail.trim()}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                              <p className={`text-sm font-medium ${
                                darkMode ? 'text-red-300' : 'text-red-800'
                              }`}>{studentError}</p>
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
                                      ? 'bg-slate-700/50 border-slate-600 hover:border-emerald-600/50 hover:shadow-md'
                                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                                      darkMode
                                        ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700'
                                        : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200'
                                    }`}>
                                      <User className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
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
                                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Inscrito {student.enrolledAt.toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Archivos del curso */}
                    <div className={`backdrop-blur-lg rounded-2xl border shadow-lg p-6 ${
                      darkMode 
                        ? 'bg-slate-800/80 border-slate-700/50' 
                        : 'bg-white/80 border-slate-200/50'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <FileText className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        Archivos del curso
                      </h3>
                      
                      <div className="space-y-6">
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
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4 border border-emerald-200/50">
                    <BookOpen className="w-8 h-8 text-emerald-600" />
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Crear nuevo curso
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título del curso *
                </label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Describe el curso..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-white font-semibold text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 transition-all"
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