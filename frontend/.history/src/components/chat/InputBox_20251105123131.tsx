import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, ArrowRight, Zap } from 'lucide-react';

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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-8 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Guidance Text */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 px-4">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Analiza el problema utilizando el método PBL paso a paso</span>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe tu análisis del problema... Ejemplo: 'El problema trata sobre optimización de búsquedas. Primero, identificaría los algoritmos disponibles como búsqueda lineal y binaria...'"
              disabled={disabled || isLoading}
              rows={1}
              className="w-full resize-none border border-slate-300 rounded-2xl p-6 pr-16 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed bg-white shadow-lg text-slate-700 placeholder-slate-400 text-lg leading-relaxed transition-all duration-200"
            />
            
            {/* Character counter */}
            {input.length > 0 && (
              <div className="absolute bottom-3 right-4">
                <span className="text-sm text-slate-400 font-medium">
                  {input.length}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
            className="px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none font-semibold text-lg group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Enviar Análisis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
        
        {/* Shortcut hints */}
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-medium">Enter</kbd>
              <span>para enviar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-medium">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-medium">Enter</kbd>
              <span>para nueva línea</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 font-medium">
            Asistente PBL • IA Educativa
          </div>
        </div>
      </div>
    </div>
  );
};