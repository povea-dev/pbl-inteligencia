import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isAssistant ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
      }`}>
        {isAssistant ? 'AI' : 'Tú'}
      </div>

      <div className={`flex-1 max-w-3xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isAssistant 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-blue-500 text-white'
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
        </div>
      </div>
    </div>
  );
};