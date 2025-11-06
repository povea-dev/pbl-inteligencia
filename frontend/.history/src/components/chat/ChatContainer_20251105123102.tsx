import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { firebaseService } from '../../services/firebaseService';
import { apiService } from '../../services/apiService';
import { Cpu, BookOpen, Target, BarChart3 } from 'lucide-react';

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
            content: 'El servicio de IA no está disponible en este momento. Tu respuesta ha sido guardada para revisión posterior.'
          });
        }
      } else {
        await firebaseService.saveMessage({
          sessionId: currentSession.id,
          role: 'assistant',
          content: 'El servicio de IA no está disponible. Tu respuesta ha sido guardada y será revisada cuando se restablezca la conexión.'
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
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-800">
            Problema no seleccionado
          </h3>
          <p className="text-slate-600 text-lg">
            Elige un problema de la lista para comenzar tu análisis
          </p>
        </div>
      </div>
    );
  }

  const getDifficultyConfig = (difficulty: string) => {
    const config = {
      facil: { color: 'bg-emerald-500', text: 'Fácil', label: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      medio: { color: 'bg-amber-500', text: 'Intermedio', label: 'bg-amber-100 text-amber-700 border-amber-200' },
      dificil: { color: 'bg-rose-500', text: 'Avanzado', label: 'bg-rose-100 text-rose-700 border-rose-200' }
    };
    return config[difficulty as keyof typeof config] || config.medio;
  };

  const difficultyConfig = getDifficultyConfig(currentProblem.difficulty);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50/20">
      {/* Header Mejorado */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-8 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {currentProblem.title}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {currentProblem.category}
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full border font-medium ${difficultyConfig.label} flex items-center gap-1`}>
                    <div className={`w-2 h-2 rounded-full ${difficultyConfig.color}`}></div>
                    {difficultyConfig.text}
                  </span>
                </div>
              </div>
            </div>
            
            {backendAvailable !== null && (
              <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border font-medium ${
                backendAvailable 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Cpu className="w-4 h-4" />
                {backendAvailable ? 'IA Conectada' : 'Modo Local'}
              </div>
            )}
          </div>
          
          <p className="text-slate-700 leading-relaxed text-lg border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-3 px-4 rounded-r-lg">
            {currentProblem.description}
          </p>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
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