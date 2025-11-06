import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isAssistant ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isAssistant ? (
          <Bot className="w-6 h-6 text-white" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-3xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`rounded-lg p-4 ${
          isAssistant 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-green-500 text-white'
        }`}>
          {isAssistant ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          <p className={`text-xs mt-2 ${
            isAssistant ? 'text-gray-400' : 'text-green-100'
          }`}>
            {message.timestamp.toLocaleTimeString('es-CL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};