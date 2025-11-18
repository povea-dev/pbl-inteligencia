import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { ConversationSidebar } from './ConversationSidebar';
import { FileList } from '../teacher/FileList';
import { conversationsService } from '../../services/conversationsService';
import { messagesService } from '../../services/messagesService';
import { coursesService } from '../../services/coursesService';
import { studentsService } from '../../services/studentsService';
import { filesService } from '../../services/filesService';
import { apiService } from '../../services/apiService';
import { alertsService } from '../../services/alertsService';
import { getFirebaseIdToken } from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Conversation, Message, Course, AppUser, CourseFile } from '../../types';
import { ArrowLeft, BookOpen, Brain, Wifi, WifiOff, Loader2, AlertTriangle, FileText, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { ExportButton } from './ExportButton';

interface ChatContainerProps {
  user: AppUser;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ user }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [showFiles, setShowFiles] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Para móviles
  const [isNewConversation, setIsNewConversation] = useState(false); // Flag para nueva conversación
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cargar curso y archivos
  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const courseData = await coursesService.getCourseById(courseId);
      
      if (!courseData) {
        navigate('/student');
        alert('Curso no encontrado');
        return;
      }
      
      // Verificar acceso al curso
      if (user.role === 'teacher') {
        // Docente solo puede acceder a sus propios cursos
        if (courseData.teacherId !== user.uid) {
          navigate('/teacher');
          alert('No tienes acceso a este curso');
          return;
        }
      } else if (user.role === 'student') {
        // Estudiante solo puede acceder a cursos en los que está inscrito
        const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments');
        const enrollmentQuery = query(
          enrollmentsRef,
          where('studentId', '==', user.uid),
          where('status', '==', 'active')
        );
        const enrollmentSnapshot = await getDocs(enrollmentQuery);
        
        if (enrollmentSnapshot.empty) {
          navigate('/student');
          alert('No tienes acceso a este curso. Contacta a tu docente para que te agregue.');
          return;
        }
      }
      
      setCourse(courseData);
      
      // Cargar archivos del curso
      const files = await filesService.getCourseFiles(courseId);
      // Asegurarse de que todos los archivos tengan el courseId correcto
      const filesWithCourseId = files.map(file => ({
        ...file,
        courseId: courseId // Asegurar que el courseId esté presente
      }));
      setCourseFiles(filesWithCourseId);
      
      // Log para debugging
      console.log('Archivos cargados del curso:', {
        courseId,
        courseTitle: courseData.title,
        filesCount: filesWithCourseId.length,
        files: filesWithCourseId.map(f => ({ name: f.name, type: f.type, courseId: f.courseId }))
      });
    } catch (error) {
      console.error('Error cargando curso:', error);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
      alert('Error al cargar el curso');
    }
  }, [courseId, user.uid, user.role, navigate]);

  // Cargar conversaciones del usuario
  const loadConversations = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const convs = await conversationsService.getUserConversations(courseId, user.uid);
      setConversations(convs);
      
      // Solo seleccionar la más reciente si no hay una seleccionada Y no estamos creando una nueva
      if (!currentConversation && !isNewConversation && convs.length > 0) {
        setCurrentConversation(convs[0]);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    }
  }, [courseId, user.uid, currentConversation, isNewConversation]);

  // Verificar backend
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await apiService.healthCheck();
        setBackendAvailable(available);
        if (!available) {
          console.warn('Backend no disponible. El chatbot funcionará en modo limitado.');
        }
      } catch (error) {
        console.error('Error verificando backend:', error);
        setBackendAvailable(false);
      }
    };
    checkBackend();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadCourse();
    loadConversations();
  }, [loadCourse, loadConversations]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!courseId || !currentConversation) return;

    const unsubscribe = messagesService.subscribeToMessages(
      courseId,
      currentConversation.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [courseId, currentConversation]);

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setIsNewConversation(true); // Marcar que estamos creando una nueva
  };

  const handleSelectConversation = async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setCurrentConversation(conv);
      setIsNewConversation(false); // Ya no estamos creando una nueva
      // Los mensajes se cargarán automáticamente por el useEffect que escucha currentConversation
      // Cerrar sidebar en móviles al seleccionar conversación
      setShowSidebar(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!courseId) return;
    
    try {
      await conversationsService.deleteConversation(courseId, conversationId);
      
      // Actualizar lista
      const updatedConvs = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConvs);
      
      // Si era la actual, limpiar
      if (currentConversation?.id === conversationId) {
        if (updatedConvs.length > 0) {
          setCurrentConversation(updatedConvs[0]);
          setIsNewConversation(false);
        } else {
          setCurrentConversation(null);
          setMessages([]);
          setIsNewConversation(true); // Permitir crear nueva si no hay conversaciones
        }
      }
    } catch (error) {
      console.error('Error eliminando conversación:', error);
    }
  };

  const handleUpdateTitle = async (conversationId: string, newTitle: string) => {
    if (!courseId) return;
    
    try {
      await conversationsService.updateConversationTitle(courseId, conversationId, newTitle);
      
      // Actualizar lista
      const updatedConvs = conversations.map(c => 
        c.id === conversationId ? { ...c, title: newTitle } : c
      );
      setConversations(updatedConvs);
      
      // Si es la actual, actualizar también
      if (currentConversation?.id === conversationId) {
        setCurrentConversation({ ...currentConversation, title: newTitle });
      }
    } catch (error) {
      console.error('Error actualizando título:', error);
      alert('Error al actualizar el nombre de la conversación');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!courseId || !content.trim()) return;

    setIsLoading(true);

    try {
      let convId = currentConversation?.id;

      // Si no hay conversación actual, crear una nueva
      if (!convId) {
        try {
          convId = await conversationsService.createConversation(
            courseId,
            user.uid,
            user.role,
            content
          );
          
          // Recargar conversaciones
          await loadConversations();
          
          // Seleccionar la nueva y marcar que ya no estamos creando una nueva
          const newConv = await conversationsService.getConversationById(courseId, convId);
          if (newConv) {
            setCurrentConversation(newConv);
            setIsNewConversation(false);
          }
        } catch (error: any) {
          console.error('Error creando conversación:', error);
          setIsLoading(false);
          
          // Verificar si es un error de bloqueo
          if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
              error?.code === 'permission-denied' ||
              error?.message?.includes('blocked')) {
            alert('Error: Las peticiones a la base de datos están siendo bloqueadas. Por favor, desactiva el bloqueador de anuncios o extensiones que puedan estar interfiriendo y recarga la página.');
          } else {
            alert('Error al crear la conversación. Por favor, intenta nuevamente.');
          }
          return;
        }
      }

      // Guardar mensaje del usuario
      try {
        await messagesService.saveMessage(courseId, convId, 'user', content);
      } catch (error: any) {
        console.error('Error guardando mensaje:', error);
        setIsLoading(false);
        
        if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            error?.code === 'permission-denied' ||
            error?.message?.includes('blocked')) {
          alert('Error: Las peticiones a la base de datos están siendo bloqueadas. Por favor, desactiva el bloqueador de anuncios o extensiones que puedan estar interfiriendo y recarga la página.');
        } else {
          alert('Error al guardar el mensaje. Por favor, intenta nuevamente.');
        }
        return;
      }

      // Actualizar actividad
      await conversationsService.updateLastActivity(courseId, convId);
      await conversationsService.incrementMessageCount(courseId, convId);

      // Cargar mensajes actualizados antes de enviar a la IA
      const updatedMessages = await messagesService.getMessages(courseId, convId);

      // Obtener respuesta de la IA (si backend está disponible)
      if (backendAvailable) {
        try {
          let idToken: string | null;
          try {
            idToken = await getFirebaseIdToken();
          } catch (error: any) {
            console.error('Error obteniendo token:', error);
            setIsLoading(false);
            
            if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
                error?.message?.includes('blocked')) {
              alert('Error: Las peticiones de autenticación están siendo bloqueadas. Por favor, desactiva el bloqueador de anuncios o extensiones que puedan estar interfiriendo y recarga la página.');
            } else {
              alert('Error al obtener el token de autenticación. Por favor, intenta nuevamente.');
            }
            return;
          }
          
          if (!idToken) {
            setIsLoading(false);
            alert('No se pudo obtener el token de autenticación. Por favor, recarga la página e intenta nuevamente.');
            return;
          }

          // Preparar archivos para el backend (nombre, tipo y URL para extraer contenido)
          // Asegurarse de que los archivos pertenezcan al curso correcto
          const filesForBackend = courseFiles
            .filter(file => file.courseId === courseId) // Filtrar por curso correcto
            .map(file => ({
              name: file.name,
              type: file.type,
              url: file.url
            }));

          // Log para debugging
          console.log('Enviando archivos al backend:', {
            courseId,
            courseTitle: course?.title,
            filesCount: filesForBackend.length,
            files: filesForBackend.map(f => ({ name: f.name, type: f.type }))
          });

          // Llamar a la API con timeout más largo para respuestas complejas
          const response = await apiService.getFeedback({
            conversationId: convId,
            courseId,
            message: content,
            conversationHistory: updatedMessages,
            idToken,
            courseFiles: filesForBackend,
            courseTitle: course?.title || '',
            maxPagesPerFile: course?.maxPagesPerFile || 10 // Usar configuración del curso o default 10
          });

          // Verificar que la respuesta tenga contenido
          if (!response || !response.response) {
            throw new Error('La respuesta del backend no contiene contenido');
          }

          // Guardar respuesta de la IA
          await messagesService.saveMessage(
            courseId,
            convId,
            'assistant',
            response.response,
            {
              tokens: response.tokensUsed,
              sourcesUsed: response.sourcesUsed
            }
          );

          // Si se detectó mal uso y el usuario es estudiante, crear alerta para el profesor
          const assessment = response.tokensUsed?.assessment;
          if (assessment?.misuse_detected && user.role === 'student' && course) {
            try {
              await alertsService.createMisuseAlert(
                courseId,
                convId,
                user.uid,
                content,
                assessment.misuse_reason || 'Mal uso de IA detectado',
                course.teacherId
              );
              console.log('Alerta de mal uso creada para el profesor');
            } catch (alertError) {
              console.error('Error creando alerta de mal uso:', alertError);
              // No bloquear el flujo si falla la alerta
            }
          }

          await conversationsService.incrementMessageCount(courseId, convId);

        } catch (apiError: any) {
          console.error('Error con la API:', apiError);
          
          let errorMessage = 'El servicio de IA no está disponible. Tu mensaje ha sido guardado.';
          
          if (apiError.response) {
            // Error de respuesta del servidor
            if (apiError.response.status === 401) {
              errorMessage = 'Error de autenticación. Por favor, recarga la página.';
            } else if (apiError.response.status === 500) {
              errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
            } else if (apiError.response.data?.detail) {
              errorMessage = apiError.response.data.detail;
            }
          } else if (apiError.request) {
            // Error de red o timeout
            if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
              errorMessage = 'La respuesta del servidor está tardando demasiado. Por favor, intenta nuevamente.';
            } else {
              errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
          
          await messagesService.saveMessage(
            courseId,
            convId,
            'assistant',
            errorMessage
          );
        } finally {
          // Siempre desactivar el loading al finalizar
          setIsLoading(false);
        }
      } else {
        // Si no hay backend, guardar mensaje de error
        await messagesService.saveMessage(
          courseId,
          convId,
          'assistant',
          'El servicio de IA no está disponible en este momento. Por favor, intenta más tarde.'
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error general al enviar mensaje:', error);
      setIsLoading(false);
      
      // Mostrar error más específico
      if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
          error?.code === 'permission-denied') {
        alert('Error: Las peticiones están siendo bloqueadas. Por favor, desactiva el bloqueador de anuncios y recarga la página.');
      } else {
        alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleGoBack = () => {
    if (user.role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  if (!course) {
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
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Cargando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-red-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className={`border-b px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-lg shadow-sm ${
        darkMode 
          ? 'border-slate-700/50 bg-slate-800/80' 
          : 'border-slate-200/50 bg-white/80'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleGoBack}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {/* Botón de menú para móviles */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                darkMode
                  ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-700/50'
                  : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200/50'
              }`}>
                <BookOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-base sm:text-xl font-bold truncate ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {course.title}
                </h1>
                <p className={`text-xs sm:text-sm truncate ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {course.description || 'Sin descripción'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón de exportar (solo si hay conversación activa) */}
            {currentConversation && messages.length > 0 && (
              <ExportButton
                conversation={currentConversation}
                messages={messages}
                courseTitle={course.title}
              />
            )}
            
            {backendAvailable !== null && (
              <div className={`hidden sm:flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full font-semibold border ${
                backendAvailable 
                  ? darkMode
                    ? 'bg-red-900/50 text-red-300 border-red-700'
                    : 'bg-red-100 text-red-700 border-red-200'
                  : darkMode
                    ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
                {backendAvailable ? (
                  <>
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">IA Conectada</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Sin IA</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay para móviles cuando el sidebar está abierto */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Sidebar de conversaciones */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static
          inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
        `}>
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onUpdateTitle={handleUpdateTitle}
            courseId={courseId || ''}
            userId={user.role === 'student' ? user.uid : null}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        {/* Área de chat */}
        <div className={`flex-1 flex flex-col backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50' : 'bg-white/50'
        }`}>
          {/* Sección de archivos (solo para estudiantes o si hay archivos) */}
          {user.role === 'student' && courseFiles.length > 0 && (
            <div className={`border-b ${
              darkMode ? 'border-slate-700/50' : 'border-slate-200/50'
            }`}>
              <button
                onClick={() => setShowFiles(!showFiles)}
                className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-colors ${
                  darkMode
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Archivos del curso ({courseFiles.length})
                  </span>
                </div>
                {showFiles ? (
                  <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                )}
              </button>
              
              {showFiles && (
                <div className={`px-4 sm:px-6 py-3 sm:py-4 max-h-64 overflow-y-auto ${
                  darkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'
                }`}>
                  <FileList 
                    files={courseFiles} 
                    canDelete={false}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <MessageList 
              messages={messages} 
              onSuggestionClick={handleSendMessage}
            />
            {/* Indicador de escritura */}
            {isLoading && (
              <div className="px-4 sm:px-6 pb-4">
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-red-600 to-slate-700">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-[85%] sm:max-w-3xl">
                    <div className={`rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 shadow-sm ${
                      darkMode
                        ? 'bg-slate-700/80 border-2 border-slate-600'
                        : 'bg-white border-2 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            darkMode ? 'bg-slate-400' : 'bg-slate-500'
                          }`} style={{ animationDelay: '0ms' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            darkMode ? 'bg-slate-400' : 'bg-slate-500'
                          }`} style={{ animationDelay: '150ms' }}></div>
                          <div className={`w-2 h-2 rounded-full animate-bounce ${
                            darkMode ? 'bg-slate-400' : 'bg-slate-500'
                          }`} style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className={`text-xs sm:text-sm ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Escribiendo...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <InputBox 
            onSend={handleSendMessage} 
            disabled={false}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};