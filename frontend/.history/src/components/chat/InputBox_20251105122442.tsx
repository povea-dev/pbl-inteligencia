import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ 
  onSend, 
  disabled = false,
  isLoading = false 
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/60 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu análisis y solución al problema..."
              disabled={disabled || isLoading}
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white shadow-sm transition-all duration-200"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:shadow-none font-medium"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Procesando</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Enviar</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-gray-500">
            Presiona <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> para enviar
          </p>
          <p className="text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift + Enter</kbd> para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
};