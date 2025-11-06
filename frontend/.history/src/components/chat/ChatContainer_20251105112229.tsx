import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { firebaseService } from '../../services/firebaseService';
import { apiService } from '../../services/apiService';

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
            content: '⚠️ El servicio de IA no está disponible en este momento. Tu respuesta ha sido guardada.'
          });
        }
      } else {
        await firebaseService.saveMessage({
          sessionId: currentSession.id,
          role: 'assistant',
          content: '⚠️ El backend no está conectado. Tu respuesta ha sido guardada.'
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
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">📚 No hay problema seleccionado</p>
          <p className="text-sm">Selecciona un problema para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentProblem.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentProblem.description}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {currentProblem.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                currentProblem.difficulty === 'facil' 
                  ? 'bg-green-100 text-green-700'
                  : currentProblem.difficulty === 'medio'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {currentProblem.difficulty}
              </span>
            </div>
          </div>
          {backendAvailable !== null && (
            <div className="ml-4">
              <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
                backendAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  backendAvailable ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                {backendAvailable ? 'IA Conectada' : 'Sin IA'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <InputBox 
        onSend={handleSendMessage} 
        disabled={!currentSession}
        isLoading={isLoading}
      />
    </div>
  );
};