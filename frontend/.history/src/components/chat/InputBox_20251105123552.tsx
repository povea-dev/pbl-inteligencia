import React, { useState, KeyboardEvent } from 'react';

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
    <div className="border-t border-gray-200 p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          disabled={disabled || isLoading}
          rows={3}
          className="flex-1 resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={disabled || isLoading || !input.trim()}
          className="px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex items-center gap-2 self-end"
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Presiona Enter para enviar, Shift + Enter para nueva línea
      </p>
    </div>
  );
};