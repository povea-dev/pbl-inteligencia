import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { 
  LightBulbIcon, 
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Comienza tu análisis
          </h3>
          <p className="text-gray-500 mb-6">
            Escribe tu análisis del problema para recibir retroalimentación
          </p>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <LightBulbIcon className="w-4 h-4" />
              Método PBL recomendado:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <MagnifyingGlassIcon className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>Identifica y analiza el problema principal</span>
              </li>
              <li className="flex items-start gap-2">
                <PuzzlePieceIcon className="w-4 h-4 mt-0.5 text-green-500" />
                <span>Descompón el problema en partes más pequeñas</span>
              </li>
              <li className="flex items-start gap-2">
                <LightBulbIcon className="w-4 h-4 mt-0.5 text-amber-500" />
                <span>Propón soluciones alternativas</span>
              </li>
              <li className="flex items-start gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 text-purple-500" />
                <span>Justifica tu razonamiento paso a paso</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};