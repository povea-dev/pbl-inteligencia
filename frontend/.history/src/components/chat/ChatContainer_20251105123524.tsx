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
      setError('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No hay problema seleccionado</p>
          <p className="text-sm text-gray-500">Selecciona un problema para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentProblem.title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {currentProblem.description}
        </p>
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