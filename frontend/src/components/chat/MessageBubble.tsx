import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Brain, User, AlertTriangle, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { darkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  
  // Detectar si es un mensaje de error
  const isError = isAssistant && (
    message.content.toLowerCase().includes('error') ||
    message.content.toLowerCase().includes('no está disponible') ||
    message.content.toLowerCase().includes('no está conectado') ||
    message.content.toLowerCase().includes('no se pudo conectar')
  );

  // Función para copiar el mensaje
  const handleCopy = async () => {
    try {
      // Extraer texto plano del contenido (mejor limpieza de markdown)
      let textToCopy = message.content
        // Remover bloques de código
        .replace(/```[\s\S]*?```/g, '')
        // Remover código inline
        .replace(/`([^`]+)`/g, '$1')
        // Remover enlaces pero mantener el texto
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Remover imágenes
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
        // Remover encabezados
        .replace(/^#{1,6}\s+/gm, '')
        // Remover negritas/cursivas pero mantener el texto
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remover listas
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Limpiar espacios múltiples
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  return (
    <div className={`flex gap-2 sm:gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md ${
        isError
          ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
          : isAssistant 
            ? 'bg-gradient-to-br from-red-600 to-slate-700 text-white' 
            : 'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
      }`}>
        {isError ? (
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : isAssistant ? (
          <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>

      <div className={`flex-1 max-w-[85%] sm:max-w-3xl ${isAssistant ? '' : 'flex justify-end'}`}>
        <div className={`group relative rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 shadow-sm ${
          isError
            ? darkMode
              ? 'bg-yellow-900/30 border-2 border-yellow-700 text-yellow-200'
              : 'bg-yellow-50 border-2 border-yellow-200 text-yellow-900'
            : isAssistant 
              ? darkMode
                ? 'bg-slate-700/80 border-2 border-slate-600 text-slate-100'
                : 'bg-white border-2 border-slate-200 text-slate-900'
              : 'bg-gradient-to-r from-red-600 to-slate-700 text-white'
        }`}>
          {/* Botón de copiar */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100 active:scale-95 ${
              isError
                ? darkMode
                  ? 'hover:bg-yellow-800/50 text-yellow-200'
                  : 'hover:bg-yellow-100 text-yellow-900'
                : isAssistant
                  ? darkMode
                    ? 'hover:bg-slate-600 text-slate-300'
                    : 'hover:bg-slate-100 text-slate-600'
                  : 'hover:bg-red-700/80 text-white'
            }`}
            title={copied ? 'Copiado!' : 'Copiar mensaje'}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {isAssistant ? (
            <div className={`prose prose-sm max-w-none ${
              isError 
                ? darkMode
                  ? 'prose-headings:text-yellow-200 prose-p:text-yellow-300 prose-strong:text-yellow-200'
                  : 'prose-headings:text-yellow-900 prose-p:text-yellow-800 prose-strong:text-yellow-900'
                : darkMode
                  ? 'prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-slate-100 prose-code:text-red-300 prose-code:bg-red-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100'
                  : 'prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-red-700 prose-code:bg-red-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100'
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