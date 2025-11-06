import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { firebaseService } from '../../services/firebaseService';
import { apiService } from '../../services/apiService';
import { Transition } from '@headlessui/react';
import { 
  CpuChipIcon, 
  BookOpenIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export const ChatContainer: React.FC = () => {
  const { 
    messages, 
    currentProblem, 
    currentSession,
    isLoading, 
    setMessages,
    setLoading,
    setError 
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkBackend = async () => {
      const available = await apiService.healthCheck();
      setBackendAvailable(available);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    checkBackend();
  }, []);

  useEffect(() => {
    if (!currentSession) return;

    const unsubscribe = firebaseService.subscribeToMessages(
      currentSession.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [currentSession, setMessages]);

  const handleSendMessage = async (content: string) => {
    if (!currentProblem || !currentSession || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await firebaseService.saveMessage({
        sessionId: currentSession.id,
        role: 'user',
        content: content.trim()
      });

      await firebaseService.updateSessionActivity(currentSession.id);

      if (backendAvailable) {
        try {
          const response = await apiService.getFeedback({
            sessionId: currentSession.id,
            problemId: currentProblem.id,
            studentResponse: content.trim(),
            conversationHistory: messages
          });

          await firebaseService.saveMessage({
            sessionId: currentSession.id,
            role: 'assistant',
            content: response.feedback
          });

        } catch (apiError) {
          console.error('Error con la API:', apiError);
          
          await firebaseService.saveMessage({
            sessionId: currentSession.id,
            role: 'assistant',
            content: 'El servicio de IA no está disponible en este momento. Tu respuesta ha sido guardada.'
          });
        }
      } else {
        await firebaseService.saveMessage({
          sessionId: currentSession.id,
          role: 'assistant',
          content: 'El backend no está conectado. Tu respuesta ha sido guardada.'
        });
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center text-gray-600 p-8 max-w-md">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            No hay problema seleccionado
          </h3>
          <p className="text-gray-500">
            Selecciona un problema del listado para comenzar la sesión
          </p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medio':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'dificil':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {currentProblem.title}
              </h2>
              <Transition
                show={showStatus}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {backendAvailable !== null && (
                  <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border ${
                    backendAvailable 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <CpuChipIcon className="w-4 h-4" />
                    {backendAvailable ? 'IA Conectada' : 'Modo Sin Conexión'}
                  </div>
                )}
              </Transition>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              {currentProblem.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-medium">
                {currentProblem.category}
              </span>
              <span className={`text-sm px-3 py-1.5 rounded-full border font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                {currentProblem.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <InputBox 
        onSend={handleSendMessage} 
        disabled={!currentSession}
        isLoading={isLoading}
      />
    </div>
  );
};