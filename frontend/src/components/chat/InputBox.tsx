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
    <div className={`border-t p-6 backdrop-blur-lg ${
      darkMode 
        ? 'border-slate-700/50 bg-slate-800/80' 
        : 'border-slate-200/50 bg-white/80'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={disabled || isLoading}
              rows={3}
              className={`w-full resize-none border-2 rounded-xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:cursor-not-allowed transition-all placeholder-slate-400 ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                  : 'border-slate-200 text-slate-900 disabled:bg-slate-100'
              }`}
            />
            {isLoading && (
              <div className="absolute right-4 top-4">
                <Loader2 className={`w-5 h-5 animate-spin ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:shadow-none flex items-center gap-2 self-end mb-2"
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
        <p className={`text-xs mt-3 text-center flex items-center justify-center gap-1 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Presiona</span>
          <kbd className={`px-2 py-1 border rounded text-xs font-mono ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-300'
          }`}>Enter</kbd>
          <span>para enviar,</span>
          <kbd className={`px-2 py-1 border rounded text-xs font-mono ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-300'
          }`}>Shift + Enter</kbd>
          <span>para nueva línea</span>
        </p>
      </div>
    </div>
  );
};