import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'} group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${
        isAssistant 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-gray-300'
      }`}>
        {isAssistant ? (
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        ) : (
          <UserCircleIcon className="w-5 h-5" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`relative rounded-2xl p-5 shadow-sm border transition-all duration-200 ${
          isAssistant 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
        }`}>
          {/* Message */}
          {isAssistant ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
          
          {/* Timestamp */}
          <div className={`flex items-center gap-1 mt-3 ${
            isAssistant ? 'text-gray-400' : 'text-blue-100'
          }`}>
            <span className="text-xs">
              {message.timestamp.toLocaleTimeString('es-CL', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};