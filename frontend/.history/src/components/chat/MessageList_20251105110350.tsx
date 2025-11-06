import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">👋 ¡Hola!</p>
          <p>Comienza escribiendo tu análisis del problema.</p>
          <p className="text-sm mt-2">Recuerda aplicar el método PBL:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Identifica el problema</li>
            <li>• Analiza la información</li>
            <li>• Propón soluciones</li>
            <li>• Justifica tu razonamiento</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};