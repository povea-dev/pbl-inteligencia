import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { Bot, User, CheckCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'} group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border ${
        isAssistant 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600' 
          : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-600'
      }`}>
        {isAssistant ? (
          <Bot className="w-6 h-6" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-4xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`relative rounded-3xl p-6 shadow-lg border transition-all duration-200 ${
          isAssistant 
            ? 'bg-white border-slate-200' 
            : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white'
        }`}>
          {/* Message */}
          {isAssistant ? (
            <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-slate-700 prose-ul:my-3 prose-li:my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-100 leading-relaxed whitespace-pre-wrap text-lg">{message.content}</p>
          )}
          
          {/* Timestamp */}
          <div className={`flex items-center gap-2 mt-4 ${
            isAssistant ? 'text-slate-400' : 'text-slate-300'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
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