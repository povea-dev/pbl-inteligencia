import React, { useState, KeyboardEvent } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Send, Loader2 } from 'lucide-react';

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
  const { darkMode } = useTheme();
  const [input, setInput] = useState('');

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

  return (
    <div className={`border-t p-4 sm:p-6 backdrop-blur-lg ${
      darkMode 
        ? 'border-slate-700/50 bg-slate-800/80' 
        : 'border-slate-200/50 bg-white/80'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={disabled || isLoading}
              rows={3}
              className={`w-full resize-none border-2 rounded-xl px-4 sm:px-5 py-3 sm:py-4 pr-12 sm:pr-14 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:cursor-not-allowed transition-all placeholder-slate-400 ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                  : 'border-slate-200 text-slate-900 disabled:bg-slate-100'
              }`}
            />
            {isLoading && (
              <div className="absolute right-4 top-4">
                <Loader2 className={`w-5 h-5 animate-spin ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl hover:from-red-700 hover:to-slate-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:shadow-none flex items-center gap-2 self-end mb-2 text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar</span>
              </>
            )}
          </button>
        </div>
        <p className={`text-xs mt-2 sm:mt-3 text-center flex flex-wrap items-center justify-center gap-1 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span className="hidden sm:inline">Presiona</span>
          <kbd className={`px-1.5 sm:px-2 py-0.5 sm:py-1 border rounded text-xs font-mono ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-300'
          }`}>Enter</kbd>
          <span className="hidden sm:inline">para enviar,</span>
          <kbd className={`px-1.5 sm:px-2 py-0.5 sm:py-1 border rounded text-xs font-mono ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-300'
          }`}>Shift + Enter</kbd>
          <span className="hidden sm:inline">para nueva línea</span>
        </p>
      </div>
    </div>
  );
};