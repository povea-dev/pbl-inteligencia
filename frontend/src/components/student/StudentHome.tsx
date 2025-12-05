import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/coursesService';
import { Course, AppUser } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationsPanel } from '../common/NotificationsPanel';
import { SettingsModal } from '../common/SettingsModal';
import { OnboardingTutorial } from '../common/OnboardingTutorial';
import { notificationsService } from '../../services/notificationsService';
import { markTutorialAsSeen } from '../../services/authService';
import { 
  LogOut, 
  BookOpen, 
  MessageSquare, 
  User,
  GraduationCap,
  Zap,
  ArrowRight,
  Loader2,
  Bell,
  Settings,
  Circle,
  Moon,
  Sun
} from 'lucide-react';

interface StudentHomeProps {
  user: AppUser;
  onLogout: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<AppUser>(user);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener solo los cursos en los que el estudiante está inscrito
      const coursesData = await coursesService.getCoursesByStudent(user.uid);
      setCourses(coursesData);
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

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error cargando contador de notificaciones:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [user.uid]);

  const handleGoToCourse = (courseId: string) => {
    navigate(`/course/${courseId}/chat`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-red-50 to-slate-100'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Cargando cursos...</p>
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
                  <span className="truncate">Mis Cursos</span>
                  <BookOpen className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </h1>
                <p className={`text-sm mt-0.5 flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <User className="w-3 h-3" />
                  <span className="font-medium">
                    {user.displayName || (user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.email || 'Estudiante')}
                  </span>
                  <Circle className={`w-1 h-1 fill-current ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    darkMode 
                      ? 'bg-red-900/50 text-red-300 border border-red-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Estudiante
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowNotifications(true)}
                className={`relative p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
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

      {/* Notificaciones */}
      <NotificationsPanel
        userId={currentUser.uid}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

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
        role="student"
        isOpen={showTutorial}
        onClose={handleTutorialClose}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border shadow-sm ${
              darkMode 
                ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-700/50' 
                : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200/50'
            }`}>
              <BookOpen className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              No tienes cursos inscritos
            </h2>
            <p className={`max-w-md mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Contacta a tu docente para que te agregue a un curso y puedas comenzar a aprender
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <BookOpen className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  Mis cursos inscritos
                </h2>
                <p className={`mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {courses.length} curso{courses.length !== 1 ? 's' : ''} inscrito{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`backdrop-blur-lg rounded-2xl border-2 p-6 transition-all cursor-pointer group ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700/50 hover:border-red-600/50 hover:shadow-xl hover:shadow-red-900/20'
                      : 'bg-white/80 border-slate-200/50 hover:border-red-300 hover:shadow-xl'
                  }`}
                  onClick={() => handleGoToCourse(course.id)}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${
                      darkMode
                        ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-700/50'
                        : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200/50'
                    }`}>
                      <BookOpen className={`w-7 h-7 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      darkMode
                        ? 'bg-red-900/50 text-red-300 border-red-700'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      Activo
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-3 transition-colors ${
                    darkMode
                      ? 'text-white group-hover:text-red-400'
                      : 'text-slate-900 group-hover:text-red-600'
                  }`}>
                    {course.title}
                  </h3>
                  
                  <p className={`text-sm mb-5 line-clamp-3 leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {course.description || 'Sin descripción'}
                  </p>

                  <div className={`flex items-center justify-between pt-5 border-t ${
                    darkMode ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <div className={`flex items-center gap-2 text-xs ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <User className="w-4 h-4" />
                      <span className="font-medium">{course.teacherName}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm font-semibold transition-all ${
                      darkMode
                        ? 'text-red-400 group-hover:text-red-300 group-hover:gap-2'
                        : 'text-red-600 group-hover:text-red-700 group-hover:gap-2'
                    }`}>
                      <span>Ir al chatbot</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};