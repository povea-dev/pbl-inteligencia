import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, GraduationCap, BookOpen, MessageSquare, FileText, BarChart3, Users, Zap, Sparkles, Rocket, CheckCircle, Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';

interface OnboardingTutorialProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ role, isOpen, onClose }) => {
  const { darkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  // Resetear al primer paso cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const studentSteps = [
    {
      icon: Rocket,
      title: "¡Bienvenido a EduFlow!",
      description: "Tu plataforma educativa inteligente diseñada para potenciar tu aprendizaje mediante el método de Aprendizaje Basado en Problemas (PBL).",
      content: (
        <div className="space-y-3 text-left">
          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Aquí podrás:
          </p>
          <ul className={`space-y-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Acceder a tus cursos y materiales de estudio</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Chatear con un asistente de IA para recibir feedback y guía</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Resolver problemas paso a paso con ayuda inteligente</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      icon: MessageSquare,
      title: "Chat con IA",
      description: "El asistente de IA está diseñado para ayudarte a aprender, no para resolver tus tareas.",
      content: (
        <div className="space-y-3 text-left">
          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            ¿Cómo funciona?
          </p>
          <ul className={`space-y-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span>Haz preguntas sobre conceptos, métodos o dudas que tengas</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span>Recibe feedback constructivo y sugerencias de mejora</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span>El asistente te guía paso a paso, pero NO resuelve tareas por ti</span>
            </li>
          </ul>
          <div className={`mt-4 p-3 border rounded-lg ${
            darkMode 
              ? 'bg-yellow-900/30 border-yellow-800' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-xs ${darkMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
              <strong>⚠️ Importante:</strong> El uso inadecuado de la IA (como pedirle que resuelva tareas completas) será detectado y reportado a tu docente.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: BookOpen,
      title: "Navegación",
      description: "Aprende a moverte por la plataforma.",
      content: (
        <div className="space-y-3 text-left">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Cursos</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ve todos tus cursos inscritos en la página principal</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Chat</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Haz clic en un curso para abrir el chat con el asistente de IA</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Configuración</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Accede a tu perfil y preferencias desde el menú de configuración</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const teacherSteps = [
    {
      icon: Rocket,
      title: "¡Bienvenido a EduFlow!",
      description: "Tu plataforma educativa inteligente para gestionar tus cursos y potenciar el aprendizaje de tus estudiantes.",
      content: (
        <div className="space-y-3 text-left">
          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Como docente, puedes:
          </p>
          <ul className={`space-y-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Crear y gestionar cursos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Subir materiales de estudio (PDFs, documentos)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Agregar estudiantes a tus cursos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Monitorear el uso de la IA y recibir alertas de mal uso</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      icon: FileText,
      title: "Gestión de Cursos",
      description: "Crea y administra tus cursos fácilmente.",
      content: (
        <div className="space-y-3 text-left">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Crear Curso</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Haz clic en "Crear nuevo curso" para agregar un nuevo curso</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Subir Archivos</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>En la pestaña "Archivos del curso", sube PDFs y documentos que el asistente de IA usará para ayudar a tus estudiantes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Agregar Estudiantes</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>En la sección "Estudiantes del curso", agrega estudiantes por su correo electrónico</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: BarChart3,
      title: "Analíticas y Monitoreo",
      description: "Monitorea el progreso y uso de la IA.",
      content: (
        <div className="space-y-3 text-left">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <BarChart3 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Analíticas</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ve estadísticas sobre el uso del chat, preguntas frecuentes y actividad de los estudiantes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Alertas de Mal Uso</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Recibirás notificaciones si un estudiante intenta usar la IA de manera inadecuada (por ejemplo, pidiendo que resuelva tareas completas)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Configuración de IA</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ajusta cuántas páginas de PDFs debe leer la IA para balancear velocidad y contenido</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const steps = role === 'teacher' ? teacherSteps : studentSteps;

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-in-up ${
        darkMode 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white border border-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              darkMode 
                ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50' 
                : 'bg-gradient-to-br from-red-100 to-slate-100'
            }`}>
              <Icon className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {currentStepData.title}
              </h2>
              <p className="text-xs text-slate-500">
                Paso {currentStep + 1} de {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-center mb-6 text-base font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {currentStepData.description}
          </p>
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-slate-700/70 border border-slate-600' : 'bg-white border border-slate-300'
          }`}>
            {currentStepData.content}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className={`h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-slate-700 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed'
                : darkMode
                  ? 'hover:bg-slate-700 text-slate-300 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-lg hover:from-red-700 hover:to-slate-800 transition-all font-semibold shadow-lg shadow-red-500/25"
          >
            <span>{currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}</span>
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

