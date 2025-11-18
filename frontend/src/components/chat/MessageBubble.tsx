import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Brain, User, AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { darkMode } = useTheme();
  const isAssistant = message.role === 'assistant';
  
  // Detectar si es un mensaje de error
  const isError = isAssistant && (
    message.content.toLowerCase().includes('error') ||
    message.content.toLowerCase().includes('no está disponible') ||
    message.content.toLowerCase().includes('no está conectado') ||
    message.content.toLowerCase().includes('no se pudo conectar')
  );

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
        isError
          ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
          : isAssistant 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
            : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
      }`}>
        {isError ? (
          <AlertTriangle className="w-5 h-5" />
        ) : isAssistant ? (
          <Brain className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      <div className={`flex-1 max-w-3xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`rounded-2xl px-5 py-4 shadow-sm ${
          isError
            ? darkMode
              ? 'bg-yellow-900/30 border-2 border-yellow-700 text-yellow-200'
              : 'bg-yellow-50 border-2 border-yellow-200 text-yellow-900'
            : isAssistant 
              ? darkMode
                ? 'bg-slate-700/80 border-2 border-slate-600 text-slate-100'
                : 'bg-white border-2 border-slate-200 text-slate-900'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
        }`}>
          {isAssistant ? (
            <div className={`prose prose-sm max-w-none ${
              isError 
                ? darkMode
                  ? 'prose-headings:text-yellow-200 prose-p:text-yellow-300 prose-strong:text-yellow-200'
                  : 'prose-headings:text-yellow-900 prose-p:text-yellow-800 prose-strong:text-yellow-900'
                : darkMode
                  ? 'prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-slate-100 prose-code:text-emerald-300 prose-code:bg-emerald-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100'
                  : 'prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100'
            }`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};