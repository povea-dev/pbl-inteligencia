import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Hola, soy Asistente PBL
          </h3>
          <p className="text-gray-600 mb-8">
            Puedo ayudarte a analizar problemas usando el método de Aprendizaje Basado en Problemas.
          </p>
          
          <div className="space-y-3 text-left">
            <div className="text-sm text-gray-500 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
              "¿Cómo analizo este problema paso a paso?"
            </div>
            <div className="text-sm text-gray-500 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
              "¿Qué aspectos debo considerar primero?"
            </div>
            <div className="text-sm text-gray-500 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
              "¿Puedes guiarme por el método PBL?"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};